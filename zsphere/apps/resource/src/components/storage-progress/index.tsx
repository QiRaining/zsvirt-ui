import { Progress } from "@zstack/zsphere-components";
import type {
  PrimaryStorageCapacity,
  CephPrimaryStoragePoolCapacity,
  ExternalPrimaryStoragePoolCapacity,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { floor as _floor } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const { BarInTable } = Progress;

export interface IProps {
  total: number;
  available: number;
  reservedNum?: number;
  poolType?: "primary" | "ceph" | "vhost";
  metric?: "virtualCapacityAllocationRatio" | "capacityUtilization";
  primaryStorageCapacity?: PrimaryStorageCapacity;
  cephPrimaryStoragePoolCapacity?: CephPrimaryStoragePoolCapacity;
  externalPrimaryStoragePoolCapacity?: ExternalPrimaryStoragePoolCapacity;
}

const StorageProgress: React.FC<IProps> = ({
  total = 0,
  available = 0,
  reservedNum = 0,
  poolType = "primary",
  metric,
  primaryStorageCapacity = {},
  cephPrimaryStoragePoolCapacity = {},
  externalPrimaryStoragePoolCapacity = {},
}) => {
  const intl = useIntl();

  const {
    imageCacheSize = 0,
    volumeSize = 0,
    volumeSnapshotSize = 0,
    vmTemplateVolumeCacheSize = 0,
    reservedCapacity = 0,
  } = useMemo(() => {
    const capacityMap = {
      ceph: cephPrimaryStoragePoolCapacity,
      vhost: externalPrimaryStoragePoolCapacity,
      primary: primaryStorageCapacity,
    };

    return capacityMap[poolType];
  }, [
    poolType,
    primaryStorageCapacity,
    cephPrimaryStoragePoolCapacity,
    externalPrimaryStoragePoolCapacity,
  ]);

  const {
    reservedCapacity: psReservedNum = reservedNum,
    overProvisioningPrimaryStorage: overProvisioning = 1,
    thresholdPrimaryStoragePhysicalCapacity = 0.9,
  } = primaryStorageCapacity;

  const psUsedNum = total - available;

  const reservedPhysicalCapacity =
    total * (1 - thresholdPrimaryStoragePhysicalCapacity);

  // 可超配总量
  const overProvisioningTotal =
    total - (poolType === "primary" ? psReservedNum : reservedCapacity);

  // 可分配总量
  const allocatableTotal =
    overProvisioningTotal * _floor(overProvisioning, 2) -
    (poolType === "primary" ? 0 : psReservedNum);

  // 已分配
  const allocated =
    imageCacheSize +
    volumeSize +
    volumeSnapshotSize +
    vmTemplateVolumeCacheSize;

  // 剩余可分配
  const remainingAllocatable = allocatableTotal - allocated;

  const allocatableTotalFormatted = formatBytesToSize(allocatableTotal);
  const allocatedFormatted = formatBytesToSize(allocated);
  const remainingAllocatableFormatted = formatBytesToSize(remainingAllocatable);
  const totalFormatted = formatBytesToSize(total);
  const psUsedNumFormatted = formatBytesToSize(
    psUsedNum || total - psReservedNum,
  );
  const availableFormatted = formatBytesToSize(
    total - psUsedNum - reservedPhysicalCapacity,
  );
  const reservedPhysicalCapacityFormatted = formatBytesToSize(
    reservedPhysicalCapacity,
  );

  const tooltipList = useMemo(() => {
    return metric === "virtualCapacityAllocationRatio"
      ? [
          {
            label: intl.formatMessage({
              id: "allocatable.total.amount",
              defaultMessage: "Total Allocatable",
            }),
            value: allocatableTotalFormatted,
          },
          {
            label: intl.formatMessage({
              id: "allocated",
              defaultMessage: "Allocated",
            }),
            value: allocatedFormatted,
          },
          {
            label: intl.formatMessage({
              id: "remaining.allocatable",
              defaultMessage: "Free to Allocate",
            }),
            value: remainingAllocatableFormatted,
          },
        ]
      : [
          {
            label: intl.formatMessage({
              id: "physical.total",
              defaultMessage: "Physical Total",
            }),
            value: totalFormatted,
          },
          {
            label: intl.formatMessage({
              id: "physical.used",
              defaultMessage: "Physical Used",
            }),
            value: psUsedNumFormatted,
          },
          {
            label: intl.formatMessage({
              id: "physical.available",
              defaultMessage: "Physical Available",
            }),
            value: availableFormatted,
          },
          {
            label: intl.formatMessage({
              id: "reservedPhysicalCapacity",
              defaultMessage: "Safety Threshold Capacity",
            }),
            value: reservedPhysicalCapacityFormatted,
          },
        ];
  }, [
    metric,
    intl,
    allocatableTotalFormatted,
    allocatedFormatted,
    remainingAllocatableFormatted,
    totalFormatted,
    psUsedNumFormatted,
    availableFormatted,
    reservedPhysicalCapacityFormatted,
  ]);

  const extra = useMemo(() => {
    const availableSpace =
      metric === "virtualCapacityAllocationRatio"
        ? remainingAllocatableFormatted
        : availableFormatted;
    return (
      <div className="flex items-center gap-1">
        {intl.formatMessage({ id: "available", defaultMessage: "Available " })}
        {availableSpace}
      </div>
    );
  }, [metric, intl, remainingAllocatableFormatted, availableFormatted]);

  const percent = useMemo(() => {
    let calculatedPercent = 0;
    if (metric === "virtualCapacityAllocationRatio") {
      if (total > 0 && allocatableTotal > 0) {
        calculatedPercent = _floor(
          Math.min(1, allocated / allocatableTotal) * 100,
          8,
        );
      }
    } else {
      calculatedPercent = _floor(
        Math.min(1, (psUsedNum || total - psReservedNum) / total) * 100,
        2,
      );
    }
    return calculatedPercent;
  }, [metric, psUsedNum, total, allocated, allocatableTotal, psReservedNum]);

  return (
    <BarInTable
      percent={Math.max(percent, 0)}
      extra={extra}
      tooltipList={tooltipList}
      needDecimal={true}
    />
  );
};

export default StorageProgress;
