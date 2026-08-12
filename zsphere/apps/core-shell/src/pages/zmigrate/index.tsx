import { loadMicroApp, MicroApp as MicroAppType } from "@zstack/qiankun";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

import Loader from "../../loader/index";
import { useRefreshZMigrateRuntime } from "../../utils/use-get-zmigrate";
import {
  ServiceUnavailable,
  MountFailed,
  VddkRequired,
} from "../exception/zmigrate";
import {
  createMountWatchdog,
  MOUNT_HARD_TIMEOUT_MS,
  MOUNT_SLOW_WARNING_MS,
  type MountWatchdog,
} from "./mount-watchdog";
import { useZmigrate } from "./use-zmigrate";
import { useVddkGuard } from "./vddk-guard";
import {
  createNotFoundTolerantRemoveChild,
  removeZmigrateBodyNode,
  shouldRedirectZmigrateBodyNode,
} from "./zmigrate-dom-proxy";

import styles from "./style.module.less";

const CONTAINER_ID = "qiankun-zmigrate-container";
const ZMIGRATE_QIANKUN_NAME = "zmigrate-core-shell";
const ZMIGRATE_BASE = "/zmigrate";
const ZMIGRATE_ENTRY = "/zmigrate-ui/";

/** Config fields that must be present before starting zmigrate micro-app */
const REQUIRED_CONFIG_FIELDS = [
  "gatewayHostIp",
  "platformAccountUuid",
  "platformRegionUuid",
  "zsMnServer",
  "sessionId",
] as const;

/** Check whether currentZMigrate has all required fields populated */
function isZMigrateConfigReady(
  config: Record<string, any> | undefined,
): boolean {
  if (!config) return false;
  return REQUIRED_CONFIG_FIELDS.every((key) => {
    const value = config[key];
    return typeof value === "string" && value.length > 0;
  });
}

/**
 * Zmigrate 微应用容器
 * 通过 qiankun loadMicroApp 加载 zmigrate 微应用
 *
 * 完整集成：DOM proxy, title proxy, route sync, exception handling
 */
