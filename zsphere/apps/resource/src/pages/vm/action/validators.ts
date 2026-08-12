import { gql, useApolloClient } from "@apollo/client";
import {
  VmInstanceState,
  SchedulerJobState,
  Op,
  HostState,
  HostStatus,
} from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VmInstancePerformance,
} from "@zstack/zsphere-types/graphql";
import { isVhostStorage, isZbsStorage } from "@zstack/zsphere-utils";
import { includes, get, some, isNil } from "lodash-es";
import { useRef } from "react";

import { canChangeDataStorage } from "./migrate/change-primary-storage-helper";

const { apolloClient } = window.g_main;

// ZSV 创建虚拟机
export const verifyCreateInstance = async (_current: any, source: any) => {
  //
  if (
    source?.__typename === "PrimaryStorageVO" &&
    source?.attachedClusterUuids?.length === 0
  ) {
    return false;
  }
  if (
    source?.__typename === "Zone" &&
    source?.clusterCount === 0 &&
    source?.hostCount === 0 &&
    source?.primaryStorageCount === 0
  ) {
    return false;
  }
  if (
    source?.__typename === "Cluster" &&
    source?.primaryStorageCount === 0 &&
    source?.hostNum === 0
  ) {
    return false;
  }
  if (
    source?.__typename === "HostVO" &&
    (source?.state !== HostState.Enabled ||
      source?.status !== HostStatus.Connected)
  ) {
    return false;
  }
  return true;
};

export const verifyConverToTemplate = async (current: IVM) => {
  return current.state === VmInstanceState.Stopped;
};

export const verifyCloneToTemplate = async (current: IVM) => {
  return includes(
    [VmInstanceState.Stopped, VmInstanceState.Running, VmInstanceState.Paused],
    current.state,
  );
};

export const verifyDeleteVm = async (current: IVM) => {
  return current.state !== VmInstanceState.Unknown;
};

export const verifyClone = async (current: IVM) => {
  /**
   * 1.存在共享盘
   * 3.存在RDM(ScsiLun)盘
   */
  const { attachedShareableVolumeUuidList = [], haveScsiLun } = current;
  if (attachedShareableVolumeUuidList.length > 0 || haveScsiLun) {
    return false;
  }
  return true;
};

export const verifyNotRunning = (current: IVM) => {
  return current?.state !== "Running";
};

export const verifyWithGqa = (current: IVM) => {
  return current?.guestToolsState?.qgaState === "Running";
};

export const verifyIsShareable = (current: IVM) => {
  const {
    attachedShareableVolumeUuidList = [],
    state,
    haveScsiLun,
  } = current || {};
  /**
   * 1.存在共享盘
   * 2.虚拟机状态为Destroyed
   * 3.存在RDM(ScsiLun)盘
   */
  if (
    attachedShareableVolumeUuidList.length > 0 ||
    state === VmInstanceState.Destroyed ||
    haveScsiLun
  ) {
    return false;
  }
  return true;
};

export const verrifyVmStatusCanDeleteOrRemove = async (current: IVM) => {
  const matchStatus = [
    VmInstanceState.Running,
    VmInstanceState.Paused,
    VmInstanceState.Error,
    VmInstanceState.Unknown,
  ];
  const state: any = current?.state || "";
  return !matchStatus.includes(state);
};

export const verifyBackup = async (_current: any, source: any) => {
  /**
   * 云主机状态为：['Running', 'Paused', 'Stopped', 'Crashed]
   */

  const current = (source?.current || _current) as IVM;
  const validVmStates = ["Running", "Paused", "Stopped", "Crashed"];
  const attachedVmState = current?.state;

  return includes(validVmStates, attachedVmState);
};

//灾备服务配额限制
export const verifyDisasterRecoveryLicense = async () => {
  return true;
};

// 云主机挂载灾备任务
export const verifyAttachBackupJob = async (_current: IVM) => {
  if (_current.primaryStorage?.defaultProtocol === "Vhost") {
    return false;
  }
  return !_current?.backupTaskType;
};

export const verifyCreateBackupJob = (current: IVM) => {
  if (current.primaryStorage?.defaultProtocol === "Vhost") {
    return false;
  }
  return (
    current.state === VmInstanceState.Running ||
    current.state === VmInstanceState.Paused
  );
};

