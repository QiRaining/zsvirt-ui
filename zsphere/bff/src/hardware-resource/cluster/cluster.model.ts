import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql'

import { ClusterState, CpuArchitecture, HostState, HostStatus } from '@/common/enum'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError, CreateActionResp } from '@/common/model/action-resp.model'
import { ActionInput } from '@/common/model/action.model'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { BaremetalPxeServer } from '@/zsphere-resource/baremetal/baremetal-pxe-server/baremetal-pxe-server.model'

export enum ClusterStateEvent {
  enable = 'enable',
  disable = 'disable'
}

export enum DRSVmMigrationActivityStatus {
  Created,
  InProgress,
  Successful,
  Failed
}

registerEnumType(ClusterStateEvent, {
  name: 'ClusterStateEvent'
})

registerEnumType(DRSVmMigrationActivityStatus, {
  name: 'DRSVmMigrationActivityStatus'
})

export enum ClusterQueryType {
  Normal = 'Normal',
  CreateVmCandidate = 'CreateVmCandidate',
  ClusterAttachableL2Network = 'ClusterAttachableL2Network',
  PsAttachableCluster = 'PsAttachableCluster',
  ISCSIServerAttachableCluster = 'ISCSIServerAttachableCluster',
  GetClusterByISCSIServer = 'GetClusterByISCSIServer',
  NvmeServerAttachableCluster = 'NvmeServerAttachableCluster',
  GetClusterByNvmeServer = 'GetClusterByNvmeServer',
  BaremetalPxeserviceAttachableCluster = 'BaremetalPxeserviceAttachableCluster',
  BareMetal2GatewayCanChangedCluster = 'BareMetal2GatewayCanChangedCluster',
  BaremetalPxeserviceDetachableCluster = 'BaremetalPxeserviceDetachableCluster'
}

registerEnumType(ClusterQueryType, {
  name: 'ClusterQueryType'
})

@ArgsType()
export class QueryClusterArgs extends QueryAction {
  @Field(() => ClusterQueryType, { nullable: true })
  declare type?: ClusterQueryType
}

@ObjectType()
export class ClusterZWatchInfo {
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
export class CpuMemoryCapacity {
  @Field(() => Int, { nullable: true })
  totalCpu?: number

  @Field(() => Int, { nullable: true })
  availableCpu?: number

  @Field(() => Int, { nullable: true })
  physicalCpu?: number

  @Field(() => String, { nullable: true, description: '保留内存' })
  reservedMemory?: string

  @Field(() => Float, { nullable: true })
  totalMemory?: number

  @Field(() => Float, { nullable: true })
  availableMemory?: number

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
}

@ObjectType()
export class ClusterResourceConfigValue {
  @Field(() => String, { nullable: true })
  hostCpuOverProvisioningRatio?: string

  @Field(() => String, { nullable: true })
  mevocoOverProvisioningMemory?: string

  @Field(() => String, { nullable: true })
  kvmIgnoreMsrs?: string

  @Field(() => String, { nullable: true })
  premiumClusterEnableZeroCopy?: string

  @Field(() => String, { nullable: true })
  kvmReservedMemory?: string

  @Field(() => String, { nullable: true })
  premiumClusterHugepageEnable?: string

  @Field(() => String, { nullable: true }) // 虚拟机高可用
  haVmHaLevel?: string

  @Field(() => String, { nullable: true }) // 虚拟夸集群高可用
  vmVmHaAcrossClusters?: string

  @Field(() => String, { nullable: true })
  vmEmulateHyperV?: string

  @Field(() => String, { nullable: true })
  vmVideoType?: string

  @Field(() => String, { nullable: true })
  kvmAutoSetVmNicMultiqueue?: string

  @Field(() => String, { nullable: true })
  drsDrsMigrateVmConcurrent?: string

  @Field(() => String, { nullable: true })
  drsDrsSchedulingInterval?: string
}

@ObjectType()
export class HostNameAndUuidForCluster {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => HostStatus, { nullable: true })
  status: HostStatus

