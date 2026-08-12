import { gql } from "@apollo/client";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, PrimaryStorageQueryType } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
  VxlanPool,
} from "@zstack/zsphere-types/graphql";
import { includes, isEqual } from "lodash-es";

const { apolloClient } = window.g_main;

// verifySingle
const verifySingle = async (selectedList: ICluster[]) => {
  return selectedList.length === 1;
};

// 没选
const verifyNotSelect = (selectedList: ICluster[]): boolean => {
  return selectedList?.length <= 0;
};

// verifyMulti
const verifyMulti = async (selectedList: ICluster[]) => {
  return selectedList.length >= 1;
};

// 启动
const enabled = async (current: ICluster) => {
  return current.state !== "Enabled";
};

// 停止
const disabled = async (current: ICluster) => {
  return current.state !== "Disabled";
};

// 已加载二层网络
const isAttachL2network = async (current: ICluster) => {
  return current?.isAttachL2network === true;
};

// 是否可以加载主存储
const canAttachPrimaryStorage = async (current: ICluster) => {
  if (current.hypervisorType === "baremetal") {
    return false;
  }
  // if (self.dbData.common.isOpensource) return true
  if (!current.isAttachPrimaryStorage) {
    return true;
  }
  const attachedPsTypes = current.psTypes;
  if (includes(["Fusionstor", "AliyunNAS"], attachedPsTypes?.[0])) {
    return false;
  }
  if (isEqual(attachedPsTypes, ["LocalStorage", "NFS"].sort())) {
    return false;
  }
  if (isEqual(attachedPsTypes, ["LocalStorage", "SharedMountPoint"].sort())) {
    return false;
  }
  if (isEqual(attachedPsTypes, ["LocalStorage", "SharedBlock"].sort())) {
    return false;
  }
  return true;
};

// 是否可以卸载主存储
const canDetachPrimaryStorage = async (current: ICluster) => {
  if (current?.hypervisorType === "baremetal") {
    return false;
  }
  return current?.isAttachPrimaryStorage === true;
};

const canAttachToL2Network = (current: ICluster[], source: IL2Network) => {
  return source?.type !== "VxlanNetwork";
};

const canDetachFromL2Network = (
  selectedList: ICluster[],
  source: IL2Network,
) => {
  return (
    !selectedList.some((c) => c.hypervisorType === "ESX") &&
    source?.type !== "VxlanNetwork"
  );
};
const canDetachFromVxlanPool = (current: ICluster[], source: VxlanPool) => {
  return (source.attachedClusterUuids?.length ?? 0) > 0;
};

const verifyAddDataStorage = async (current: ICluster) => {
  const conditions: IQuery["conditions"] = [];
  const extraConditions: IQuery["extraConditions"] = [
    {
      key: "clusterUuid",
      op: Op.eq,
      value: current?.uuid,
    },
  ];

  if (current?.zoneUuid) {
    conditions.push({
      key: "zoneUuid",
      op: Op.eq,
      value: current?.zoneUuid,
    });
  }

  if (current?.hypervisorType) {
    extraConditions.push({
      key: "hypervisorType",
      op: Op.eq,
      value: current?.hypervisorType,
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

  // 集群上没有存储
  const { data: totalData } = await apolloClient.query({
    query: gql`
      query getClusterAttachablePrimaryStorageTypes($clusterUuid: String!) {
        getClusterAttachablePrimaryStorageTypes(clusterUuid: $clusterUuid) {
          types
        }
      }
    `,
    variables: {
      clusterUuid: current?.uuid,
    },
  });

  const attachablePsCount = data?.primaryStorageList?.total || 0;

  return (
    attachablePsCount > 0 ||
    totalData?.getClusterAttachablePrimaryStorageTypes?.types?.length > 0
  );
};

export {
  verifySingle,
  verifyNotSelect,
  verifyMulti,
  disabled,
  enabled,
  verifyAddDataStorage,
  isAttachL2network,
  canAttachPrimaryStorage,
  canDetachPrimaryStorage,
  canAttachToL2Network,
  canDetachFromL2Network,
  canDetachFromVxlanPool,
};
