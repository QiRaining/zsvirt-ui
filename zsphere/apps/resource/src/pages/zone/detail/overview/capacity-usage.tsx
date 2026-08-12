import { InfoPopover, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DraggableCard } from "@zstack/zsphere-components";
import {
  ResourceCapacity,
  useHostCpuMemoryCapacity,
  usePrimaryStorageCapacity,
} from "@zstack/zsphere-components";
import { formatTime } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const FLEX_CENTER_STYLE = { display: "flex", alignItems: "center" } as const;

interface IProps {
  uuid: string;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const CapacityUsage: FC<IProps> = ({
  uuid,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const {
    data: cpuMemoryData,
    loading: cpuMemoryLoading,
    refetch: cpuMemoryRefetch,
  } = useHostCpuMemoryCapacity({
    zoneUuids: [uuid],
  });

  const {
    data: storageData,
    loading: storageLoading,
    refetch: storageRefetch,
  } = usePrimaryStorageCapacity({
    zoneUuids: [uuid],
  });

  const handleRefresh = () => {
    cpuMemoryRefetch();
    storageRefetch();
  };

  const CPUPercentage = useMemo(() => {
    const { CPUAllUsedUtilization: usedNum = 0, totalCpuGHz: totalNum = 0 } =
      cpuMemoryData;
    return (
      <ResourceCapacity.Percentage
        resourceType="cpu"
        usedNum={usedNum}
        totalNum={totalNum}
        loading={cpuMemoryLoading}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

  const MemoryPercentage = useMemo(() => {
    const { MemoryUsedBytes: usedNum = 0, totalPhysicalMemory: totalNum = 0 } =
      cpuMemoryData;
    return (
      <ResourceCapacity.Percentage
        resourceType="memory"
        usedNum={usedNum}
        totalNum={totalNum}
        loading={cpuMemoryLoading}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

  const StoragePercentage = useMemo(() => {
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
      />
    );
  }, [storageData, storageLoading]);

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
                  id: "zone.storage.info.tooltip",
                  defaultMessage:
                    "# 容量信息\n" +
                    "展示该数据中心下物理 CPU 、物理内存和物理存储资源总量以及使用情况。",
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