  @Field(() => HostState, { nullable: true })
  state: HostState
}

@ObjectType()
export class Cluster {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  vtepCidr: string

  @Field(() => ClusterState, { nullable: true })
  state: ClusterState

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => String, { nullable: true })
  hypervisorType: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => Int, { nullable: true })
  hostNum?: number

  @Field(() => [HostNameAndUuidForCluster], { nullable: true })
  hostList?: HostNameAndUuidForCluster[]

  @Field(() => Boolean, { nullable: true })
  isAttachL2network?: boolean

  @Field(() => Boolean, { nullable: true })
  isAttachPrimaryStorage?: boolean

  @Field(() => Boolean, { nullable: true })
  isMaintenanceOfAllHost?: boolean

  @Field(() => Boolean, { nullable: true })
  isShowDrsTab?: boolean

  @Field(() => Boolean, { nullable: true })
  isSupported?: boolean

  @Field(() => [String], { nullable: true })
  psTypes?: string[]

  @Field(() => CpuMemoryCapacity, { nullable: true })
  cpuMemoryCapacity: CpuMemoryCapacity

  @Field(() => ClusterZWatchInfo, { nullable: true })
  clusterZWatchInfo: ClusterZWatchInfo

  @Field(() => Int, { nullable: true })
  totalVm?: number

  @Field(() => Int, { nullable: true })
  runningVm?: number

  @Field(() => Int, { nullable: true })
  destroyedVm?: number

  @Field(() => Int, { nullable: true })
  stoppedVm?: number

  @Field(() => String, { nullable: true })
  checkCpuModel?: string

  @Field(() => String, { nullable: true })
  recommendQemuVersion?: string

  @Field(() => String, { nullable: true })
  checkCpuModelId?: string

  @Field(() => String, { nullable: true })
  clusterKVMCpuModel?: string

  @Field(() => String, { nullable: true })
  displayNetworkCidr?: string

  @Field(() => String, { nullable: true })
  migrateNetworkCidr?: string

  @Field(() => Zone, { nullable: true })
  zone: Zone

  @Field(() => [PrimaryStorage], { nullable: true })
  primaryStorageList?: PrimaryStorage[]

  @Field(() => Int, { nullable: true })
  primaryStorageCount?: number

  @Field(() => Int, { nullable: true })
  l2NetworkCount?: number

  @Field(() => Int, { nullable: true })
  l3NetworkCount?: number

  @Field(() => Int, { nullable: true })
  vmInstanceCount?: number

  @Field(() => Int, { nullable: true })
  virtualizationVmInstanceCount?: number

  @Field(() => Int, { nullable: true })
  volumeCount?: number

  @Field(() => Int, { nullable: true, description: '裸金属设备数量' })
  baremetalChassisNum?: number

  @Field(() => Int, { nullable: true, description: '裸金属主机数量' })
  baremetalInstanceNum?: number

  @Field(() => Boolean, { nullable: true, description: '是否已加载部署服务器' })
  isAttachBaremetalPxeServer?: boolean

  @Field(() => Int, {
    nullable: true,
    description: '弹性裸金属节点（设备）数量'
  })
  baremetal2ChassisNum?: number

  @Field(() => Int, { nullable: true, description: '弹性网关节点数量' })
  baremetal2GatewayNum?: number

  @Field(() => Boolean, { nullable: true, description: '是否开启了网络加速' })
  networkHp: boolean

  @Field(() => String, {
    nullable: true,
    defaultValue: '600',
    description:
      '扫描周期: 优先从 ResourceConfigVO > GlobalConfigVO 中取, category=drs, name=schedulingInterval, resourceType=ClusterVO'
  })
  drsSchedulingInterval?: string

  @Field(() => ClusterResourceConfigValue, { nullable: true })
  resourceConfigValue?: ClusterResourceConfigValue

  @Field(() => BaremetalPxeServer, { nullable: true })
  baremetalPxeServer?: BaremetalPxeServer
}

