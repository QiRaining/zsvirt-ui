import { gql, useLazyQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MigrationServiceInfo, UpgradeTask } from "../types";

const GET_ZMIGRATE_INFOS = gql`
  query getZMigrateInfos {
    getZMigrateInfos {
      status
      version
      platformCount
      gatewayCount
      taskCount
      startTime
      vddkUploaded
      hasRunningTask
      upgradeTasks {
        uuid
        version
        status
      }
      firstGatewayVm {
        uuid
        name
        state
        cpuNum
        memorySize
        storageSize
        defaultIp
        createDate
        type
        hypervisorType
        platform
        hostUuid
      }
    }
  }
`;

const UPGRADE_POLL_INTERVAL = 5000;
const CACHE_KEY = "zmigrate_service_info";

interface UseMigrationServiceInfoResult {
  serviceInfo: MigrationServiceInfo;
  upgradeTasks: UpgradeTask[];
  hasRunningTask: boolean;
  loading: boolean;
  fetchServiceInfo: () => void;
  startUpgradePolling: () => void;
  stopUpgradePolling: () => void;
}

interface CachedMigrateInfos {
  serviceInfo: MigrationServiceInfo;
  upgradeTasks: UpgradeTask[];
  hasRunningTask: boolean;
}

function readCache(): CachedMigrateInfos | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedMigrateInfos;
  } catch {
    return null;
  }
}

function writeCache(data: CachedMigrateInfos): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage 满或不可用时静默忽略
  }
}

const EMPTY_SERVICE_INFO: MigrationServiceInfo = {
  uuid: "",
  status: "Running",
  version: "-",
  platformCount: 0,
  gatewayCount: 0,
  taskCount: 0,
  startTime: "",
};

export const useMigrationServiceInfo = (): UseMigrationServiceInfoResult => {
  const cached = useMemo(() => readCache(), []);
  const hasCachedData = cached !== null;

  // Track whether we have ever successfully loaded data (from cache or network).
  // Once true, subsequent polls/refreshes should never show the loading spinner.
  const hasEverLoadedRef = useRef<boolean>(hasCachedData);

  const [serviceInfo, setServiceInfo] = useState<MigrationServiceInfo>(
    () => cached?.serviceInfo ?? EMPTY_SERVICE_INFO,
  );
  const [upgradeTasks, setUpgradeTasks] = useState<UpgradeTask[]>(
    () => cached?.upgradeTasks ?? [],
  );
  const [hasRunningTask, setHasRunningTask] = useState<boolean>(
    () => cached?.hasRunningTask ?? false,
  );

  const [fetchInfo, { data, loading }] = useLazyQuery(GET_ZMIGRATE_INFOS, {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  });

  const pollIntervalRef = useRef<number | null>(null);
  const migrateInfos = data?.getZMigrateInfos;

  // 当接口返回数据时，更新 state 和 sessionStorage 缓存
  useEffect(() => {
    if (!migrateInfos) return;

    hasEverLoadedRef.current = true;

    const info: MigrationServiceInfo = {
      uuid: migrateInfos.uuid ?? "",
      status: migrateInfos.status ?? "Unknown",
      version: migrateInfos.version ?? "",
      platformCount: migrateInfos.platformCount ?? 0,
      gatewayCount: migrateInfos.gatewayCount ?? 0,
      taskCount: migrateInfos.taskCount ?? 0,
      startTime: migrateInfos.startTime ?? "",
      vddkUploaded: migrateInfos.vddkUploaded,
      firstGatewayVm: migrateInfos.firstGatewayVm ?? undefined,
    };
    const tasks: UpgradeTask[] = migrateInfos.upgradeTasks ?? [];
    const running: boolean = migrateInfos.hasRunningTask ?? false;

    setServiceInfo(info);
    setUpgradeTasks(tasks);
    setHasRunningTask(running);

    writeCache({
      serviceInfo: info,
      upgradeTasks: tasks,
      hasRunningTask: running,
    });
  }, [migrateInfos]);

  const fetchServiceInfo = useCallback(() => {
    fetchInfo();
  }, [fetchInfo]);

  const stopUpgradePolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startUpgradePolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      fetchServiceInfo();
      return;
    }
    fetchServiceInfo();
    pollIntervalRef.current = window.setInterval(
      fetchServiceInfo,
      UPGRADE_POLL_INTERVAL,
    );
  }, [fetchServiceInfo]);

  // 当升级任务不再 running 时自动停止轮询
  useEffect(() => {
    if (pollIntervalRef.current === null) return;
    const hasRunning = upgradeTasks.some((t) => t.status === "running");
    if (!hasRunning) {
      stopUpgradePolling();
      fetchServiceInfo();
    }
  }, [upgradeTasks, stopUpgradePolling, fetchServiceInfo]);

  // 初始加载时如果有 running 的升级任务，自动开始轮询
  useEffect(() => {
    const hasRunning = upgradeTasks.some((t) => t.status === "running");
    if (hasRunning && pollIntervalRef.current === null) {
      startUpgradePolling();
    }
  }, [upgradeTasks, startUpgradePolling]);

  // 组件卸载时清理
  useEffect(() => {
    return () => stopUpgradePolling();
  }, [stopUpgradePolling]);

  // 只在从未成功加载过数据且正在请求时才显示 loading。
  // 一旦数据加载成功（无论来自缓存还是网络），后续轮询/刷新不再显示 loading。
  const showLoading = !hasEverLoadedRef.current && loading;

  return {
    serviceInfo,
    upgradeTasks,
    hasRunningTask,
    loading: showLoading,
    fetchServiceInfo,
    startUpgradePolling,
    stopUpgradePolling,
  };
};
