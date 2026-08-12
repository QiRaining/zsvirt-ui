import { ArgsType, Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { Host } from '@/hardware-resource/host/host.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

export enum PerformanceType {
  VmInstance = 'VmInstance',
  Router = 'Router',
  Host = 'Host',
  BackupStorage = 'BackupStorage',
  L3Network = 'L3Network',
  Vip = 'Vip'
}

export enum ExportMetricsValue {
  average = 'average',
  top = 'top',
  low = 'low'
}

registerEnumType(ExportMetricsValue, {
  name: 'ExportMetricsValue'
})

registerEnumType(PerformanceType, {
  name: 'PerformanceType'
})

export enum PerformanceThresholdSymbolType {
  GreaterEqual = 'GreaterEqual',
  LessEqual = 'LessEqual'
}

registerEnumType(PerformanceThresholdSymbolType, {
  name: 'PerformanceThresholdSymbolType'
})

@InputType()
class PerformanceExportMetric {
  @Field(() => String)
  key: string

  @Field(() => [ExportMetricsValue])
  values: ExportMetricsValue[]
}

@ArgsType()
@ObjectType()
export class QueryPerformanceArgs extends QueryAction {
  @Field(() => PerformanceType, { nullable: true })
  declare type?: PerformanceType

  @Field(() => [String], { nullable: true })
  metrics?: string[]

  @Field(() => [PerformanceExportMetric], { nullable: true })
  exportMetrics?: PerformanceExportMetric[]

  @Field(() => String, { nullable: true })
  startTime?: string

  @Field(() => String, { nullable: true })
  endTime?: string

  @Field(() => String, { nullable: true })
  thresholdNum?: string

  @Field(() => PerformanceThresholdSymbolType, { nullable: true })
  thresholdSymbol: PerformanceThresholdSymbolType

  @Field(() => String, { nullable: true })
  thresholdMetric?: string
}

export enum VmInstancePerformanceMetricType {
  VRouterCPUUsedUtilization = 'VRouterCPUUsedUtilization',
  VRouterCPUAverageSystemUtilization = 'VRouterCPUAverageSystemUtilization',
  VRouterCPUAverageUserUtilization = 'VRouterCPUAverageUserUtilization',
  VRouterCPUAverageWaitUtilization = 'VRouterCPUAverageWaitUtilization',
  VRouterCPUAverageIdleUtilization = 'VRouterCPUAverageIdleUtilization',
  VRouterMemoryUsedPercent = 'VRouterMemoryUsedPercent',
  VRouterMemoryFreePercent = 'VRouterMemoryFreePercent',
  VRouterDiskUsedCapacityInPercent = 'VRouterDiskUsedCapacityInPercent',
  VRouterDiskAllFreeCapacityInPercent = 'VRouterDiskAllFreeCapacityInPercent',
  OperatingSystemCPUAverageUsedUtilization = 'OperatingSystemCPUAverageUsedUtilization',
  OperatingSystemCPUAverageSystemUtilization = 'OperatingSystemCPUAverageSystemUtilization',
  OperatingSystemCPUAverageUserUtilization = 'OperatingSystemCPUAverageUserUtilization',
  OperatingSystemCPUAverageWaitUtilization = 'OperatingSystemCPUAverageWaitUtilization',
  OperatingSystemCPUAverageIdleUtilization = 'OperatingSystemCPUAverageIdleUtilization',
  OperatingSystemMemoryUsedPercent = 'OperatingSystemMemoryUsedPercent',
  OperatingSystemMemoryFreePercent = 'OperatingSystemMemoryFreePercent',
  DiskUsedCapacityInPercent = 'DiskUsedCapacityInPercent',
  DiskFreeCapacityInPercent = 'DiskFreeCapacityInPercent',
  CPUAverageUsedUtilization = 'CPUAverageUsedUtilization',
  MemoryUsedInPercent = 'MemoryUsedInPercent',
  DiskAllReadBytes = 'DiskAllReadBytes',
  DiskAllWriteBytes = 'DiskAllWriteBytes',
  DiskAllReadOps = 'DiskAllReadOps',
  DiskAllWriteOps = 'DiskAllWriteOps',
  NetworkAllInBytes = 'NetworkAllInBytes',
  NetworkAllOutBytes = 'NetworkAllOutBytes',
  NetworkAllInPackets = 'NetworkAllInPackets',
  NetworkAllOutPackets = 'NetworkAllOutPackets',
  NetworkAllInErrors = 'NetworkAllInErrors',
  NetworkAllOutErrors = 'NetworkAllOutErrors',
  DiskAllUsedCapacityInPercent = 'DiskAllUsedCapacityInPercent',
  DiskAllFreeCapacityInPercent = 'DiskAllFreeCapacityInPercent'
}

registerEnumType(VmInstancePerformanceMetricType, {
  name: 'VmInstancePerformanceMetricType'
})

@InputType()
class VmInstanceExportMetric {
  @Field(() => VmInstancePerformanceMetricType)
  key: VmInstancePerformanceMetricType

  @Field(() => [ExportMetricsValue])
  values: ExportMetricsValue[]
}

@ArgsType()
export class QueryVmInstancePerformanceArgs extends QueryPerformanceArgs {
  @Field(() => PerformanceType, { nullable: true })
  declare type?: PerformanceType

  @Field(() => [VmInstancePerformanceMetricType])
  declare metrics?: VmInstancePerformanceMetricType[]

  @Field(() => [VmInstanceExportMetric], { nullable: true })
  declare exportMetrics?: VmInstanceExportMetric[]

  @Field(() => VmInstancePerformanceMetricType, { nullable: true })
  declare thresholdMetric?: VmInstancePerformanceMetricType
}

@ObjectType()
export class VmInstancePerformance extends VmInstance {
  // inner
  @Field(() => String, { nullable: true })
  OperatingSystemCPUAverageUsedUtilization?: string

  @Field(() => String, { nullable: true })
  OperatingSystemCPUAverageSystemUtilization?: string

  @Field(() => String, { nullable: true })
  OperatingSystemCPUAverageUserUtilization?: string

  @Field(() => String, { nullable: true })
  OperatingSystemCPUAverageWaitUtilization?: string

  @Field(() => String, { nullable: true })
  OperatingSystemCPUAverageIdleUtilization?: string

  @Field(() => String, { nullable: true })
  OperatingSystemMemoryUsedPercent?: string

  @Field(() => String, { nullable: true })
  OperatingSystemMemoryFreePercent?: string

  @Field(() => String, { nullable: true })
  DiskUsedCapacityInPercent?: string

  @Field(() => String, { nullable: true })
  DiskFreeCapacityInPercent?: string

  //outer
  @Field(() => String, { nullable: true })
  CPUAverageUsedUtilization?: string

  @Field(() => String, { nullable: true })
  MemoryUsedInPercent?: string

  @Field(() => String, { nullable: true })
  DiskAllReadBytes?: string

  @Field(() => String, { nullable: true })
  DiskAllWriteBytes?: string

  @Field(() => String, { nullable: true })
  DiskAllReadOps?: string

  @Field(() => String, { nullable: true })
  DiskAllWriteOps?: string

  @Field(() => String, { nullable: true })
  NetworkAllInBytes?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutBytes?: string

  @Field(() => String, { nullable: true })
  NetworkAllInPackets?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutPackets?: string

  @Field(() => String, { nullable: true })
  NetworkAllInErrors?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutErrors?: string

  @Field(() => String, { nullable: true })
  DiskAllUsedCapacityInPercent?: string

  @Field(() => String, { nullable: true })
  DiskAllFreeCapacityInPercent?: string
}

@ObjectType()
export class VmInstancePerformanceQueryResp extends QueryCommonResponse(VmInstancePerformance) {}

@ObjectType()
export class HostPerformance extends Host {
  @Field(() => String, { nullable: true })
  CPUAllUsedUtilization?: string

  @Field(() => String, { nullable: true })
  MemoryUsedInPercent?: string

  @Field(() => String, { nullable: true })
  DiskAllReadBytes?: string

  @Field(() => String, { nullable: true })
  DiskAllWriteBytes?: string

  @Field(() => String, { nullable: true })
  DiskAllReadOps?: string

  @Field(() => String, { nullable: true })
  DiskAllWriteOps?: string

  @Field(() => String, { nullable: true })
  DiskAllUsedCapacityInPercent?: string

  @Field(() => String, { nullable: true })
  DiskAllUsedCapacityInBytes?: string

  @Field(() => String, { nullable: true })
  NetworkAllInBytes?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutBytes?: string

  @Field(() => String, { nullable: true })
  NetworkAllInPackets?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutPackets?: string

  @Field(() => String, { nullable: true })
  NetworkAllInErrors?: string

  @Field(() => String, { nullable: true })
  NetworkAllOutErrors?: string
}

export enum HostPerformanceMetricType {
  CPUAllUsedUtilization = 'CPUAllUsedUtilization',
  MemoryUsedInPercent = 'MemoryUsedInPercent',
  DiskAllReadBytes = 'DiskAllReadBytes',
  DiskAllWriteBytes = 'DiskAllWriteBytes',
  DiskAllReadOps = 'DiskAllReadOps',
  DiskAllWriteOps = 'DiskAllWriteOps',
  DiskAllUsedCapacityInPercent = 'DiskAllUsedCapacityInPercent',
  DiskAllUsedCapacityInBytes = 'DiskAllUsedCapacityInBytes',
  NetworkAllInBytes = 'NetworkAllInBytes',
  NetworkAllOutBytes = 'NetworkAllOutBytes',
  NetworkAllInPackets = 'NetworkAllInPackets',
  NetworkAllOutPackets = 'NetworkAllOutPackets',
  NetworkAllInErrors = 'NetworkAllInErrors',
  NetworkAllOutErrors = 'NetworkAllOutErrors'
}

registerEnumType(HostPerformanceMetricType, {
  name: 'HostPerformanceMetricType'
})

@ArgsType()
export class QueryHostPerformanceArgs extends QueryPerformanceArgs {
  @Field(() => PerformanceType, { nullable: true })
  declare type?: PerformanceType

  @Field(() => [HostPerformanceMetricType])
  declare metrics?: HostPerformanceMetricType[]

  @Field(() => HostPerformanceMetricType, { nullable: true })
  declare thresholdMetric?: HostPerformanceMetricType
}

@ObjectType()
export class HostPerformanceQueryResp extends QueryCommonResponse(HostPerformance) {}

@ObjectType()
export class L3NetworkPerformance extends L3Network {
  @Field(() => String, { nullable: true })
  UsedIPCount?: string

  @Field(() => String, { nullable: true })
  UsedIPInPercent?: string

  @Field(() => String, { nullable: true })
  AvailableIPCount?: string

  @Field(() => String, { nullable: true })
  AvailableIPInPercent?: string
}

export enum L3NetworkPerformanceMetricType {
  UsedIPCount = 'UsedIPCount',
  UsedIPInPercent = 'UsedIPInPercent',
  AvailableIPCount = 'AvailableIPCount',
  AvailableIPInPercent = 'AvailableIPInPercent'
}

registerEnumType(L3NetworkPerformanceMetricType, {
  name: 'L3NetworkPerformanceMetricType'
})

@ArgsType()
export class QueryL3NetworkPerformanceArgs extends QueryPerformanceArgs {
  @Field(() => PerformanceType, { nullable: true })
  declare type?: PerformanceType

  @Field(() => [L3NetworkPerformanceMetricType])
  declare metrics?: L3NetworkPerformanceMetricType[]

  @Field(() => L3NetworkPerformanceMetricType, { nullable: true })
  declare thresholdMetric?: L3NetworkPerformanceMetricType
}

@ObjectType()
export class L3NetworkPerformanceQueryResp extends QueryCommonResponse(L3NetworkPerformance) {}

@ObjectType()
export class BackupStoragePerformance extends BackupStorage {
  @Field(() => String, { nullable: true })
  AvailableCapacityInBytes?: string

  @Field(() => String, { nullable: true })
  UsedCapacityInPercent?: string
}

export enum BackupStoragePerformanceMetricType {
  AvailableCapacityInBytes = 'AvailableCapacityInBytes',
  UsedCapacityInPercent = 'UsedCapacityInPercent'
}

registerEnumType(BackupStoragePerformanceMetricType, {
  name: 'BackupStoragePerformanceMetricType'
})

@ArgsType()
export class QueryBackupStoragePerformanceArgs extends QueryPerformanceArgs {
  @Field(() => PerformanceType, { nullable: true })
  declare type?: PerformanceType

  @Field(() => [BackupStoragePerformanceMetricType])
  declare metrics?: BackupStoragePerformanceMetricType[]

  @Field(() => BackupStoragePerformanceMetricType, { nullable: true })
  declare thresholdMetric?: BackupStoragePerformanceMetricType
}

@ObjectType()
export class BackupStoragePerformanceQueryResp extends QueryCommonResponse(
  BackupStoragePerformance
) {}

export enum VipNetworkPerformanceMetricType {
  VIPInBoundTrafficInBytes = 'VIPInBoundTrafficInBytes',
  VIPInBoundTrafficInPackages = 'VIPInBoundTrafficInPackages',
  VIPOutBoundTrafficInBytes = 'VIPOutBoundTrafficInBytes',
  VIPOutBoundTrafficInPackages = 'VIPOutBoundTrafficInPackages'
}

registerEnumType(VipNetworkPerformanceMetricType, {
  name: 'VipNetworkPerformanceMetricType'
})
