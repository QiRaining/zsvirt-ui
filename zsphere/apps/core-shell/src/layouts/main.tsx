import cls from "classnames";
import { memo, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";

import { useGetZMigrate } from "@/utils/use-get-zmigrate";

import { useAuth } from "../debug/auth";
import { initTreeStatus } from "../hooks/use-persist-tree-state";
import { useBootstrapEnv } from "../utils/use-bootstrap-env";
import { useZOps } from "../utils/use-zops";
import RouterAuth from "./components/router-auth";
import Footer from "./footer";
import VirtualizationGlobalAlert from "./global-alert";
import Header from "./header";
import { LeftNav } from "./left-nav";

import style from "./style.module.less";

/**
 * 路由切换时清理 Apollo 缓存中不再被活跃查询引用的数据
 *
 * 原理：
 * - ROOT_QUERY 保存了所有历史查询结果（即使组件已 unmount）
 * - cache.gc() 从 ROOT_QUERY 出发遍历 __ref 引用，所以这些"挂在 ROOT_QUERY 上的旧数据"
 *   永远是"可达"的，gc 不会回收它们
 * - 必须先 evict 掉 ROOT_QUERY 中不再被活跃 watchQuery 监听的字段，
 *   切断引用链后，gc() 才能回收那些孤立的规范化实体
 *
 * 安全性：
 * - getObservableQueries('active') 只返回有订阅者的 query（mounted 的 useQuery/watchQuery）
 * - 路由切换时，旧页面组件已 unmount，其 query 不再 active → 被 evict
 * - 全局组件（Header、Footer action polling 等）的 query 仍然 active → 保留
 * - 新页面的 useQuery 使用 fetchPolicy: "network-only" 首次一定走网络请求，不依赖缓存
 */
function useCacheCleanupOnRouteChange() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      const client = window.g_main?.apolloClient;
      if (!client) {
        return;
      }

      const cache = client.cache;

      // 收集当前所有活跃查询的顶层字段名
      // 例如 useQuery(QUERY_VM_LIST) 对应 ROOT_QUERY 中的 "vmInstanceList" 字段
      const activeFieldNames = new Set<string>();
      try {
        const observableQueries = client.getObservableQueries("active");
        observableQueries.forEach((oq: { query?: any }) => {
          const definition = oq.query?.definitions?.[0];
          if (
            definition?.kind === "OperationDefinition" &&
            definition.selectionSet
          ) {
            for (const sel of definition.selectionSet.selections) {
              if (sel.kind === "Field") {
                activeFieldNames.add(sel.name.value);
              }
            }
          }
        });
      } catch {
        // getObservableQueries 不可用时 fallback 到仅 gc
        cache.gc();
        return;
      }

      // 从 ROOT_QUERY 中 evict 不再活跃的查询字段
      // extract() 返回的 ROOT_QUERY key 格式: "fieldName" 或 "fieldName({\"arg\":...})"
      const extracted = cache.extract();
      const rootQuery = extracted["ROOT_QUERY"];
      if (rootQuery) {
        const evictedFields = new Set<string>();
        for (const storeFieldName of Object.keys(rootQuery)) {
          if (storeFieldName === "__typename") {
            continue;
          }
          const fieldName = storeFieldName.split("(")[0];
          if (
            !activeFieldNames.has(fieldName) &&
            !evictedFields.has(fieldName)
          ) {
            cache.evict({ id: "ROOT_QUERY", fieldName });
            evictedFields.add(fieldName);
          }
        }
      }

      // 引用链切断后，gc 可以回收孤立的规范化实体
      cache.gc();
    }
  }, [location.pathname]);
}

const RenderHeader = () => {
  // 无头路径
  if (["/monitor", "/vmware-console"].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <VirtualizationGlobalAlert />
      <Header />
    </>
  );
};

const MainLayout = () => {
  // 判断是否支持巡检
  useZOps();

  // 查询 UI 环境配置（开放平台、bootstrap 状态）
  useBootstrapEnv();

  // 获取 zmigrate 迁移服务状态，写入 platformStore
  useGetZMigrate();

  // 获取授权信息
  useAuth();

  useCacheCleanupOnRouteChange();

  useEffect(() => {
    initTreeStatus();
  }, []);

  const location = useLocation();

  const renderContent = () => {
    return <Outlet />;
  };

  const renderLayout = () => (
    <div className={style.mainLayout}>
      {/* <SettingDrawer /> */}
      <RenderHeader />
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!location.pathname.includes("virtualization-wizard") && <LeftNav />}
        <div className={cls(style.mainContainer, "ROOT_CONTAINER")}>
          <RouterAuth>{renderContent()}</RouterAuth>
        </div>
      </div>
      <Footer />
    </div>
  );

  return renderLayout();
};

export default memo(MainLayout);