export const verifyEnableBackupJob = (current: IVM) => {
  return current.backupJob?.state === SchedulerJobState.Disabled;
};

export const verifyDisableBackupJob = (current: IVM) => {
  return current.backupJob?.state === SchedulerJobState.Enabled;
};

// 从指定主机启动
export const verifyStartFromHost = (current: IVM) => {
  // 本地主存储上的云主机不支持指定主机启动。——本地主存储上的VM的rootVolume在host上，如果能指定，那么就相当于做了迁移。
  if (current?.state !== "Stopped") {
    return false;
  }
  return get(current, ["primaryStorage", "type"]) !== "LocalStorage";
};

// 没有选中
export const verifyNotSelect = (selectedList: IVM[]): boolean => {
  return selectedList?.length <= 0 || !selectedList;
};

// 单选
export const verifySingleSelect = (selectedList: IVM[]): boolean => {
  return selectedList.length === 1;
};

// 单选，且 UUID 非空
export const verifySingleSelectWithUuid = (selectedList: IVM[]): boolean => {
  return selectedList.length === 1 && !!selectedList[0].uuid;
};

// 多选
export const verifyMultiSelect = (selectedList: IVM[]): boolean => {
  return selectedList.length >= 1;
};

// cdp恢复中禁止操作
export const verifyActionWithCdpRecover = (current: IVM): boolean => {
  return !includes(
    [VmInstanceState.VolumeRecovering, VmInstanceState.NoState],
    current.state,
  );
};

export const verifyDelete = async (current: IVM) => {
  const { data } = await apolloClient.query({
    query: gql`
      query globalConfig {
        globalConfig(
          category: "ui"
          name: "vmInstance.anti.deletion.protection"
        ) {
          value
          uuid
        }
      }
    `,
  });

  const vmInstanceDeletionPolicy: boolean =
    data?.globalConfig?.value === "true";
  if (vmInstanceDeletionPolicy) {
    return includes(
      [VmInstanceState.Unknown, VmInstanceState.Stopped],
      current.state,
    );
  }
  return true;
};

// 安装性能优化工具
export const verifyInstallGuestTool = (current: IVM): boolean => {
  return current.toolsState === "Uninstall";
};

// 重装性能优化工具
export const verifyReInstallGuestTool = (current: IVM): boolean => {
  return (
    ["IsRunning", "Stopped", "Installed"].indexOf(current?.toolsState ?? "") >
    -1
  );
};

// 启动
export const verifyStart = (current: IVM) => {
  return ["stopped", "Stopped"].indexOf(current.state || "") >= 0;
};

// 停止
export const verifyStop = (current: IVM | VmInstancePerformance) => {
  return (
    ["Running", "running", "paused", "Paused", "Crashed", "NoState"].indexOf(
      current.state || "",
    ) >= 0
  );
};

// 暂停
export const verifyPause = (current: IVM) => {
  return ["Running", "Crashed"].indexOf(current.state || "") >= 0;
};

// 恢复
export const verifyResume = (current: IVM) => {
  return ["paused", "Paused"].indexOf(current.state || "") >= 0;
};

// 重启
export const verifyReboot = (current: IVM) => {
  return includes(
    [VmInstanceState.Running, VmInstanceState.Crashed, VmInstanceState.NoState],
    current.state,
  );
};

// 强制停止
export const verifyForceStop = (current: IVM) => {
  return ["Unknown", "unknown"].indexOf(current.state || "") >= 0;
};

// 关机
export const verifyPoweroff = (current: IVM) => {
  return includes(
    [VmInstanceState.Running, VmInstanceState.Paused, VmInstanceState.Crashed],
    current.state,
  );
};

// 解绑标签
export const verifyDetachTag = (current: IVM) => {
  return (current?.tag?.length ?? 0) > 0;
};

// 重置云主机
export const verifyReimage = (current: IVM) => {
  const baseCondition =
    current.state === VmInstanceState.Stopped &&
    current?.primaryStorage?.type !== "AliyunEBS";
  if (current?.capabilities) {
    return baseCondition && current?.capabilities.Reimage!;
  }

  return baseCondition;
};

