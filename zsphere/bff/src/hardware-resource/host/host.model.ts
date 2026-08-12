import {
  ArgsType,
  Field,
  Float,
  Int,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { CpuArchitecture, HostState, HostStatus } from '@/common/enum'
import { GetMetricDataListArgs, MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { CreateActionResp } from '@/common/model/action-resp.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { AccountOwner } from '@/zsphere-administration/owner/owner.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'

import { HostNetworkBondingServiceRef } from '../bond/bond.model'
import { PhysicalNic } from '../pci-device/pci-device.model'

@ObjectType()
export class HostNameAndUuidForBond {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class BondForHost {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => Boolean, { nullable: true })
  allSlavesActive?: boolean

  @Field(() => String, { nullable: true })
  bondingName?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => [String], { nullable: true })
  ipAddresses?: string[]

  @Field(() => [PhysicalNic], { nullable: true })
  slaves?: PhysicalNic[]

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => Float, { nullable: true })
  speed?: number

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  miiStatus?: string

  @Field(() => String, { nullable: true })
  miimon?: string

  @Field(() => String, { nullable: true })
  mode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  bondingType?: string

  @Field(() => HostNameAndUuidForBond, { nullable: true })
  host?: HostNameAndUuidForBond

  @Field(() => [HostNetworkBondingServiceRef], {
    nullable: true,
    defaultValue: []
  })
  hostNetworkBondingServiceRef?: HostNetworkBondingServiceRef[]
}

export enum HostQueryType {
  Normal = 'Normal',
  CreateVmCandidate = 'CreateVmCandidate',
  StartingVmCandidate = 'StartingVmCandidate',
  GetVmMigrationCandidateHosts = 'GetVmMigrationCandidateHosts',
  LocalStorageGetVolumeMigratableHosts = 'LocalStorageGetVolumeMigratableHosts',
  GetDisasterRecoveryStorageCandidates = 'GetDisasterRecoveryStorageCandidates',
  RecoverRootVolumeBackupCandidate = 'RecoverRootVolumeBackupCandidate',
  CreateV2vConversionHostCandidate = 'CreateV2vConversionHostCandidate',
  GetHostCandidatesForAddToHostGroup = 'GetHostCandidatesForAddToHostGroup',
  GetHostByHostGroup = 'GetHostByHostGroup',
  GetHostCandidatesForVmMigration = 'GetHostCandidatesForVmMigration',
  GetHostNotInVSwitch = 'GetHostNotInVSwitch'
}
registerEnumType(HostQueryType, {
  name: 'HostQueryType'
})

export enum NodeType {
  ComputeNode = 'ComputeNode',
  ManagementNode = 'ManagementNode'
}
registerEnumType(NodeType, {
  name: 'NodeType'
})

export enum HardwareState {
  Normal = 'Normal',
  Abnormal = 'Abnormal',
  NoElectric = 'NoElectric',
  Unknown = 'Unknown'
}
registerEnumType(HardwareState, {
  name: 'HardwareState'
})
export enum HostIPMIPowerStatus {
  //开机
  POWER_ON = 'POWER_ON',
  //关机
  POWER_OFF = 'POWER_OFF',
  //开机中
  POWER_BOOTING = 'POWER_BOOTING',
  //未知 或者 null
  POWER_UNKNOWN = 'POWER_UNKNOWN',
  //关机中
  POWER_SHUTDOWN = 'POWER_SHUTDOWN',
  //未纳管
  UN_CONFIGURED = 'UN_CONFIGURED'
}
registerEnumType(HostIPMIPowerStatus, {
  name: 'HostIPMIPowerStatus'
})

@ObjectType()
export class ExtraIpsSystemTag {
  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => Boolean, { nullable: true })
  inherent: boolean

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  tag?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class HostUsage {
  @Field(() => Float, { nullable: true })
  cpuUsed?: number

  @Field(() => Float, { nullable: true })
  memoryUsed?: number

  @Field(() => Float, { nullable: true })
  storageUsed?: number
}

@ObjectType()
export class KernelInterfaces {
  @Field(() => String)
  hostUuid: string

