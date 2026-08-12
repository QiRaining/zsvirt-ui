import { gql } from "@apollo/client";
import type { IQuery } from "@zstack/zsphere-types";
import {
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorage,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";

const { apolloClient } = window.g_main;

// verifyZone
export const verifyZone = async (selectedList: IPrimaryStorage[]) => {
  return selectedList.length === 0;
};

// verifySingle
export const verifySingle = async (selectedList: IPrimaryStorage[]) => {
  return selectedList.length === 1;
};

export const attachClusterValidator = async (
  selectedList: IPrimaryStorage[],
) => {
  return selectedList.length === 1;
};

// verifyMulti
export const verifyMulti = async (selectedList: IPrimaryStorage[]) => {
  return selectedList.length >= 1;
};

// 启动
export const verifyStart = async (
  current: IPrimaryStorage,
): Promise<boolean> => {
  return current.state !== "Enabled";
};

// 停止
export const verifyStop = async (current: IPrimaryStorage) => {
  return current.state !== "Disabled";
};

// 重连
export const verifyReconnection = async (current: IPrimaryStorage) => {
  return current.state !== "Maintenance" && current.status !== "Disconnected";
};

// 创建云盘
export const verifyCreateVolume = async (current: IPrimaryStorage) => {
  return current.state === "Enabled" && current.status === "Connected";
};

// 卸载集群
export const verifyDetachCluster = async (current: IPrimaryStorage) => {
  return (current?.attachedClusterUuids?.length || 0) > 0;
};

// 维护模式
export const verifyMaintenance = async (selectedList: IPrimaryStorage[]) => {
  if (selectedList?.length === 0) {
    return false;
  }
  return selectedList.every(
    (ps: IPrimaryStorage) =>
      ps.state !== "Maintenance" && ps.status !== "Disconnected",
  );
};

// 只校验集群添加数据存储
export const verifyAddDataStorage = async (
  selectedList: IPrimaryStorage[],
  source: ICluster,
) => {
  if (selectedList?.length !== 0) {
    return false;
  }
  // 如果不是来自集群详情页，则不做判断。
  if (source?.__typename !== "Cluster") {
    return true;
  }

  const conditions: IQuery["conditions"] = [];
  const extraConditions: IQuery["extraConditions"] = [
    {
      key: "clusterUuid",
      op: Op.eq,
      value: source?.uuid,
    },
  ];

  if (source?.zoneUuid) {
    conditions.push({
      key: "zoneUuid",
      op: Op.eq,
      value: source?.zoneUuid,
    });
  }

  if (source?.hypervisorType) {
    extraConditions.push({
      key: "hypervisorType",
      op: Op.eq,
      value: source?.hypervisorType,
    });
  }

  const { data } = await apolloClient.query({
    query: gql`
      query primaryStorageCount(
        $conditions: [Condition!]
        $type: PrimaryStorageQueryType
        $extraConditions: [Condition!]
      ) {
        primaryStorageList(
          conditions: $conditions
          extraConditions: $extraConditions
          type: $type
          replyWithCount: true
          count: true
        ) {
          total
        }
      }
    `,
    variables: {
      conditions,
      extraConditions,
      type: PrimaryStorageQueryType.ClusterAttachablePs,
    },
  });

  // 集群上可挂载存储类型
  const { data: totalData } = await apolloClient.query({
    query: gql`
      query getClusterAttachablePrimaryStorageTypes($clusterUuid: String!) {
        getClusterAttachablePrimaryStorageTypes(clusterUuid: $clusterUuid) {
          types
        }
      }
    `,
    variables: {
      clusterUuid: source?.uuid,
    },
  });

  const attachablePsCount = data?.primaryStorageList?.total || 0;

  return (
    attachablePsCount > 0 ||
    totalData?.getClusterAttachablePrimaryStorageTypes?.types?.length > 0
  );
};

// 注册虚拟机 - 检查是否加载了集群
export const verifyRegisterVmAttachCluster = async (
  current: IPrimaryStorage,
) => {
  return (current?.attachedClusterUuids?.length || 0) > 0;
};

// 注册虚拟机 - 检查加载的集群下是否有主机
export const verifyRegisterVmClusterHasHost = async (
  current: IPrimaryStorage,
) => {
  if (!current?.uuid) {
    return false;
  }
  const { data } = await apolloClient.query({
    query: gql`
      query getPrimaryStorageRelatedResourceCounts($uuid: String!) {
        getPrimaryStorageRelatedResourceCounts(uuid: $uuid) {
          host
        }
      }
    `,
    variables: { uuid: current.uuid },
  });
  return (data?.getPrimaryStorageRelatedResourceCounts?.host || 0) > 0;
};

// 注册虚拟机：仅 SharedBlock / LocalStorage / NFS 类型主存储支持
const REGISTER_VM_SUPPORTED_TYPES: PrimaryStorageType[] = [
  PrimaryStorageType.SharedBlock,
  PrimaryStorageType.LocalStorage,
  PrimaryStorageType.NFS,
];

export const verifyRegisterVmType = (current: IPrimaryStorage) =>
  !!current &&
  REGISTER_VM_SUPPORTED_TYPES.includes(current.type as PrimaryStorageType);

// 一致性检查仅支持sharedBlock类型主存储
export const verifyConsistencyCheckType = async (current: IPrimaryStorage) => {
  return current.type === PrimaryStorageType.SharedBlock;
};

// 一致性检查需要主存储已加载集群
export const verifyConsistencyCheckAttachCluster = async (
  current: IPrimaryStorage,
) => {
  return (current?.attachedClusterUuids?.length || 0) > 0;
};
