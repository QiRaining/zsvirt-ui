import { PrimaryStorageCapacity } from "@zstack/zsphere-types/graphql";

// 具体指的是分配比 还是使用率
export type MetricType =
  | "virtualCapacityAllocationRatio"
  | "imageStoreCapacityUtilization"
  | "capacityUtilization"
  | "cpuMemoryUtilization";

export type ResourceType = "cpu" | "memory" | "storage" | "network";

export type PoolType = "primary" | "ceph" | "vhost" | "cbd";

export interface IStorageCalculations {
  psUsedNum: number;
  reservedPhysicalCapacity: number;
  allocatableTotal: number;
  allocated: number;
  remainingAllocatable: number;
  overProvisioningTotal: number;
}

export interface IprimaryStoragePoolCapacity {
  volumeSnapshotSize?: number;
  imageCacheSize?: number;
  volumeSize?: number;
  volumeActualSize?: number;
  vmTemplateVolumeCacheSize?: number;
  reservedCapacity?: number;
}

export interface ResourceUsageProgressProps {
  isFormat?: boolean;
  resourceType?: ResourceType;
  metric?: MetricType;
  poolType?: PoolType;
  tooltipTitle?: React.ReactNode;
  extraLabel?: string | React.ReactNode;
  total?: number;
  available?: number;
  usedNum?: number;
  reserved?: number;
  primaryStorageCapacity?: PrimaryStorageCapacity;
  primaryStoragePoolCapacity?: IprimaryStoragePoolCapacity;
}