@ObjectType()
export class Thresholds {
  @Field(() => String, { nullable: true })
  operator: string

  @Field(() => String, { nullable: true })
  thresholdName: string

  @Field(() => String, { nullable: true })
  thresholdValue: string
}

@ObjectType()
export class DRS {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  automationLevel: string

  @Field(() => String, { nullable: true })
  balancedState: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  lastAdviceGroupUuid?: string

  @Field(() => Cluster, { nullable: true })
  cluster?: Cluster

  @Field(() => Boolean, { nullable: true })
  isSupported?: boolean

  @Field(() => ClusterState, { nullable: true })
  state: ClusterState

  @Field(() => Int, { nullable: true })
  thresholdDuration?: number

  @Field(() => [Thresholds], { nullable: true })
  thresholds?: Thresholds[]
}

@ObjectType()
export class ClusterNameAndUuidForDRS {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class HostNameAndUuidForDRSAdvice {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  managementIp?: string
}

@ObjectType()
export class DRSAdvice {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  adviceUuid?: string

  @Field(() => String, { nullable: true })
  adviceGropUuid?: string

  @Field(() => String, { nullable: true })
  lastAdviceGroupUuid?: string

  @Field(() => String, { nullable: true })
  drsUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  endDate?: string

  @Field(() => String, { nullable: true })
  status: string

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => ClusterNameAndUuidForDRS, { nullable: true })
  vm?: ClusterNameAndUuidForDRS

  @Field(() => String, { nullable: true })
  vmSourceHostUuid?: string

  @Field(() => HostNameAndUuidForDRSAdvice, { nullable: true })
  vmSourceHost?: HostNameAndUuidForDRSAdvice

  @Field(() => String, { nullable: true })
  vmTargetHostUuid?: string

  @Field(() => HostNameAndUuidForDRSAdvice, { nullable: true })
  vmTargetHost?: HostNameAndUuidForDRSAdvice

  @Field(() => String, { nullable: true })
  reason?: string
}

@ObjectType()
export class ClusterNameAndUuidForVmMigrationActivity {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class HostNameAndUuidForVmMigrationActivity {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class VmMigrationActivity {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => String, { nullable: true })
  cause?: string

  @Field(() => String, { nullable: true })
  clusterName?: string

  @Field(() => ClusterNameAndUuidForVmMigrationActivity, { nullable: true })
  vm?: ClusterNameAndUuidForVmMigrationActivity

  @Field(() => String, { nullable: true })
  vmSourceHostUuid?: string

  @Field(() => HostNameAndUuidForVmMigrationActivity, { nullable: true })
  sourceHost?: HostNameAndUuidForVmMigrationActivity

  @Field(() => HostNameAndUuidForVmMigrationActivity, { nullable: true })
  targetHost?: HostNameAndUuidForVmMigrationActivity

  @Field(() => String, { nullable: true })
  vmTargetHostUuid?: string

  @Field(() => String, { nullable: true })
  reason?: string

  @Field(() => String, { nullable: true })
  adviceUuid?: string

  @Field(() => String, { nullable: true })
  adviceGropUuid?: string

  @Field(() => String, { nullable: true })
  drsUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  endDate?: string

  @Field(() => String, { nullable: true })
  status: string
}

@ObjectType()
export class ClusterDRS {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  automationLevel?: string

  @Field(() => Int, { nullable: true })
  thresholdDuration?: number

  @Field(() => Boolean, { nullable: true })
  defaultEnable?: boolean

  @Field(() => [Thresholds], { nullable: true })
  thresholds?: Thresholds[]
}

@InputType()
export class UpdateClusterInput extends IntersectionType(
  PickType(PartialType(Cluster, InputType), ['description', 'name']),
  PickType(Cluster, ['uuid'], InputType)
) {}

@InputType()
export class GetCandidateClusterForVmInput {
  @Field(() => String, { description: '计算规格UUID' })
  instanceOfferingUuid: string

  @Field(() => [String], { description: '三层网络UUID' })
  l3NetworkUuids: string[]

