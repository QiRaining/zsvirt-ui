import { InfoPopover, RadioGroup, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  DraggableCard,
  IResourceCapacityType,
  ResourceCapacity,
  useHostCpuMemoryCapacity,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { formatTime } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

interface IProps {
  detail: ICluster;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const flexCenterStyle = { display: "flex", alignItems: "center" } as const;
const rowStyle = { marginBottom: 16 } as const;

const CapacityUsage: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const [type, setType] = useState<IResourceCapacityType>(
    IResourceCapacityType.Percentage,
  );
  const intl = useIntl();

  const {
    data: cpuMemoryData,
    loading: cpuMemoryLoading,
    refetch: cpuMemoryRefetch,
  } = useHostCpuMemoryCapacity({
    clusterUuids: [detail.uuid],
  });

  const handleRefresh = () => {
    cpuMemoryRefetch();
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
        availableNum={totalNum - usedNum}
        loading={cpuMemoryLoading}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

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
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

  const MemoryRatio = useMemo(() => {
    const {
      overProvisioningAvailableMemory: availableNum,
      overProvisioningTotalMemory: overTotalNum = 0,
      totalPhysicalMemory: totalNum = 0,
      reservedPhysicalMemory: reservedNum,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Ratio
        resourceType="memory"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        loading={cpuMemoryLoading}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

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
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

  const MemoryDistribution = useMemo(() => {
    const {
      overProvisioningAvailableMemory: availableNum,
      overProvisioningTotalMemory: overTotalNum = 0,
      totalPhysicalMemory: totalNum = 0,
      reservedPhysicalMemory: reservedNum,
      overProvisioningMemory,
    } = cpuMemoryData;

    return (
      <ResourceCapacity.Distribution
        resourceType="memory"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        overProvisioning={overProvisioningMemory}
        reservedNum={reservedNum}
        loading={cpuMemoryLoading}
      />
    );
  }, [cpuMemoryData, cpuMemoryLoading]);

  const { setTab } = useSetTab();
  const handleGoToDetail = () => {
    setTab("main-tab", "monitoring");
  };

  useActionSubscribe({
    resourceTypeList: ["Cluster"],
    onProgress: () => {
      cpuMemoryRefetch?.();
    },
  });

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
                  id: "cluster.storage.info.tooltip",
                  defaultMessage:
                    "# 容量信息\n" +
                    "## 一、资源使用率\n" +
                    "展示该集群下物理 CPU 、物理内存和物理存储资源总量以及使用情况。\n" +
                    "## 二、资源分配比\n" +
                    "1. 分配比 = 已分配 : 可超配总量\n" +
                    "2. 可超配总量 = 物理总量 - 保留物理容量\n" +
                    "3. 可分配总量 = 可超配总量 * 超配比\n" +
                    "4. 剩余可分配 = 可分配总量 - 已分配\n" +
                    "## 三、资源分布\n" +
                    "展示该集群下超配后 CPU 和内存资源分布情况。详细分布可参考分布规则。",
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
          <div style={flexCenterStyle}>
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
          <div style={flexCenterStyle}>
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
        <div className="flex items-center justify-between" style={rowStyle}>
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
              <ResourceCapacity.Rule showCPU showMemory />
            )}
          </div>
        </div>
        {/* 资源使用率 */}
        {type === IResourceCapacityType.Percentage && (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: "0 1 50%" }}>{CPUPercentage}</div>
            <div style={{ flex: "0 1 50%" }}>{MemoryPercentage}</div>
          </div>
        )}
        {/* 资源分配比 */}
        {type === IResourceCapacityType.Ratio && (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: "0 1 50%" }}>{CPURatio}</div>
            <div style={{ flex: "0 1 50%" }}>{MemoryRatio}</div>
          </div>
        )}
        {/* 资源分布 */}
        {type === IResourceCapacityType.Distribution && (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: "0 1 50%" }}>{CPUDistribution}</div>
            <div style={{ flex: "0 1 50%" }}>{MemoryDistribution}</div>
          </div>
        )}
      </div>
    </DraggableCard>
  );
};

export default CapacityUsage;
