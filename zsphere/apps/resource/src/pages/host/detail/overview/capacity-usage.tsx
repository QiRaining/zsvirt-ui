import { InfoPopover, RadioGroup, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  Alert,
  DraggableCard,
  IResourceCapacityType,
  ResourceCapacity,
  useHostCpuMemoryCapacity,
  useLocalStorageCapacity,
  useSetTab,
} from "@zstack/zsphere-components";
import { HostStatus } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { formatTime } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const FLEX_ICON_STYLE = { display: "flex", alignItems: "center" } as const;
const ALERT_STYLE = { marginBottom: 12 } as const;
const ROW_STYLE = { marginBottom: 16 } as const;
const DISTRIBUTION_CONTAINER_STYLE = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
  width: "100%",
} as const;

interface IProps {
  detail: IHost;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const CapacityUsage: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const [type, setType] = useState<IResourceCapacityType>(
    IResourceCapacityType.Percentage,
  );
  const intl = useIntl();

  const isHostConnected = detail.status === HostStatus.Connected;
  const isLocalStorage = !!detail.localStorageHostDiskCapacity;

  const {
    data: cpuMemoryData,
    loading: cpuMemoryLoading,
    refetch: cpuMemoryRefetch,
  } = useHostCpuMemoryCapacity({
    hostUuids: [detail.uuid],
  });

  const {
    data: storageData,
    loading: storageLoading,
    refetch: storageRefetch,
  } = useLocalStorageCapacity({
    hostUuid: detail.uuid,
  });

  const handleRefresh = () => {
    cpuMemoryRefetch();
    storageRefetch();
  };