  @Field(() => String, { description: '存储IP(Public)', nullable: true })
  publicStorageIp?: string

  @Field(() => String, { description: '存储IP(Cluster)', nullable: true })
  clusterStorageIP?: string

  @Field(() => Boolean, {
    description: '外部网络CIDR配置是否匹配',
    nullable: true
  })
  externalNetworkCidrMatched?: boolean

  @Field(() => Boolean, {
    description: '内部网络CIDR配置是否匹配',
    nullable: true
  })
  internalNetworkCidrMatched?: boolean

  @Field(() => Boolean, {
    description: '主机是否有多个CIDR下的IP',
    nullable: true
  })
  hasMultipleCidrIps?: boolean
}

@ObjectType()
export class Host extends ResourceWithAttributes {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  managementIp: string

  @Field(() => String, { nullable: true })
  callBackIp?: string

  @Field(() => String, { nullable: true })
  hypervisorType: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => HostStatus, { nullable: true })
  status: HostStatus

  @Field(() => HostState, { nullable: true })
  state: HostState

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, {
    nullable: true,
    description: '操作系统发行版，如：Ubuntu、CentOS、Debian'
  })
  osDistribution: string

  @Field(() => String, { nullable: true, description: '操作系统发布版' })
  osRelease: string

  @Field(() => String, { nullable: true, description: '操作系统版本' })
  osVersion: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => Float, { nullable: true })
  availableCpuCapacity: number

  @Field(() => Float, { nullable: true })
  availableMemoryCapacity: number

  @Field(() => Float, { nullable: true, description: 'CPU逻辑核数' })
  cpuNum: number

  @Field(() => Float, { nullable: true })
  cpuSockets: number

  @Field(() => Float, { nullable: true })
  totalCpuCapacity: number

  @Field(() => Float, { nullable: true })
  totalMemoryCapacity: number

  @Field(() => Float, { nullable: true })
  totalPhysicalMemory: number

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => String, { nullable: true })
  ipmiAddress: string

  @Field(() => Int, { nullable: true })
  ipmiPort: number

  @Field(() => String, { nullable: true })
  ipmiUsername: string

  @Field(() => String, { nullable: true })
  ipmiPassword: string

  @Field(() => HostIPMIPowerStatus, {
    defaultValue: HostIPMIPowerStatus.POWER_UNKNOWN,
    description: 'ipmiPowerStatus null的时候表示获取ipmi失败，默认 UN_CONFIGURED 没有纳管'
  })
  ipmiPowerStatus: HostIPMIPowerStatus

  @Field(() => [BondForHost], { nullable: true })
  bondRelatedVSwitch?: BondForHost[]

  @Field(() => HostUsage, { nullable: true })
  hostUsage?: HostUsage

  @Field(() => String, { nullable: true, description: '主机IQN' })
  iscsiInitiatorName?: string

  @Field(() => String, { nullable: true })
  nqn?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => KernelInterfaces, { nullable: true })
  kernelInterfaces?: KernelInterfaces
}

@ObjectType()
export class LocalStorageHostDiskCapacity {
  @Field(() => Float, { nullable: true })
  availableCapacity: number

  @Field(() => Float, { nullable: true })
  availablePhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  totalCapacity: number

  @Field(() => Float, { nullable: true })
  totalPhysicalCapacity: number

  @Field(() => String, { nullable: true })
  hostUuid: string
}

@ObjectType()
export class HostIommu {
  @Field(() => String, { nullable: true })
  state: string

  @Field(() => String, { nullable: true })
  status: string
}

// 比如，cpuSocketCoreThread::1::10::2 表示：
// cpuSockets = 1
// cpuCoresPerSocket = 10
// cpuThreadsPerCore = 2

@ObjectType()
export class CPUSocketCoreThread {
  @Field(() => Int, { nullable: true, description: '插槽数量' })
  sockets?: number

  @Field(() => Int, { nullable: true, description: '插槽里有几个核' })
  coresPerSocket?: number

  @Field(() => Int, { nullable: true, description: '每个核心有几个线程' })
  threadsPerCore?: number
}

@ObjectType()
export class HostSystemInfo {
  @Field(() => String, { nullable: true })
  cpuModelName: string

