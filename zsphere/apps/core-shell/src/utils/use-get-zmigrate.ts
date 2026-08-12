import { gql, useApolloClient } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { bus, ZMIGRATE_RUNTIME_REFRESH_EVENT } from "@zstack/zsphere-utils";
import { useCallback, useEffect, useRef } from "react";

import {
  areCurrentZMigrateStatesEqual,
  buildCurrentZMigrateState,
  shouldFetchZMigrateRuntime,
  shouldRefreshZMigrateRuntimeOnResume,
} from "./zmigrate-runtime-state";
import type { CurrentZMigrateState } from "./zmigrate-runtime-state";

// 轻量 query getZMigrateRuntimeConfig：
// 主要瓶颈 GetZMigrateInfosAction 已经从 BFF 中砍掉，
// 只取 zmigrate 子应用启动需要的：
//   - gatewayHostIp + globalConfigs（来自 getZMigrateRuntimeConfig）
//   - 镜像 uuid + 包状态（来自 getMigrationServicePackage）
const GET_ZMIGRATE_RUNTIME = gql`
  query getZMigrateRuntimeData {
    getZMigrateRuntimeConfig {
      gatewayHostIp
      zsMnServer
      globalConfigs {
        gatewaySshPassword
        platformRegionUuid
        platformAccountUuid
      }
    }
    getMigrationServicePackage {
      status
      gatewayImageUuid
      linuxBootImageUuid
      windowsBootImageUuid
    }
    getCurrentTime {
      timezone
    }
  }
`;

let latestRuntimeRefreshRequestId = 0;
let lastRuntimeFetchedAt = 0;
let inFlightRuntimeRefresh:
  | Promise<CurrentZMigrateState | undefined>
  | undefined;

/**
 * 执行一次 zmigrate runtime 刷新，并在状态真实变化时写入 platformStore。
 *
 * 这个 hook 不做常驻轮询。调用方在关键边界主动触发：
 * - host boot
 * - migration-service 包状态变化事件
 * - 浏览器 focus / visibility 恢复
 * - zmigrate 微应用挂载前
 */
export const useRefreshZMigrateRuntime = () => {
  const apolloClient = useApolloClient();
  const [currentZMigrate, setCurrentZMigrate] = usePlatformStore((state) => [
    state.currentZMigrate,
    state.setCurrentZMigrate,
  ]);

  const currentZMigrateRef = useRef(currentZMigrate);

  useEffect(() => {
    currentZMigrateRef.current = currentZMigrate;
  }, [currentZMigrate]);

  return useCallback(
    async (reason?: string): Promise<CurrentZMigrateState | undefined> => {
      if (
        !shouldFetchZMigrateRuntime({
          reason,
          lastFetchedAt: lastRuntimeFetchedAt,
          now: Date.now(),
        })
      ) {
        return currentZMigrateRef.current;
      }

      if (inFlightRuntimeRefresh) {
        return inFlightRuntimeRefresh;
      }

      const requestId = ++latestRuntimeRefreshRequestId;
      inFlightRuntimeRefresh = (async () => {
        try {
          const { data: zmigrateData } = await apolloClient.query({
            query: GET_ZMIGRATE_RUNTIME,
            fetchPolicy: "no-cache",
            errorPolicy: "ignore",
          });

          if (requestId !== latestRuntimeRefreshRequestId) {
            return currentZMigrateRef.current;
          }

          if (!zmigrateData) {
            return currentZMigrateRef.current;
          }

          const sessionId = localStorage.getItem("sessionId") ?? "";
          const zmigrateState = buildCurrentZMigrateState(
            zmigrateData,
            sessionId,
          );
          lastRuntimeFetchedAt = Date.now();

          if (
            !areCurrentZMigrateStatesEqual(
              currentZMigrateRef.current,
              zmigrateState,
            )
          ) {
            currentZMigrateRef.current = zmigrateState;
            setCurrentZMigrate(zmigrateState);
          }

          return zmigrateState;
        } finally {
          if (requestId === latestRuntimeRefreshRequestId) {
            inFlightRuntimeRefresh = undefined;
          }
        }
      })();

      return inFlightRuntimeRefresh;
    },
    [apolloClient, setCurrentZMigrate],
  );
};

/**
 * 独立的 zmigrate 状态获取 hook
 *
 * 职责：
 * 1. 应用启动时 no-cache 拉取 runtime，覆盖 localStorage 中可能持久化的旧值
 * 2. 监听 migration-service 发出的包状态变化事件，按需刷新
 * 3. 浏览器重新聚焦/可见时按 TTL 兜底刷新，避免后台清包后长期 stale
 */
export const useGetZMigrate = () => {
  const refreshZMigrateRuntime = useRefreshZMigrateRuntime();

  useEffect(() => {
    refreshZMigrateRuntime("boot").catch(() => {
      /* no-op: runtime freshness is retried by route/focus/action boundaries */
    });
  }, [refreshZMigrateRuntime]);

  useEffect(() => {
    const handleRefresh = (reason?: string) => {
      refreshZMigrateRuntime(reason).catch(() => {
        /* same as boot */
      });
    };

    bus.addListener(ZMIGRATE_RUNTIME_REFRESH_EVENT, handleRefresh);

    return () => {
      bus.removeListener(ZMIGRATE_RUNTIME_REFRESH_EVENT, handleRefresh);
    };
  }, [refreshZMigrateRuntime]);

  useEffect(() => {
    const handleResume = () => {
      if (
        document.visibilityState !== "visible" ||
        !shouldRefreshZMigrateRuntimeOnResume(lastRuntimeFetchedAt, Date.now())
      ) {
        return;
      }

      refreshZMigrateRuntime("resume").catch(() => {
        /* same as boot */
      });
    };

    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);

    return () => {
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [refreshZMigrateRuntime]);
};
