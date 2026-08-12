import { gql, useQuery } from "@apollo/client";
import { Op, VolumeBackupDataSummaryQueryType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";

const _zsvGetVolumeBackupDataSize = gql`
  query getVolumeBackupDataSize(
    $conditions: [Condition!]
    $type: VolumeBackupDataSummaryQueryType!
    $resourceUuid: String!
  ) {
    getVolumeBackupDataSize(
      conditions: $conditions
      type: $type
      resourceUuid: $resourceUuid
    ) {
      full
      incremental
      incrementalDependency
    }
  }
`;

const _zsvBackupDataList = gql`
  query backupDataList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: BackupResourceType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    backupDataList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
      }
    }
  }
`;

const _zsvGetSchedulerJobGroupList = gql`
  query schedulerJobGroupList(
    $type: SchedulerJobGroupQueryType
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    schedulerJobGroupList(
      type: $type
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        state
      }
    }
  }
`;

export const useBackupQuery = (current: IVM) => {
  const {
    loading: zsvSchedulerJobGroupLoading,
    data: zsvSchedulerJobGroupList,
    refetch: zsvSchedulerJobGroupRefetch,
  } = useQuery(_zsvGetSchedulerJobGroupList, {
    variables: {
      conditions: [
        {
          key: "__VmInstanceUuids__",
          op: Op.in,
          values: [current?.uuid ?? ""],
        },
      ],
    },
  });

  const {
    loading: localVolumeBackupLoading,
    data: localVolumeBackupDataSize,
    refetch: refetchLocalVolumeBackupDataSize,
  } = useQuery(_zsvGetVolumeBackupDataSize, {
    variables: {
      conditions: [
        {
          key: "_VolumeBackupStorageRefReadyStatus_",
          op: Op.eq,
          value: "__UnknownLocalBackupStorageUuid__",
        },
      ],
      resourceUuid: current?.uuid ?? "",
      type: VolumeBackupDataSummaryQueryType.VmInstance,
    },
  });

  const {
    loading: remoteVolumeBackupLoading,
    data: remoteVolumeBackupDataSize,
    refetch: refetchRemoteVolumeBackupDataSize,
  } = useQuery(_zsvGetVolumeBackupDataSize, {
    variables: {
      conditions: [
        {
          key: "_VolumeBackupStorageRefReadyStatus_",
          op: Op.eq,
          value: "__UnknownRemoteBackupStorageUuid__",
        },
      ],
      resourceUuid: current?.uuid ?? "",
      type: VolumeBackupDataSummaryQueryType.VmInstance,
    },
  });

  const {
    loading: zsvBackupLoading,
    data: zsvBackupData,
    refetch: zsvBackupDataRefetch,
  } = useQuery(_zsvBackupDataList, {
    variables: {
      conditions: [
        {
          key: "status",
          op: Op.eq,
          value: "Ready",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Root",
        },
        {
          key: "vmInstanceUuid",
          op: Op.eq,
          value: current?.uuid ?? "",
        },
      ],
    },
  });

  const loading =
    zsvSchedulerJobGroupLoading ||
    localVolumeBackupLoading ||
    remoteVolumeBackupLoading ||
    zsvBackupLoading;

  const currentBackupPolicy =
    zsvSchedulerJobGroupList?.schedulerJobGroupList?.list?.[0] || {};
  const currentBackupData = zsvBackupData?.backupDataList?.list?.[0] || {};

  const hasBackupData = !!currentBackupData.uuid;
  const hasBackupPolicy = !!currentBackupPolicy.uuid;

  return {
    loading,
    zsvSchedulerJobGroupRefetch,
    zsvBackupDataRefetch,
    refetchVolumeBackupDataSize: () => {
      refetchLocalVolumeBackupDataSize();
      refetchRemoteVolumeBackupDataSize();
    },
    currentBackupPolicy,
    noBackup: !hasBackupData && !hasBackupPolicy,
    backupDataSize: {
      local: localVolumeBackupDataSize?.getVolumeBackupDataSize ?? {},
      remote: remoteVolumeBackupDataSize?.getVolumeBackupDataSize ?? {},
    },
  };
};
