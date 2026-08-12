import { useCallback, useEffect, useState } from "react";

export type ZmigrateExceptionType =
  | false
  | "SERVICE_UNAVAILABLE"
  | "MOUNT_FAILED"
  | "AUTH_FAILED";

const ZMIGRATE_ENTRY = "/zmigrate-ui/";
const HEALTH_CHECK_TIMEOUT = 15000;
const MAX_HEALTH_RETRIES = 3;
const HEALTH_RETRY_DELAY = 2000;

/**
 * Zmigrate 微应用状态管理 Hook
 *
 * 简化版的 useStorage hook，不需要 SSO 逻辑
 * zmigrate 是自有产品，直接使用 ZSV 的 session/token
 *
 * 功能：
 * 1. 健康检查：检测 zmigrate 服务是否可用
 * 2. Token 读取：从 localStorage 获取当前 session token
 * 3. 状态管理：isReady / isError / errorType
 */
export const useZmigrate = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [exception, setException] = useState<ZmigrateExceptionType>(false);

  /**
   * 健康检查 - 检测 zmigrate 服务是否已部署并可访问
   * 通过 fetch 请求 /zmigrate-ui/ 入口页面来判断
   */
  const healthCheck = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; attempt < MAX_HEALTH_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          HEALTH_CHECK_TIMEOUT,
        );

        const response = await fetch(ZMIGRATE_ENTRY, {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-cache",
        });

        clearTimeout(timeoutId);

        // 2xx 或 3xx 都认为服务可用
        if (response.ok || (response.status >= 300 && response.status < 400)) {
          return true;
        }
      } catch {
        // 网络错误或超时
      }

      // 非最后一次尝试时等待后重试（无论是网络错误还是非 OK 响应）
      if (attempt < MAX_HEALTH_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, HEALTH_RETRY_DELAY));
      }
    }
    return false;
  }, []);

  /**
   * 获取当前 session token
   * zmigrate 使用 ZSV 的 session，直接从 localStorage 读取
   */
  const getToken = useCallback((): string => {
    return localStorage.getItem("sessionId") || "";
  }, []);

  /**
   * 验证 zmigrate 服务是否可用
   */
  const verify = useCallback(async () => {
    setLoading(true);
    setException(false);

    // 1. 检查 token 是否存在
    const token = getToken();
    if (!token) {
      setLoading(false);
      setException("AUTH_FAILED");
      return;
    }

    // 2. 健康检查
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      setLoading(false);
      setException("SERVICE_UNAVAILABLE");
      return;
    }

    // 3. 服务可用，准备就绪
    setLoading(false);
    setException(false);
  }, [getToken, healthCheck]);

  /**
   * 标记挂载失败
   */
  const setMountFailed = useCallback(() => {
    setException("MOUNT_FAILED");
    setLoading(false);
  }, []);

  // 组件挂载时自动执行验证
  useEffect(() => {
    verify();
  }, [verify]);

  return {
    loading,
    exception,
    verify,
    getToken,
    setMountFailed,
    isReady: !loading && !exception,
    isError: !!exception,
    errorType: exception,
  };
};