export const Zmigrate = () => {
  const microAppRef = useRef<MicroAppType>();
  const [qiankunLoading, setQiankunLoading] = useState(true);
  const isMountedRef = useRef(false);
  const isMountingRef = useRef(false);
  const cleanupTimeoutRef = useRef<any>();
  const proxyRef = useRef<any>(null);
  const originalMethodsRef = useRef<any>(null);
  const mountWatchdogRef = useRef<MountWatchdog>();
  const titleProxyRef = useRef<any>(null);
  const originalTitleDescriptorRef = useRef<PropertyDescriptor | null>(null);
  const bodyPrototypeRemoveChildGuardRef = useRef<{
    originalRemoveChild: typeof HTMLBodyElement.prototype.removeChild;
    guardedRemoveChild: typeof HTMLBodyElement.prototype.removeChild;
  } | null>(null);
  const previousPathnameRef = useRef<string>("");

  const [currentZMigrate] = usePlatformStore((state) => [
    state.currentZMigrate,
  ]);
  const refreshZMigrateRuntime = useRefreshZMigrateRuntime();

  const { loading, exception, setMountFailed, verify } = useZmigrate();
  const { state: vddkGuardState, retry: retryVddkGuard } = useVddkGuard();

  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const isZmigratePath = pathname.startsWith("/zmigrate");
  const handleUploadVddk = useCallback(() => {
    navigate(
      "/virtualization-monitoring-om/migration-service?action=upload-vddk",
    );
  }, [navigate]);

  // 初始化 previousPathnameRef，避免刷新时误判
  useEffect(() => {
    if (!previousPathnameRef.current && pathname) {
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  // 获取当前路径相对于 base 的路径
  const getRelativePath = useCallback(() => {
    const fullPath = window.location.pathname;
    if (fullPath.startsWith(ZMIGRATE_BASE)) {
      return fullPath.slice(ZMIGRATE_BASE.length) || "/";
    }
    return "/";
  }, []);

  // 异常内容渲染（handleRetry 在 cleanupMicroApp 定义后注入）
  const handleRetryRef = useRef<() => void>();
  const exceptionContent = useMemo(() => {
    if (!isZmigratePath) return null;

    const onRetry = () => handleRetryRef.current?.();

    if (exception === "SERVICE_UNAVAILABLE") {
      return <ServiceUnavailable onRetry={onRetry} />;
    }

    if (exception === "MOUNT_FAILED") {
      return <MountFailed onRetry={onRetry} />;
    }

    return null;
  }, [isZmigratePath, exception]);

  // ========================
  // Title Proxy
  // ========================

  const createTitleProxy = useCallback(() => {
    if (titleProxyRef.current) {
      return; // 已经存在 title proxy，不重复创建
    }

    // 保存原始的 title descriptor
    originalTitleDescriptorRef.current =
      Object.getOwnPropertyDescriptor(Document.prototype, "title") || null;

    // 创建 title 的 getter/setter proxy
    const titleDescriptor = {
      get: function () {
        return originalTitleDescriptorRef.current?.get?.call(this) || "";
      },
      set: function (value: string) {
        // 检查调用栈，判断是否来自微应用
        const stack = new Error().stack || "";
        const isFromMicroApp =
          stack.includes("zmigrate") ||
          stack.includes("qiankun") ||
          stack.includes("micro-app");

        if (isFromMicroApp) {
          console.log("Blocked title change from zmigrate micro app:", value);
          return; // 阻止微应用更改标题
        }

        // 允许主应用更改标题
        return originalTitleDescriptorRef.current?.set?.call(this, value);
      },
      enumerable: true,
      configurable: true,
    };

    // 应用 title proxy
    Object.defineProperty(document, "title", titleDescriptor);
    titleProxyRef.current = titleDescriptor;

    console.log(
      "Title proxy created to protect document.title from zmigrate micro app",
    );
  }, []);

  // 清理 title proxy
  const cleanupTitleProxy = useCallback(() => {
    if (titleProxyRef.current && originalTitleDescriptorRef.current) {
      try {
        // 恢复原始的 title descriptor
        Object.defineProperty(
          document,
          "title",
          originalTitleDescriptorRef.current,
        );
        titleProxyRef.current = null;
        originalTitleDescriptorRef.current = null;
        console.log("Title proxy cleaned up");
      } catch (error) {
        console.warn("Error cleaning up title proxy:", error);
      }
    }
  }, []);

  // ========================
  // DOM Proxy
  // ========================

  const createBodyPrototypeRemoveChildGuard = useCallback(() => {
    if (
      typeof HTMLBodyElement === "undefined" ||
      bodyPrototypeRemoveChildGuardRef.current
    ) {
      return;
    }

    const originalRemoveChild = HTMLBodyElement.prototype.removeChild;
    const guardedRemoveChild =
      createNotFoundTolerantRemoveChild<HTMLBodyElement>(
        originalRemoveChild as (this: HTMLBodyElement, child: Node) => Node,
      ) as typeof HTMLBodyElement.prototype.removeChild;

    HTMLBodyElement.prototype.removeChild = guardedRemoveChild;
    bodyPrototypeRemoveChildGuardRef.current = {
      originalRemoveChild,
      guardedRemoveChild,
    };
  }, []);

  const cleanupBodyPrototypeRemoveChildGuard = useCallback(() => {
    if (typeof HTMLBodyElement === "undefined") {
      return;
    }

    const guard = bodyPrototypeRemoveChildGuardRef.current;
    if (!guard) {
      return;
    }

    if (HTMLBodyElement.prototype.removeChild === guard.guardedRemoveChild) {
      HTMLBodyElement.prototype.removeChild = guard.originalRemoveChild;
    }

    bodyPrototypeRemoveChildGuardRef.current = null;
  }, []);

  const createSafeProxy = useCallback(() => {
    if (proxyRef.current) {
      return; // 已经存在 Proxy，不重复创建
    }

    // 保存原始方法
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    const originalInsertBefore = document.body.insertBefore;

    originalMethodsRef.current = {
      appendChild: originalAppendChild,
      removeChild: originalRemoveChild,
      insertBefore: originalInsertBefore,
    };

    // 创建节点映射
    const nodeContainerMap = new WeakMap();
    const container =
      document.querySelector(
        `#${CONTAINER_ID} div[data-qiankun="${ZMIGRATE_QIANKUN_NAME}"]`,
      ) || document.querySelector(`#${CONTAINER_ID} > div:first-child`);

    if (!container) {
      console.warn("Zmigrate container not found, skipping proxy creation");
      return;
    }

    const isFromMicroApp = (node: unknown) =>
      shouldRedirectZmigrateBodyNode({
        node,
        container,
        isMapped:
          typeof node === "object" &&
          node !== null &&
          nodeContainerMap.has(node),
        qiankunName: ZMIGRATE_QIANKUN_NAME,
        stack: new Error().stack,
      });

    // 创建 Proxy
    proxyRef.current = {
      appendChild: new Proxy(originalAppendChild, {
        apply: (target, thisArg, args) => {
          try {
            const [node] = args;

            // 检查是否是微应用相关的节点
            if (isFromMicroApp(node)) {
              // 将节点添加到微应用容器而不是 body
              if (node instanceof Element) {
                node.setAttribute("data-zmigrate-portal-owner", "true");
              }
              container.appendChild(node);
              nodeContainerMap.set(node, container);
              return node;
            }

            // 其他情况使用原始方法
            return target.apply(thisArg, args as [Node]);
          } catch (error) {
            console.warn("Error in appendChild proxy:", error);
            // 如果出错，回退到原始方法
            return target.apply(thisArg, args as [Node]);
          }
        },
      }),

      removeChild: new Proxy(originalRemoveChild, {
        apply: (target, thisArg, args) => {
          try {
            const [node] = args;

            if (node instanceof Node) {
              return removeZmigrateBodyNode({
                node,
                mappedContainer: nodeContainerMap.get(node),
                cleanupMapping: () => {
                  nodeContainerMap.delete(node);
                },
                removeFromBody: (child) =>
                  target.apply(thisArg, [child] as [Node]),
              });
            }

            // 其他情况使用原始方法
            return target.apply(thisArg, args as [Node]);
          } catch (error) {
            console.warn("Error in removeChild proxy:", error);
            throw error;
          }
        },
      }),

      insertBefore: new Proxy(originalInsertBefore, {
        apply: (target, thisArg, args) => {
          try {
            const [node, referenceNode] = args;

            // 检查是否是微应用相关的节点
            if (isFromMicroApp(node)) {
              console.log(
                "Intercepting insertBefore for zmigrate micro app node:",
                node,
              );
              // 将节点插入到微应用容器
              if (node instanceof Element) {
                node.setAttribute("data-zmigrate-portal-owner", "true");
              }
              container.insertBefore(node, referenceNode);
              nodeContainerMap.set(node, container);
              return node;
            }

            // 其他情况使用原始方法
            return target.apply(thisArg, args as [Node, Node | null]);
          } catch (error) {
            console.warn("Error in insertBefore proxy:", error);
            // 如果出错，回退到原始方法
            return target.apply(thisArg, args as [Node, Node | null]);
          }
        },
      }),
    };

    // 替换原始方法
    document.body.appendChild = proxyRef.current.appendChild;
    document.body.removeChild = proxyRef.current.removeChild;
    document.body.insertBefore = proxyRef.current.insertBefore;

    // 标记为已代理
    (document.body.appendChild as any).__isProxied = true;
    (document.body.removeChild as any).__isProxied = true;
    (document.body.insertBefore as any).__isProxied = true;

    console.log("Safe proxy created for zmigrate micro app");
  }, []);

  // 清理 Proxy
  const cleanupProxy = useCallback(() => {
    if (proxyRef.current && originalMethodsRef.current) {
      try {
        // 恢复原始方法
        document.body.appendChild = originalMethodsRef.current.appendChild;
        document.body.removeChild = originalMethodsRef.current.removeChild;
        document.body.insertBefore = originalMethodsRef.current.insertBefore;
        originalMethodsRef.current.cleanupEventListeners?.();

        // 清理标记
        delete (document.body.appendChild as any).__isProxied;
        delete (document.body.removeChild as any).__isProxied;
        delete (document.body.insertBefore as any).__isProxied;

        proxyRef.current = null;
        originalMethodsRef.current = null;

        console.log("Safe proxy cleaned up");
      } catch (error) {
        console.warn("Error cleaning up proxy:", error);
      }
    }

    cleanupBodyPrototypeRemoveChildGuard();

    // 同时清理 title proxy
    cleanupTitleProxy();
  }, [cleanupBodyPrototypeRemoveChildGuard, cleanupTitleProxy]);

  // ========================
  // 微应用生命周期管理
  // ========================

  // 清理微应用
  const cleanupMicroApp = useCallback(async () => {
    // 清理所有超时
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = undefined;
    }
    mountWatchdogRef.current?.cancel();
    mountWatchdogRef.current = undefined;

    if (microAppRef?.current) {
      try {
        const status = microAppRef.current.getStatus();
        console.log("Cleaning up zmigrate micro app with status:", status);

        if (status === "MOUNTED" || status === "LOADING_SOURCE_CODE") {
          await microAppRef.current.unmount();
        }
      } catch (error) {
        console.warn("Failed to unmount zmigrate micro app:", error);
      } finally {
        microAppRef.current = undefined;
      }
    }

    // 微应用卸载过程中会清理它创建的 body portal，需要先保留 proxy。
    cleanupProxy();

    // 清理容器
    const container = document.querySelector(`#${CONTAINER_ID}`);
    if (container) {
      container.innerHTML = "";
    }

    isMountedRef.current = false;
    isMountingRef.current = false;
    setQiankunLoading(false);
  }, [cleanupProxy]);

  // 注入重试回调（此处 cleanupMicroApp 已定义）
  useEffect(() => {
    handleRetryRef.current = () => {
      cleanupMicroApp().then(() => {
        verify();
      });
    };
  }, [cleanupMicroApp, verify]);

  const currentZMigrateRef = useRef(currentZMigrate);
  const locationRef = useRef(location);

  useEffect(() => {
    currentZMigrateRef.current = currentZMigrate;
  }, [currentZMigrate]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // 启动微应用 — 使用 ref 读取最新值，保持引用稳定
  const startMicroApp = useCallback(async () => {
    if (vddkGuardState !== "ready") {
      return;
    }
    if (isMountedRef.current || isMountingRef.current) {
      console.log("Zmigrate micro app already mounted/mounting, skipping");
      return;
    }

    isMountingRef.current = true;

    // 等待容器准备就绪
    const waitForContainer = (): Promise<Element> => {
      return new Promise((resolve, reject) => {
        const container = document.querySelector(`#${CONTAINER_ID}`);
        if (container) {
          resolve(container);
          return;
        }

        // 如果容器不存在，等待一段时间后重试
        let retryCount = 0;
        const maxRetries = 20;
        const checkContainer = () => {
          const container = document.querySelector(`#${CONTAINER_ID}`);
          if (container) {
            resolve(container);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkContainer, 100);
          } else {
            reject(
              new Error("Zmigrate container not found after maximum retries"),
            );
          }
        };

        setTimeout(checkContainer, 100);
      });
    };

    try {
      console.log("Starting zmigrate micro app...");
      setQiankunLoading(true);

      const refreshedZMigrate = await refreshZMigrateRuntime(
        "before-mount-zmigrate",
      );
      if (refreshedZMigrate) {
        currentZMigrateRef.current = refreshedZMigrate;
      }

      if (!isZMigrateConfigReady(currentZMigrateRef.current)) {
        isMountingRef.current = false;
        setQiankunLoading(false);
        return;
      }

      // 立即创建 title proxy，防止微应用在启动过程中更改标题
      createTitleProxy();

      // 等待容器准备就绪
      await waitForContainer();

      // 使用 ref 读取最新 pathname
      const currentPathname = locationRef.current.pathname;
      const relativePath = currentPathname.startsWith(ZMIGRATE_BASE)
        ? currentPathname.slice(ZMIGRATE_BASE.length) || "/"
        : "/";
      previousPathnameRef.current = currentPathname;

      microAppRef.current = loadMicroApp(
        {
          name: ZMIGRATE_QIANKUN_NAME,
          entry: ZMIGRATE_ENTRY,
          container: `#${CONTAINER_ID}`,
          props: {
            setLoading: (value: boolean) => {
              setQiankunLoading(value);
            },
            base: ZMIGRATE_BASE,
            loader: () => null,
            autoSetLoading: false,
            hideLeftNav: true,
            // 传递当前路径信息，让微应用知道路由变化
            pathname: currentPathname,
            relativePath: relativePath,
            getPropsFromMaster: () => {
              // 与 toggle-language 写入的 key 对齐（umi_locale），
              // 兼容历史上可能存在的 locale key
              const locale =
                getLocaleFromStorage() || localStorage.getItem("locale");
              const storeValue = currentZMigrateRef.current ?? {};

              return {
                locale,
                currentZMigrate: storeValue,
              };
            },
          },
        },
        {
          globalContext: window,
          autoStart: false,
          sandbox: {
            // loose: true 使用 LegacySandbox 而非 ProxySandbox。
            // LegacySandbox 直接在真实 window 上读写（但跟踪变更以便卸载时恢复），
            // 不会创建 fakeWindow Proxy。zmigrate 内部使用 Module Federation
            // 加载子模块，MF runtime 需要在真实 window 上注册全局变量
            // （如 __FEDERATION__），ProxySandbox 会拦截 window 访问导致
            // MF remote 模块注册在 proxy 上而非真实 window → 模块加载失败。
            loose: true,
            strictStyleIsolation: false,
            // ZMigration CSS is scoped at build time by postcss-zmigrate-scope.
            // Avoid qiankun runtime selector rewriting here, otherwise MF expose
            // styles can be double-scoped and fail to match after hot package swap.
            experimentalStyleIsolation: false,
          },
        },
        {},
      );

      // 冷缓存下 Module Federation 资源加载可能超过 30 秒：先告警，
      // 仅在达到硬超时后才进入挂载失败页。
      mountWatchdogRef.current = createMountWatchdog({
        onSlow: () => {
          console.warn("Zmigrate micro app mount is slow; still waiting", {
            warningMs: MOUNT_SLOW_WARNING_MS,
            hardTimeoutMs: MOUNT_HARD_TIMEOUT_MS,
          });
        },
        onTimeout: () => {
          console.error("Zmigrate micro app mount exceeded hard timeout", {
            hardTimeoutMs: MOUNT_HARD_TIMEOUT_MS,
          });
          setQiankunLoading(false);
          setMountFailed();
          void cleanupMicroApp();
        },
      });

      // 等待微应用挂载完成
      await microAppRef.current.mountPromise;

      // qiankun 会 patch HTMLBodyElement.prototype.removeChild；
      // 这里在它完成 patch 后增加 NotFoundError 兜底。
      createBodyPrototypeRemoveChildGuard();

      mountWatchdogRef.current?.cancel();
      mountWatchdogRef.current = undefined;

      // 防止竞态：如果超时回调已经触发了 cleanup，则不再继续
      if (!microAppRef.current || !isMountingRef.current) {
        return;
      }

      console.log("Zmigrate micro app mounted successfully");

      // 延迟创建 DOM Proxy，确保微应用完全加载
      cleanupTimeoutRef.current = setTimeout(() => {
        cleanupTimeoutRef.current = undefined;
        if (
          microAppRef.current &&
          isMountedRef.current &&
          locationRef.current.pathname.startsWith(ZMIGRATE_BASE)
        ) {
          createSafeProxy();
        }
      }, 100);

      isMountedRef.current = true;
      isMountingRef.current = false;
      setQiankunLoading(false);
    } catch (error) {
      console.error("Failed to mount zmigrate micro app:", error);

      mountWatchdogRef.current?.cancel();
      mountWatchdogRef.current = undefined;

      isMountingRef.current = false;
      setMountFailed();
      setQiankunLoading(false);
    }
  }, [
    createTitleProxy,
    createSafeProxy,
    createBodyPrototypeRemoveChildGuard,
    cleanupMicroApp,
    refreshZMigrateRuntime,
    setMountFailed,
    vddkGuardState,
  ]);

  // ========================
  // 路由同步
  // ========================

  // 监听路由变化，静默同步（不触发卸载）
  useEffect(() => {
    const microApp = microAppRef.current;
    if (!microApp || !isMountedRef.current || qiankunLoading) {
      return;
    }

    const currentPathname = location.pathname;
    const previousPathname = previousPathnameRef.current;

    if (
      currentPathname === previousPathname ||
      !currentPathname.startsWith(ZMIGRATE_BASE)
    ) {
      return;
    }

    const relativePath = getRelativePath();
    const status = microApp.getStatus();

    if (status === "MOUNTED") {
      try {
        if (typeof microApp.update === "function") {
          microApp.update({
            pathname: currentPathname,
            relativePath: relativePath,
          });
        }

        const popStateEvent = new PopStateEvent("popstate", {
          state: { pathname: currentPathname },
        });
        window.dispatchEvent(popStateEvent);
      } catch (error) {
        console.warn("Failed to update zmigrate micro app props:", error);
      }
    }

    previousPathnameRef.current = currentPathname;
  }, [location.pathname, qiankunLoading, getRelativePath]);

  // ========================
  // 主生命周期
  // ========================

  // 判断宿主的 currentZMigrate 数据是否已就绪
  // useGetZMigrate 通过 GraphQL 异步加载数据到 platformStore，
  // 在数据到达前 currentZMigrate 只有 { installed: false }，缺少
  // gatewayHostIp / platformAccountUuid / platformRegionUuid /
  // zsMnServer / sessionId。
  // 如果在数据就绪前启动子应用，useMasterZMigrateConfig 会因轮询
  // 超时而报错。因此必须等 config 完整后再 startMicroApp。
  const configReady = isZMigrateConfigReady(currentZMigrate);

  useEffect(() => {
    if (loading || exception || vddkGuardState !== "ready") {
      if (isMountedRef.current) {
        cleanupMicroApp();
      }
      setQiankunLoading(false);
      return;
    }

    // 等待 currentZMigrate 数据就绪后再启动子应用
    if (!configReady) {
      return;
    }

    if (!isMountedRef.current) {
      cleanupMicroApp().then(() => {
        setTimeout(() => {
          startMicroApp();
        }, 200);
      });
    }
  }, [
    loading,
    exception,
    vddkGuardState,
    configReady,
    cleanupMicroApp,
    startMicroApp,
  ]);

  useEffect(() => {
    return () => {
      console.log("Cleaning up zmigrate micro app on unmount...");
      isMountedRef.current = false;
      cleanupMicroApp();
    };
  }, [cleanupMicroApp]);

  return (
    <div className={styles.content}>
      <Loader
        loading={
          loading ||
          vddkGuardState === "loading" ||
          (vddkGuardState === "ready" && (qiankunLoading || !configReady))
        }
      />

      {exceptionContent}

      {!exceptionContent &&
        (vddkGuardState === "missing" || vddkGuardState === "error") && (
          <VddkRequired
            state={vddkGuardState}
            onUpload={handleUploadVddk}
            onRetry={() => void retryVddkGuard()}
          />
        )}

      <div
        id={CONTAINER_ID}
        style={{
          display:
            exceptionContent || vddkGuardState !== "ready" ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default Zmigrate;