  @Field(() => String, { description: '镜像UUID' })
  imageUuid: string

  @Field(() => String, { description: '根云盘规格UUID', nullable: true })
  rootDiskOfferingUuid?: string

  @Field(() => String, { description: '云主机调度组UUID', nullable: true })
  vmGroupUuid?: string
}

@ObjectType()
export class L2NetworkInventory {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, { nullable: true })
  physicalInterface: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => [String], { nullable: true })
  attachedClusterUuids?: string[]
}

@ObjectType()
export class AttachL2NetworkToClusterResult {
  @Field(() => L2NetworkInventory, { nullable: true })
  result?: L2NetworkInventory

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

// @InputType()
// export class DetachL2NetworkFromClusterInput {
//   @Field(() => [String])
//   l2NetworkUuid: string[]

//   @Field(() => String)
//   clusterUuid: string
// }
@InputType()
export class AttachOrDetachL2NetworkFromClusterInput {
  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => String)
  clusterUuid: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class AttachOrDetachL2NetworksFromClusterActionInput {
  @Field(() => [AttachOrDetachL2NetworkFromClusterInput])
  payload: AttachOrDetachL2NetworkFromClusterInput[]

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class ChangeClusterStatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class ChangeClusterStateInput {
  @Field(() => [ChangeClusterStatePayload])
  payload: ChangeClusterStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class DetachPrimaryStorageListFromClusterInput {
  @Field(() => [String])
  primaryStorageUuid: string[]

  @Field(() => String)
  clusterUuid: string
}

@ObjectType()
export class DetachL2NetworkFromClusterResult {
  @Field(() => [L2NetworkInventory], { nullable: true })
  result?: L2NetworkInventory[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class DetachPrimaryStorageListFromClusterResult {
  @Field(() => [PrimaryStorage], { nullable: true })
  result?: PrimaryStorage[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class QueryClusterResp extends QueryCommonResponse(Cluster) {}

@ObjectType()
export class QueryClusterDRSResp extends QueryCommonResponse(DRS) {}

@ObjectType()
export class QueryDRSAdviceResp extends QueryCommonResponse(DRSAdvice) {}

@ObjectType()
export class QueryVmMigrationActivityResp extends QueryCommonResponse(VmMigrationActivity) {}

@ObjectType()
export class ClusterActionResp extends CreateActionResp(Cluster) {}

@ObjectType()
export class ClusterListActionResp {
  @Field(() => [Cluster], { nullable: true })
  result?: Cluster[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class CreateClusterInven {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => ClusterState, { nullable: true })
  state: ClusterState

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  hypervisorType: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  zoneUuid: string
}

@ObjectType()
export class CreateClusterResp {
  @Field(() => CreateClusterInven, { nullable: true })
  result?: CreateClusterInven

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class ClusterRelatedSummary {
  @Field(() => Int)
  vm: number

  @Field(() => Int)
  host: number

  @Field(() => Int)
  primaryStorage: number

  @Field(() => Int)
  iscsiServer: number

  @Field(() => Int)
  l2Network: number

  @Field(() => Int)
  physicalNic: number

  @Field(() => Int)
  gpu: number

  @Field(() => Int)
  vGpu: number

  @Field(() => Int)
  usb: number

  @Field(() => Int, { description: '其他设备数量' })
  pci: number
}

@ObjectType()
export class Baremetal2ClusterRelatedSummary {
  @Field(() => Int)
  gateway: number

  @Field(() => Int)
  primaryStorage: number

  @Field(() => Int)
  l2Network: number

  @Field(() => Int)
  baremetalNode: number

  @Field(() => Int)
  iscsiServer: number
}

@ObjectType()
export class ClusterSummaryQueryResp {
  @Field(() => Int)
  clusterCount: number

  @Field(() => Int)
  baremetalCount: number

  @Field(() => Int)
  baremetal2Count: number
}
@ObjectType()
export class ResourceCpuMode {
  @Field(() => String)
  cpuMode: string
}