  @Field(() => String, { nullable: true })
  hostCpuModelName: string

  @Field(() => Boolean, { nullable: true })
  ept: boolean

  @Field(() => String, { nullable: true })
  eptUuid: string

  @Field(() => String, {
    nullable: true,
    defaultValue: 'None',
    description: 'IPMI地址'
  })
  ipmiAddress?: string

  @Field(() => String, { nullable: true, description: 'SN号' })
  systemSerialNumber?: string

  @Field(() => String, { nullable: true, description: '主机型号' })
  systemProductName?: string

  @Field(() => String, { nullable: true, description: 'CPU主频' })
  cpuGHz?: string

  @Field(() => Float, { nullable: true, description: 'CPU逻辑核数' })
  cpuProcessorNum?: number

  @Field(() => CPUSocketCoreThread, {
    nullable: true,
    description: 'CPU核心相关信息，为什么这么拿：'
  })
  cpuSocketCoreThread?: CPUSocketCoreThread
}

@ObjectType()
export class HostHardwareInfo {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  manufacturer: string

  @Field(() => String, { nullable: true })
  productName: string

  @Field(() => String, { nullable: true })
  serialNumber: string

  @Field(() => String, { nullable: true })
  systemUuid: string

  @Field(() => String, { nullable: true })
  uptime: string

  // --------------------
  @Field(() => String, { nullable: true })
  ipmiAddress: string

  @Field(() => String, { nullable: true })
  bmcVersion: string

  @Field(() => String, { nullable: true })
  biosVendor: string

  @Field(() => String, { nullable: true })
  biosVersion: string

  @Field(() => String, { nullable: true })
  biosReleaseDate: string
}

@ObjectType()
export class HostSlotInfo {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  memorySlotsMaximum: string
}

@ObjectType()
export class HostGlobalConfig {
  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总量（超分后的）。超分率X总量。'
  })
  overProvisioningTotalMemory: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '可用总量（超分后的）。超分率X可用总量。'
  })
  overProvisioningAvailableMemory: number

  @Field(() => String, {
    nullable: true,
    description:
      '保留内存，优先取host的保留内存，如果没有设置则取cluster的保留内存，如果还是没有设置则取全局配置。'
  })
  reservedMemory: string

  @Field(() => Float, {
    nullable: true,
    description: '可用物理内存，后端已经去除了保留内存。'
  })
  availableCpuMemoryCapacity

  @Field(() => Float, {
    nullable: true,
    description: '可用物理内存，后端已经去除了保留内存。'
  })
  availableMemory: number

  @Field(() => Float, { nullable: true, description: '总物理内存。' })
  totalMemory: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '超分后的可用CPU。'
  })
  availableCpu: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '超分后的总CPU。'
  })
  totalCpu: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总物理CPU。'
  })
  managedCpuNum: number

  @Field(() => Float, { nullable: true, description: '内存超分率' })
  memoryOverProvisioning: number
}

@ObjectType()
export class HostZWatchInfo {
  @Field(() => String, { nullable: true })
  cpuAllIdleUtilization: string

  @Field(() => String, { nullable: true })
  memoryFreeInPercent: string

  @Field(() => String, {
    nullable: true,
    defaultValue: '0',
    description: 'CPU使用率'
  })
  cpuAllUsedUtilization: string

  @Field(() => String, {
    nullable: true,
    defaultValue: '0',
    description: '内存使用率'
  })
  memoryUsedInPercent: string

  @Field(() => String, {
    nullable: true,
    defaultValue: '0',
    description: '内存可用容量'
  })
  memoryFreeBytes: string
}

@ObjectType()
export class HostNodeInfo {
  @Field(() => NodeType, { nullable: true })
  nodeType?: NodeType

  @Field(() => Boolean, { nullable: true })
  ownsVip?: boolean
}

@ObjectType()
export class HostGroupNameAndUuidForHost {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string
}

@ObjectType()
export class HostVO extends Host {
  @Field(() => HostGlobalConfig, { nullable: true })
  globalConifg: HostGlobalConfig

  @Field(() => Cluster, { nullable: true })
  cluster: Cluster

