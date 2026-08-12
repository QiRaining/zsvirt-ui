import { PrimaryStorageCapacity } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, formatPercent } from "@zstack/zsphere-utils";
import { floor as _floor } from "lodash-es";

import {
  IprimaryStoragePoolCapacity,
  IStorageCalculations,
  PoolType,
} from "./type";

const METRICS = {
  CPU_MEM_UTIL: "cpuMemoryUtilization",
  CAPACITY_UTIL: "capacityUtilization",
  IMAGE_STORE_UTIL: "imageStoreCapacityUtilization",
  VIRTUAL_CAPACITY_RATIO: "virtualCapacityAllocationRatio",
} as const;

const getAvailableValue = (params: {
  metric?: string;
  available: number;
  total: number;
  usedNum: number;
  reserved: number;
}) => {
  const { metric, available, total, usedNum, reserved } = params;
  if (available <= 0) return 0;

  const availableMap = {
    [METRICS.CAPACITY_UTIL]: total - usedNum,
    [METRICS.CPU_MEM_UTIL]: available,
    [METRICS.IMAGE_STORE_UTIL]: available,
    default: available - reserved,
  };

  return (
    availableMap[metric as keyof typeof availableMap] ?? availableMap.default
  );
};

const getDisplayValue = (params: {
  metric?: string;
  isMemory: boolean;
  isFormat: boolean;
  availableValue: number;
  total: number;
  usedNum: number;
  reserved: number;
  available: number;
}) => {
  const {
    metric,
    isMemory,
    isFormat,
    availableValue,
    total,
    usedNum,
    reserved,
    available,
  } = params;

  const valueMap = {
    [METRICS.CPU_MEM_UTIL]: isMemory
      ? formatBytesToSize(availableValue)
      : formatPercent(availableValue),
    [METRICS.CAPACITY_UTIL]: isFormat
      ? formatBytesToSize(total - usedNum - reserved)
      : total - usedNum - reserved,
    default: isFormat
      ? formatBytesToSize(available - reserved)
      : available - reserved,
  };

  return valueMap[metric as keyof typeof valueMap] ?? valueMap.default;
};

const formatCPU = (value: number) => {
  if (!value) return "-";
  const num = _floor(value, 2);
  return `${num} GHz`;
};

const calculateStorageMetrics = (params: {
  poolType: PoolType;
  primaryStorageCapacity: PrimaryStorageCapacity;
  primaryStoragePoolCapacity: IprimaryStoragePoolCapacity;
  total: number;
  available: number;
  reserved: number;
}) => {
  const {
    poolType,
    primaryStorageCapacity = {},
    primaryStoragePoolCapacity = {},
    total,
    available,
    reserved,
  } = params;

  const {
    imageCacheSize = 0,
    volumeSize = 0,
    volumeSnapshotSize = 0,
    vmTemplateVolumeCacheSize = 0,
    reservedCapacity = 0,
  } = poolType === "primary"
    ? primaryStorageCapacity
    : primaryStoragePoolCapacity;

  const {
    reservedCapacity: psReservedNum = reserved,
    overProvisioningPrimaryStorage: overProvisioning = 1,
    thresholdPrimaryStoragePhysicalCapacity = 0.9,
  } = primaryStorageCapacity;

  // 本地存储的情况下
  const { systemUsedCapacity: systemUsedNum = 0 } = primaryStorageCapacity;

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
    vmTemplateVolumeCacheSize +
    systemUsedNum;

  const remainingAllocatable = allocatableTotal - allocated;

  return {
    psUsedNum,
    reservedPhysicalCapacity,
    overProvisioningTotal,
    allocatableTotal,
    allocated,
    remainingAllocatable,
  };
};

const getComplexPercent = (params: {
  total: number;
  isStorage: boolean;
  storageCalculations: any;
  metric?: string;
  isCpu: boolean;
  usedNum: number;
  availableValue: number;
  reserved: number;
}) => {
  const {
    total,
    isStorage,
    storageCalculations,
    metric,
    isCpu,
    usedNum,
    availableValue,
    reserved,
  } = params;

  if (Number(total) <= 0) return 0;

  if (isStorage && storageCalculations) {
    const { psUsedNum, allocated, allocatableTotal } = storageCalculations;

    if (metric === METRICS.VIRTUAL_CAPACITY_RATIO) {
      return allocatableTotal > 0
        ? _floor(Math.min(1, allocated / allocatableTotal) * 100, 8)
        : 0;
    }

    return _floor(
      Math.min(1, (psUsedNum ?? total - reserved) / total) * 100,
      2,
    );
  }

  if (metric === METRICS.CPU_MEM_UTIL) {
    return isCpu
      ? _floor(usedNum, 2)
      : _floor(Number((100 * usedNum) / total), 2);
  }

  return _floor(Number((1 - Number(availableValue) / Number(total)) * 100), 2);
};