/**
 * 单个更改主机的validator
 * @param current 当前虚拟机实例
 * @returns Promise<boolean> 是否可以进行主机迁移
 *
 * 迁移规则：
 * 1. 本地存储(LocalStorage)的特殊处理：
 *    - 已停止状态：主机必须是连接状态
 *    - 运行/暂停/故障状态：需要全局配置允许在线迁移
 * 2. 其他存储类型：
 *    - 支持在以下状态时迁移：运行中/暂停/故障
 *    - 支持的存储类型：
 *      * Ceph
 *      * NFS
 *      * AliyunNAS
 *      * SharedMountPoint
 *      * SharedBlock
 *      * BlockStorage
 *      * Addon
 */
export const verifyMigrate = async (current: IVM): Promise<boolean> => {
  // 获取全局配置：是否允许本地存储在线迁移
  const { data } = await apolloClient.query({
    query: gql`
      query globalConfig {
        globalConfig(
          category: "localStoragePrimaryStorage"
          name: "liveMigrationWithStorage.allow"
        ) {
          name
          category
          value
          uuid
        }
      }
    `,
  });
  const globalLiveMigrate: boolean = data?.globalConfig?.value === "true";

  // 解构必要的属性
  const { state, primaryStorage, host } = current;
  const hostStatus = host?.status;
  const rootVolumePsType = primaryStorage?.type ?? "";

  // 可迁移的运行状态列表
  const migrateableStates = ["Running", "Paused", "Crashed"];

  // 不同存储类型的迁移条件
  const migrationRules = new Map([
    [
      "LocalStorage",
      (state === "Stopped" && hostStatus === "Connected") ||
        (includes(migrateableStates, state) && globalLiveMigrate),
    ],
    ["Ceph", includes(migrateableStates, state)],
    ["NFS", includes(migrateableStates, state)],
    ["AliyunNAS", includes(migrateableStates, state)],
    ["SharedMountPoint", includes(migrateableStates, state)],
    ["SharedBlock", includes(migrateableStates, state)],
    ["BlockStorage", includes(migrateableStates, state)],
    ["Addon", includes(migrateableStates, state)],
  ]);

  // 检查存储类型是否支持迁移，并返回对应的迁移规则结果
  return (
    migrationRules.has(rootVolumePsType) &&
    (migrationRules.get(rootVolumePsType) ?? false)
  );
};

/**
 * 单个数据存储的validator
 * @param current 当前虚拟机实例
 * @returns boolean 是否可以进行存储单独迁移
 *
 * 迁移规则：
 * 1. 不支持以下类型的存储：
 *    - Addon (with Vhost protocol)
 *    - 非 SharedBlock 和 Ceph 类型
 * 2. Ceph 存储特殊规则：
 *    - 仅支持运行中和暂停状态
 * 3. 支持的虚拟机状态：
 *    - 已停止
 *    - 运行中
 *    - 暂停
 */
export const verifyVmMigrateChangePrimaryStorage = (current: IVM): boolean => {
  const { primaryStorage, state } = current;

  // 检查不支持的存储类型
  if (isZbsStorage(primaryStorage) || isVhostStorage(primaryStorage)) {
    return false;
  }

  // 仅支持 SharedBlock 和 Ceph 类型的存储
  if (!includes(["SharedBlock", "Ceph"], primaryStorage?.type)) {
    return false;
  }

  // Ceph 存储特殊规则：仅支持运行和暂停状态
  if (
    primaryStorage?.type === "Ceph" &&
    ![VmInstanceState.Running, VmInstanceState.Paused].includes(state!)
  ) {
    return false;
  }

  // 检查虚拟机状态是否满足要求
  return [
    VmInstanceState.Stopped,
    VmInstanceState.Running,
    VmInstanceState.Paused,
  ].includes(state!);
};

export const verifySingleVmMigrateChangePrimaryStorage = (
  current: IVM,
): boolean => {
  return canChangeDataStorage(current);
};

/**
 * 单个更改主机和数据存储的validator
 * @param current 当前虚拟机实例
 * @returns boolean 是否可以进行存储迁移
 *
 * 存储迁移规则：
 * 1. 以下类型的主存储不支持迁移：
 *    - BlockStorage
 *    - Addon (with Vhost protocol)
 *    - SharedMountPoint
 * 2. 运行中/故障状态的虚拟机可以迁移
 * 3. 已停止的虚拟机：
 *    - 仅支持 Ceph 和 NFS 类型的主存储
 *    - 不支持 SharedBlock 类型
 * 4. 主机断开连接时不支持迁移
 */
