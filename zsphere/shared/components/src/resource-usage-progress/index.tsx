import { Space, Tooltip } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Progress from "../progress";
import type { IStorageCalculations, ResourceUsageProgressProps } from "./type";
import {
  calculateStorageMetrics,
  getAvailableValue,
  getComplexPercent,
  getTooltipList,
  getExtraContentData,
} from "./utils";

const ResourceUsageProgress: React.FC<ResourceUsageProgressProps> = (props) => {
  const {
    total = 0,
    available = 0,
    usedNum = 0,
    reserved = 0,
    isFormat = true,
    resourceType,
    metric,
    tooltipTitle,
    extraLabel,
    poolType = "primary",
    primaryStorageCapacity = {},
    primaryStoragePoolCapacity = {},
  } = props;

  const intl = useIntl();
  const isCpu = resourceType === "cpu";
  const isMemory = resourceType === "memory";
  const isNetWork = resourceType === "network";
  const isStorage = resourceType === "storage";

  const storageCalculations: IStorageCalculations | null = useMemo(
    () =>
      isStorage
        ? calculateStorageMetrics({
            poolType,
            primaryStorageCapacity,
            primaryStoragePoolCapacity,
            total,
            available,
            reserved,
          })
        : null,
    [
      isStorage,
      poolType,
      primaryStorageCapacity,
      primaryStoragePoolCapacity,
      total,
      available,
      reserved,
    ],
  );

  const availableValue = useMemo(() => {
    if (isStorage && storageCalculations) {
      if (metric === "virtualCapacityAllocationRatio") {
        return storageCalculations.remainingAllocatable;
      }
      return available;
    }
    return getAvailableValue({ metric, available, total, usedNum, reserved });
  }, [
    available,
    metric,
    total,
    usedNum,
    reserved,
    isStorage,
    storageCalculations,
  ]);

  const complexPercent = useMemo(
    () =>
      getComplexPercent({
        total,
        isStorage,
        storageCalculations,
        metric,
        isCpu,
        usedNum,
        availableValue,
        reserved,
      }),
    [
      total,
      isStorage,
      storageCalculations,
      metric,
      isCpu,
      usedNum,
      availableValue,
      reserved,
    ],
  );

  const tooltipList = useMemo(
    () =>
      getTooltipList({
        intl,
        isStorage,
        storageCalculations,
        metric,
        isCpu,
        total,
        usedNum,
        availableValue,
        isFormat,
        isNetWork,
        available,
        reserved,
      }),
    [
      intl,
      isStorage,
      storageCalculations,
      metric,
      isCpu,
      total,
      usedNum,
      availableValue,
      isFormat,
      isNetWork,
      available,
      reserved,
    ],
  );

  const extraContentData = useMemo(
    () =>
      getExtraContentData({
        isStorage,
        storageCalculations,
        metric,
        total,
        intl,
        isMemory,
        isFormat,
        availableValue,
        usedNum,
        reserved,
        available,
      }),
    [
      isStorage,
      storageCalculations,
      metric,
      total,
      intl,
      isMemory,
      isFormat,
      availableValue,
      usedNum,
      reserved,
      available,
    ],
  );

  const renderExtraContent = () => {
    if (!extraContentData) return null;

    return React.createElement(
      Space as any,
      { size: 4 },
      <>
        {extraLabel || extraContentData.label}
        {extraContentData.value}
      </>,
    );
  };

  const finalPercent = Math.max(complexPercent, 0);

  return (
    <Tooltip
      title={
        tooltipTitle || (
          <>
            {tooltipList.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                {` : ${item.value}`}
              </div>
            ))}
          </>
        )
      }
    >
      <Progress.BarInTable
        {...({
          percent: finalPercent,
          extra: renderExtraContent(),
          tooltipList,
          needDecimal: true,
        } as any)}
      />
    </Tooltip>
  );
};

export default ResourceUsageProgress;