  // 使用率
  const CPUPercentage = useMemo(() => {
    const { CPUAllUsedUtilization: usedNum = 0, totalCpuGHz: totalNum = 0 } =
      cpuMemoryData;
    return (
      <ResourceCapacity.Percentage
        resourceType="cpu"
        usedNum={usedNum}
        totalNum={totalNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const MemoryPercentage = useMemo(() => {
    const { MemoryUsedBytes: usedNum = 0, totalPhysicalMemory: totalNum = 0 } =
      cpuMemoryData;
    return (
      <ResourceCapacity.Percentage
        resourceType="memory"
        usedNum={usedNum}
        totalNum={totalNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const StoragePercentage = useMemo(() => {
    if (!isLocalStorage) {
      return null;
    }
    const {
      totalPhysicalCapacity: totalNum = 0,
      availablePhysicalCapacity: availableNum = 0,
      reservedPhysicalCapacity: reservedNum = 0,
    } = storageData;
    const usedNum = totalNum - availableNum;
    return (
      <ResourceCapacity.Percentage
        resourceType="storage"
        usedNum={usedNum}
        totalNum={totalNum}
        reservedNum={reservedNum}
        loading={storageLoading}
        isEmpty={!isHostConnected}
      />
    );
  }, [isLocalStorage, storageData, storageLoading, isHostConnected]);

  // 分配比
  const CPURatio = useMemo(() => {
    const {
      availableCpu: availableNum,
      totalCpu: overTotalNum = 0,
      cpuNum: totalNum = 0,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Ratio
        resourceType="cpu"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const MemoryRatio = useMemo(() => {
    const {
      overProvisioningAvailableMemory: availableNum,
      overProvisioningTotalMemory: overTotalNum = 0,
      totalPhysicalMemory: totalNum = 0,
      reservedPhysicalMemory: reservedNum = 0,
      overProvisioningMemory: overProvisioning = 1,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Ratio
        resourceType="memory"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
        overProvisioning={overProvisioning}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const StorageRatio = useMemo(() => {
    if (!isLocalStorage) {
      return null;
    }
    const {
      volumeSnapshotSize,
      imageCacheSize,
      volumeSize,
      vmTemplateVolumeCacheSize,
      availableCapacity: availableNum,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum = 0,
      overProvisioningPrimaryStorage: overProvisioning = 1,
      systemUsedCapacity: systemUsedNum = 0,
    } = storageData;

    return (
      <ResourceCapacity.Ratio
        resourceType="storage"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        loading={storageLoading}
        isEmpty={!isHostConnected}
        overProvisioning={overProvisioning}
        imageNum={imageCacheSize}
        diskNum={volumeSize}
        snapshotNum={volumeSnapshotSize}
        vmTemplateCacheNum={vmTemplateVolumeCacheSize}
        systemUsedNum={systemUsedNum}
      />
    );
  }, [isHostConnected, isLocalStorage, storageData, storageLoading]);

  // 分布
  const CPUDistribution = useMemo(() => {
    const {
      availableCpu: availableNum,
      totalCpu: overTotalNum = 0,
      cpuNum: totalNum = 0,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Distribution
        resourceType="cpu"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const MemoryDistribution = useMemo(() => {
    const {
      overProvisioningAvailableMemory: availableNum,
      overProvisioningTotalMemory: overTotalNum = 0,
      totalPhysicalMemory: totalNum = 0,
      reservedPhysicalMemory: reservedNum,
      overProvisioningMemory: overProvisioning = 1,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Distribution
        resourceType="memory"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        loading={cpuMemoryLoading}
        isEmpty={!isHostConnected}
        overProvisioning={overProvisioning}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading, isHostConnected]);

  const StorageDistribution = useMemo(() => {
    if (!isLocalStorage) {
      return null;
    }
    const {
      availableCapacity: availableNum,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum,
      volumeSnapshotSize: snapshotNum,
      imageCacheSize: imageNum,
      vmTemplateVolumeCacheSize: vmTemplateCacheNum,
      volumeSize: diskNum,
      overProvisioningPrimaryStorage: overProvisioning = 1,
      systemUsedCapacity: systemUsedNum = 0,
    } = storageData;

    return (
      <ResourceCapacity.Distribution
        resourceType="storage"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        snapshotNum={snapshotNum}
        imageNum={imageNum}
        vmTemplateCacheNum={vmTemplateCacheNum}
        diskNum={diskNum}
        loading={storageLoading}
        isEmpty={!isHostConnected}
        overProvisioning={overProvisioning}
        systemUsedNum={systemUsedNum}
        isLocal={isLocalStorage}
      />
    );
  }, [isHostConnected, isLocalStorage, storageData, storageLoading]);

  const { setTab } = useSetTab();
  const handleGoToDetail = () => {
    setTab("main-tab", "monitoring");
  };

  const flexWidth = useMemo(
    () => (isLocalStorage ? "0 1 33%" : "0 1 50%"),
    [isLocalStorage],
  );

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
                  id: "host.storage.info.tooltip",
                  defaultMessage:
                    "# 容量信息\n" +
                    "## 一、资源使用率\n" +
                    "展示该主机物理 CPU 、物理内存和物理存储资源总量以及使用情况。\n" +
                    "## 二、资源分配比\n" +
                    "1. 分配比 = 已分配 : 可超配总量\n" +
                    "2. 可超配总量 = 物理总量 - 保留物理容量\n" +
                    "3. 可分配总量 = 可超配总量 * 超配比\n" +
                    "4. 剩余可分配 = 可分配总量 - 已分配\n" +
                    "## 三、资源分布\n" +
                    "展示该主机超配后 CPU 和内存资源分布情况。详细分布可参考分布规则。",
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
            : {formatTime(cpuMemoryData.timestamp!)}
          </span>
          <div style={FLEX_ICON_STYLE}>
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
          <div style={FLEX_ICON_STYLE}>
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
        {!isHostConnected && (
          <Alert
            type="warning"
            message={intl.formatMessage({
              id: "host.resource.section.warning",
              defaultMessage:
                "The host is connecting or disconnected. For an accurate usage statistics, check again after connected.",
            })}
            display="blockStrong"
            closable={true}
            style={ALERT_STYLE}
          />
        )}
        <div className="flex items-center justify-between" style={ROW_STYLE}>
          <div>
            <RadioGroup
              variant="outline"
              value={type}
              onValueChange={(val) => setType(val as IResourceCapacityType)}
              options={[
                {
                  value: IResourceCapacityType.Percentage,
                  label: intl.formatMessage({
                    id: "resource.usage",
                    defaultMessage: "Utilization",
                  }),
                },
                {
                  value: IResourceCapacityType.Ratio,
                  label: intl.formatMessage({
                    id: "resource.ratio",
                    defaultMessage: "Allocation Ratio",
                  }),
                },
                {
                  value: IResourceCapacityType.Distribution,
                  label: intl.formatMessage({
                    id: "resource.distribution",
                    defaultMessage: "Distribution",
                  }),
                },
              ]}
            />
          </div>
          <div>
            {type !== IResourceCapacityType.Percentage && (
              <ResourceCapacity.Rule showCPU showMemory showStorage />
            )}
          </div>
        </div>
        {/* 资源使用率 */}
        {type === IResourceCapacityType.Percentage && (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: flexWidth }}>{CPUPercentage}</div>
            <div style={{ flex: flexWidth }}>{MemoryPercentage}</div>
            {isLocalStorage && (
              <div style={{ flex: "0 1 33%" }}>{StoragePercentage}</div>
            )}
          </div>
        )}
        {/* 资源分配比 */}
        {type === IResourceCapacityType.Ratio && (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: flexWidth }}>{CPURatio}</div>
            <div style={{ flex: flexWidth }}>{MemoryRatio}</div>
            {isLocalStorage && (
              <div style={{ flex: "0 1 33%" }}>{StorageRatio}</div>
            )}
          </div>
        )}
        {/* 资源分布 */}
        {type === IResourceCapacityType.Distribution && (
          <>
            {isLocalStorage ? (
              <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
                <div style={{ flex: "0 1 50%" }}>
                  <div style={DISTRIBUTION_CONTAINER_STYLE}>
                    {CPUDistribution}
                    {MemoryDistribution}
                  </div>
                </div>
                <div style={{ flex: "0 1 50%" }}>{StorageDistribution}</div>
              </div>
            ) : (
              <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
                <div style={{ flex: "0 1 50%" }}>{CPUDistribution}</div>
                <div style={{ flex: "0 1 50%" }}>{MemoryDistribution}</div>
              </div>
            )}
          </>
        )}
      </div>
    </DraggableCard>
  );
};

export default CapacityUsage;