export const verifyStorageMigrate = (current: IVM): boolean => {
  const { primaryStorage, state, host } = current;

  // 检查不支持的存储类型
  if (
    primaryStorage?.type === "BlockStorage" ||
    isZbsStorage(primaryStorage) ||
    isVhostStorage(primaryStorage) ||
    primaryStorage?.type === "SharedMountPoint"
  ) {
    return false;
  }

  // 运行中或故障状态可以迁移
  if ([VmInstanceState.Running, VmInstanceState.Crashed].includes(state!)) {
    return true;
  }

  // 已停止状态的特殊处理
  if (state === VmInstanceState.Stopped) {
    if (primaryStorage?.type === "SharedBlock") {
      return false;
    }
    return includes(["Ceph", "NFS"], primaryStorage?.type);
  }

  // 检查主机状态
  if (!host?.status || host.status === "Disconnected") {
    return false;
  }

  return false;
};

// 绑定云主机调度组
export const verifyAttachVmToVmGroup = (current: IVM) => {
  return (
    !current?.vmGroup?.uuid &&
    ["Running", "Stopped"].includes(current?.state ?? "")
  );
};

// 解绑云主机调度组
export const verifyDetachVmFromVmGroup = (current: IVM) => {
  return (
    !!current?.vmGroup?.uuid &&
    ["Running", "Stopped"].includes(current?.state ?? "")
  );
};

// 修改云主机密码
export const verifyModifyVmPassword = (current: IVM) => {
  return ["Running", "Crashed"].includes(current.state!);
};

// 扁平合并
export const verifyVmFlatten = (current: IVM) => {
  return includes(
    [VmInstanceState.Running, VmInstanceState.Paused, VmInstanceState.Stopped],
    current.state,
  );
};

// 创建镜像
export const verifyCreateImage = async (current: IVM) => {
  const { data } = await apolloClient.query({
    query: gql`
      query backupStorageList($conditions: [Condition!]) {
        backupStorageList(conditions: $conditions) {
          list {
            uuid
            type
          }
        }
      }
    `,
    variables: {
      conditions: [
        {
          key: "status",
          op: Op.eq,
          value: "Connected",
        },
        {
          key: "state",
          op: Op.eq,
          value: "Enabled",
        },
        {
          key: "zone.uuid",
          op: Op.eq,
          value: current?.zoneUuid,
        },
      ],
    },
    fetchPolicy: "no-cache",
  });
  const { list: bsListInCurrentZone = [] } = data?.backupStorageList ?? {};
  if (current.state === "Stopped" && bsListInCurrentZone.length > 0) {
    return true;
  }
  if (current.state === "Running" || current.state === "Crashed") {
    return some(bsListInCurrentZone, (bs) =>
      includes(["ImageStoreBackupStorage", "AliyunEBS", "Ceph"], bs.type),
    );
  }
  return false;
};

// 变更所有者
export const verifyChangeOwner = (current: IVM) => {
  return ["Running", "Stopped", "Crashed"].includes(current.state || "");
};

// 打开控制台
export const verifyOpenConsole = (current: IVM) => {
  return includes(
    [
      VmInstanceState.Running,
      VmInstanceState.Crashed,
      VmInstanceState.VolumeRecovering,
      VmInstanceState.NoState,
    ],
    current.state,
  );
};

export const verifyNicSyncConfig = (_current: IVM) => {
  return _current.toolsState !== "Uninstall";
};

export const verifyRekey = (current: IVM) => {
  return !!current.tpmList?.length;
};

const primaryStorageCount = gql`
  query primaryStorageCount {
    primaryStorageList(count: true) {
      total
    }
  }
`;

// ZSV-10201
export const useVerifyPrimaryStorageCount = () => {
  const client = useApolloClient();
  const queryPromiseRef = useRef<Promise<any>>();
  if (!queryPromiseRef.current) {
    queryPromiseRef.current = client
      .query({
        query: primaryStorageCount,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        return res?.data?.primaryStorageList?.total;
      })
      .catch(() => {
        return null;
      });
  }
  return async () => {
    const count = await queryPromiseRef.current;
    return isNil(count) || count > 1;
  };
};