  @Field(() => [Tag], { nullable: true })
  tag: Tag[]

  @Field(() => AccountOwner, { nullable: true })
  owner: AccountOwner

  @Field(() => Zone, { nullable: true })
  zone: Zone

  @Field(() => LocalStorageHostDiskCapacity, { nullable: true })
  localStorageHostDiskCapacity: LocalStorageHostDiskCapacity

  @Field(() => HostSystemInfo, { nullable: true })
  hostSystemInfo: HostSystemInfo

  @Field(() => HostIommu, { nullable: true })
  hostIommu: HostIommu

  @Field(() => HostZWatchInfo, { nullable: true })
  hostZWatchInfo: HostZWatchInfo

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  relatedVmCount: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  relatedVolumeCount: number

  @Field(() => String, { nullable: true })
  extraIps?: string

  @Field(() => Boolean, { nullable: true })
  hostTopology?: boolean

  @Field(() => String, { nullable: true })
  connectedTime?: string

  @Field(() => HostNodeInfo, { nullable: true })
  hostNodeInfo?: HostNodeInfo

  @Field(() => [PhysicalNic])
  physicalNicList: PhysicalNic[]

  @Field(() => [BondForHost])
  bondList: BondForHost[]

  @Field(() => String, { nullable: true })
  qemuState: string

  @Field(() => HostGroupNameAndUuidForHost, { nullable: true })
  hostGroup: HostGroupNameAndUuidForHost
}

@ObjectType()
export class HostSummary {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  enabled: number

  @Field(() => Int, { nullable: true })
  disabled: number

  @Field(() => Int, { nullable: true })
  maintenance: number

  @Field(() => Int, { nullable: true })
  other: number
}

@ObjectType()
export class HostQueryResp extends QueryCommonResponse(HostVO) {}

@ObjectType()
export class HostActionResp extends CreateActionResp(HostVO) {}

@ArgsType()
export class QueryHostArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => HostQueryType, { nullable: true })
  type?: HostQueryType

  @Field(() => Int, { nullable: true })
  topNumber?: number

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string
}

@ObjectType()
class HostLabels {
  @Field(() => String)
  HostUuid: string

  @Field(() => String, { nullable: true })
  CPUNum: string

  @Field(() => String, { nullable: true })
  NetworkDeviceLetter: string

  @Field(() => String, { nullable: true })
  DiskDeviceLetter: string
}

@ArgsType()
export class GetHostMetricDataListArgs extends OmitType(GetMetricDataListArgs, [
  'namespace',
  'metricList'
]) {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  metricNames: string[]
}

@ObjectType()
export class HostMetricData extends MetricData {
  @Field(() => HostLabels)
  labels: HostLabels
}

@ObjectType()
export class HostPowerControlRelatedSummary {
  @Field(() => Int, { nullable: true })
  vm?: number

  @Field(() => Int, { nullable: true })
  vpcRouter?: number

  @Field(() => Int, { nullable: true })
  volume?: number

  @Field(() => Int, { nullable: true })
  loadbalance?: number

  @Field(() => Int, { nullable: true })
  cephLocalStorage?: number
}
@ObjectType()
export class HostRelatedSummary {
  @Field(() => Int, { nullable: true })
  vm?: number

  @Field(() => Int, { nullable: true })
  scsiLun?: number

  @Field(() => Int, { nullable: true })
  nvmeLun?: number

  @Field(() => Int, { nullable: true })
  physicalNic?: number

  @Field(() => Int, { nullable: true })
  gpu?: number

  @Field(() => Int, { nullable: true })
  vGpu?: number

  @Field(() => Int, { nullable: true })
  usb?: number

  @Field(() => Int, { nullable: true })
  pci?: number

  @Field(() => Int, { nullable: true })
  pciPassthrough?: number

  @Field(() => Int, { nullable: true })
  memory?: number

  @Field(() => Int, { nullable: true })
  cpu?: number

  @Field(() => Int, { nullable: true })
  power?: number

  @Field(() => Int, { nullable: true })
  storageAdapter?: number
}

@ObjectType()
export class HostWebTerminal {
  @Field(() => String, { nullable: true })
  url: string
}
