import { gql, useQuery } from "@apollo/client";
import { InfoPopover, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  queryVmStorageUsedCapacity,
  queryVmUsage,
} from "@zstack/virtualization-resource/src/gql/vm.gql";
import {
  DraggableCard,
  ResourceCapacity,
  useSetTab,
} from "@zstack/zsphere-components";
import {
  GuestToolsZWatchState,
  Op,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  QueryvmUsageArgs,
  VmUsage,
} from "@zstack/zsphere-types/graphql";
import { formatTime } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import StorageUsed from "../../components/storage-used-detail";

import styles from "./style.module.less";

const queryGuestToolsState = gql`
  query queryGuestToolsState($vmInstanceUuid: String!) {
    queryGuestToolsState(vmInstanceUuid: $vmInstanceUuid) {
      zwatchState
    }
  }
`;

const FLEX_CENTER_STYLE = { display: "flex", alignItems: "center" } as const;

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

function useVMUsage(variables: QueryvmUsageArgs, callback?: Function) {
  const {
    data: originData,
    loading,
    refetch,
  } = useQuery<{ vmUsage: VmUsage }>(queryVmUsage, {
    variables,
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      callback?.();
    },
  });

  const data = useMemo(() => {
    return originData?.vmUsage || {};
  }, [originData]);

  return {
    data,
    loading,
    refetch,
  };
}

function useVmStorageUsedCapacity(variables: any, callback?: () => void) {
  const {
    data: vmStorageUsedCapacityData,
    loading,
    refetch,
  } = useQuery(queryVmStorageUsedCapacity, {
    variables,
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      callback?.();
    },
  });

  const data = useMemo(() => {
    return (
      _.sum(
        _.map(
          vmStorageUsedCapacityData?.queryCapacityManagementListVMDiskInfo
            ?.list,
          "used",
        ),
      ) || 0
    );
  }, [vmStorageUsedCapacityData]);

  return {
    data,
    loading,
    refetch,
  };
}

const CapacityUsage: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const [fetchTime, setFetchTime] = useState(new Date().getTime());
  const { uuid, state, cpuNum = 0, memorySize = 0, allVolumes = [] } = detail;
  const isRunning = state === VmInstanceState.Running;

  const { data: guestToolsData } = useQuery(queryGuestToolsState, {
    variables: { vmInstanceUuid: uuid },
    fetchPolicy: "no-cache",
  });
  const zwatchState = guestToolsData?.queryGuestToolsState?.zwatchState;
  const isUnInstallTools = useMemo(() => {
    return (
      zwatchState === GuestToolsZWatchState.NotRunning ||
      zwatchState === GuestToolsZWatchState.NotInstalled
    );
  }, [zwatchState]);

  const {
    data: usageData,
    loading: usageLoading,
    refetch: usageRefetch,
  } = useVMUsage({ uuid }, () => {
    setFetchTime(new Date().getTime());
  });

  const { data: vmStorageUsedCapacity, refetch: refetchVmStorageUsedCapacity } =
    useVmStorageUsedCapacity({
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    });

  const renderExtra = () => {
    return isUnInstallTools ? (
      <Tooltip
        placement="top"
        title={intl.formatMessage({
          id: "vm.storage.uninstall.tools.tip",
          defaultMessage: "VMTools is not installed on the VM. Storage usage details is unavailable.",
        })}
      >
        <span className={styles.disabledAudit}>
          <Icon type="audit" />
        </span>
      </Tooltip>
    ) : (
      <StorageUsed uuid={uuid} />
    );
  };

  const CPUPercentage = useMemo(() => {
    const { cpuUsed: usedNum = 0 } = usageData;
    const isEmpty = !isRunning || !usedNum;

    return (
      <ResourceCapacity.Percentage
        resourceType="cpu"
        usedNum={usedNum}
        totalNum={cpuNum}
        loading={usageLoading}
        isEmpty={isEmpty}
        isPhysical={false}
      />
    );
  }, [cpuNum, isRunning, usageData, usageLoading]);

  const MemoryPercentage = useMemo(() => {
    const { memoryUsed: usedPercentage = 0 } = usageData;
    const usedNum = memorySize * (usedPercentage / 100);
    const availableNum = memorySize - usedNum;

    return (
      <ResourceCapacity.Percentage
        resourceType="memory"
        usedNum={usedNum}
        totalNum={memorySize}
        loading={usageLoading}
        isEmpty={false}
        isPhysical={false}
        availableNum={availableNum}
      />
    );
  }, [memorySize, usageData, usageLoading]);

  const StoragePercentage = useMemo(() => {
    // 安装vmtools的情况，用zwatch的值
    const usedNum = isUnInstallTools
      ? _.sum(_.map(allVolumes, "actualSize"))
      : vmStorageUsedCapacity;

    const totalNum = _.sum(_.map(allVolumes, "size"));
    const availableNum = totalNum - usedNum;

    return (
      <ResourceCapacity.Percentage
        resourceType="storage"
        usedNum={usedNum}
        totalNum={totalNum}
        availableNum={availableNum}
        loading={usageLoading}
        isEmpty={false}
        isPhysical={false}
        resourceCategory="vm"
        extra={renderExtra()}
      />
    );
  }, [allVolumes, isUnInstallTools, usageLoading, vmStorageUsedCapacity]);

  const handleRefresh = () => {
    usageRefetch();
    refetchVmStorageUsedCapacity();
  };

  const { setTab } = useSetTab();

  const handleGoToDetail = () => {
    setTab("main-tab", "monitoring");
  };

  return (
    <DraggableCard
      title={
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "storage.info",
              defaultMessage: "Capacity Info",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.storage.info.tooltip",
                  defaultMessage: `### Capacity Info

Displays the capacity and usage of VM CPU, memory, and storage.

Note: When all disks use thick provisioning, the full allocated storage capacity is immediately consumed. You can check storage usage details after installing VMTools on the VM.`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      }
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      extra={
        <div className="flex items-center gap-3">
          <span>
            {intl.formatMessage({
              id: "updateTime",
              defaultMessage: "Updated at",
            })}
            : {formatTime(fetchTime)}
          </span>
          <div style={FLEX_CENTER_STYLE}>
            <Tooltip
              title={intl.formatMessage({
                id: "refresh",
                defaultMessage: "Refresh",
              })}
            >
              <Icon
                type="refresh"
                onClick={handleRefresh}
                className="action-icon"
              />
            </Tooltip>
          </div>
          <div style={FLEX_CENTER_STYLE}>
            <Tooltip
              title={intl.formatMessage({
                id: "look.for.detail",
                defaultMessage: "View Details",
              })}
            >
              <Icon
                type="external-link"
                onClick={handleGoToDetail}
                className="action-icon"
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className="zsv-capacity-container">
        <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
          <div style={{ flex: "0 1 33%" }}>{CPUPercentage}</div>
          <div style={{ flex: "0 1 33%" }}>{MemoryPercentage}</div>
          <div style={{ flex: "0 1 33%" }}>{StoragePercentage}</div>
        </div>
      </div>
    </DraggableCard>
  );
};

export default CapacityUsage;