const getTooltipList = (params: {
  intl: any;
  isStorage: boolean;
  storageCalculations: IStorageCalculations | null;
  metric?: string;
  isCpu: boolean;
  total: number;
  usedNum: number;
  availableValue: number;
  isFormat: boolean;
  isNetWork: boolean;
  available: number;
  reserved: number;
}) => {
  const {
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
  } = params;

  if (isStorage && storageCalculations) {
    const {
      psUsedNum,
      reservedPhysicalCapacity,
      allocatableTotal,
      allocated,
      remainingAllocatable,
    } = storageCalculations;

    return metric === METRICS.VIRTUAL_CAPACITY_RATIO
      ? [
          {
            label: intl.formatMessage({
              id: "allocatable.total.amount",
              defaultMessage: "Total Allocatable",
            }),
            value: formatBytesToSize(allocatableTotal),
          },
          {
            label: intl.formatMessage({
              id: "allocated",
              defaultMessage: "Allocated",
            }),
            value: formatBytesToSize(allocated),
          },
          {
            label: intl.formatMessage({
              id: "remaining.allocatable",
              defaultMessage: "Free to Allocate",
            }),
            value: formatBytesToSize(remainingAllocatable),
          },
        ]
      : [
          {
            label: intl.formatMessage({
              id: "physical.total",
              defaultMessage: "Physical Total",
            }),
            value: formatBytesToSize(total),
          },
          {
            label: intl.formatMessage({
              id: "physical.used",
              defaultMessage: "Physical Used",
            }),
            value: formatBytesToSize(psUsedNum ?? total - reserved),
          },
          {
            label: intl.formatMessage({
              id: "physical.available",
              defaultMessage: "Physical Available",
            }),
            value: formatBytesToSize(
              total - psUsedNum - reservedPhysicalCapacity,
            ),
          },
          {
            label: intl.formatMessage({
              id: "reservedPhysicalCapacity",
              defaultMessage: "Safety Threshold Capacity",
            }),
            value: formatBytesToSize(reservedPhysicalCapacity),
          },
        ];
  }

  const commonData = [
    {
      label: intl.formatMessage({
        id: "physical.total",
        defaultMessage: "Physical Total",
      }),
      value: !isCpu ? formatBytesToSize(total) : formatCPU(total),
    },
    {
      label: intl.formatMessage({
        id: "physical.used",
        defaultMessage: "Physical Used",
      }),
      value: !isCpu ? formatBytesToSize(usedNum) : formatPercent(usedNum),
    },
    {
      label: intl.formatMessage({
        id: "physical.available",
        defaultMessage: "Physical Available",
      }),
      value: !isCpu
        ? formatBytesToSize(availableValue)
        : formatPercent(availableValue),
    },
  ];

  if (metric === METRICS.CPU_MEM_UTIL) {
    return commonData;
  }

  if (metric === METRICS.CAPACITY_UTIL) {
    return [
      ...commonData,
      {
        label: intl.formatMessage({
          id: "reservedPhysicalCapacity",
          defaultMessage: "Safety Threshold Capacity",
        }),
        value: isFormat ? formatBytesToSize(reserved) : reserved,
      },
    ];
  }

  return [
    {
      label: intl.formatMessage({
        id: "totalQuantity",
        defaultMessage: "Total",
      }),
      value: isFormat ? formatBytesToSize(total) : total,
    },
    {
      label: isNetWork
        ? intl.formatMessage({ id: "usedQuantity", defaultMessage: "Used" })
        : intl.formatMessage({
            id: "physical.used",
            defaultMessage: "Physical Used",
          }),
      value: isFormat
        ? formatBytesToSize(total - available)
        : total - available,
    },
    {
      label: intl.formatMessage({
        id: "availableQuantity",
        defaultMessage: "Available",
      }),
      value: isFormat
        ? formatBytesToSize(available - reserved)
        : available - reserved,
    },
  ];
};

const getExtraContentData = (params: {
  isStorage: boolean;
  storageCalculations: any;
  metric?: string;
  total: number;
  intl: any;
  isMemory: boolean;
  isFormat: boolean;
  availableValue: number;
  usedNum: number;
  reserved: number;
  available: number;
}) => {
  const {
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
  } = params;

  if (isStorage && storageCalculations) {
    const availableSpace =
      metric === METRICS.VIRTUAL_CAPACITY_RATIO
        ? formatBytesToSize(storageCalculations.remainingAllocatable)
        : formatBytesToSize(
            total -
              storageCalculations.psUsedNum -
              storageCalculations.reservedPhysicalCapacity,
          );

    return {
      label: intl.formatMessage({ id: "avaliable", defaultMessage: "Available" }),
      value: availableSpace,
    };
  }

  const displayValue = getDisplayValue({
    metric,
    isMemory,
    isFormat,
    availableValue,
    total,
    usedNum,
    reserved,
    available,
  });

  return {
    label: intl.formatMessage({ id: "avaliable", defaultMessage: "Available" }),
    value: displayValue,
  };
};

export {
  METRICS,
  formatCPU,
  getAvailableValue,
  getDisplayValue,
  calculateStorageMetrics,
  getComplexPercent,
  getTooltipList,
  getExtraContentData,
};
