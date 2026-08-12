import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import {
  CdpTaskStatus,
  CpuArchitecture,
  GuestToolsZWatchState,
  ImagePlatform,
  OperatorState,
  State,
  VmBootDevice,
  VmInstanceState
} from '@/common/enum'
import { GetMetricDataListArgs, MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError, CreateActionResp, ISimpleActionResp } from '@/common/model/action-resp.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { Host } from '@/hardware-resource/host/host.model'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'
import { TpmInventory } from '@/hardware-resource/tpm/tpm.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { L3NetworkType } from '@/network-resource/l3-network/l3-network.model'
import { DependentResourceType } from '@/settings/resource-config/resource-config.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { SchedulerJobHistory } from '@/zsphere-administration/scheduler-job-history/scheduler-job-history.model'
import { SchedulerJob } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { UserGroup } from '@/zsphere-administration/user-group/user-group.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'
import { AffinityGroup } from '@/zsphere-resource/affinity-group/affinity-group.model'
import { CdRom } from '@/zsphere-resource/cdroms/cdroms.model'
import { Image } from '@/zsphere-resource/image/image.model'
import { InstanceOffering } from '@/zsphere-resource/instance-offering/instance-offering.model'
import { SshKeyPair } from '@/zsphere-resource/ssh-key-pair/ssh-key-pair.model'
import { VGpuDeviceType } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.model'
import { VMGroupDirectory } from '@/zsphere-resource/vm-directory-group/vm-directory-group.model'
import { VmGroup } from '@/zsphere-resource/vm-group/vm-group.model'
import { VmNic } from '@/zsphere-resource/vm-nic/vm-nic.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'

export enum ChangeVmInstanceStateType {
  Start,
  Stop,
  Paused,
  Recover,
  Resume,
  Poweroff,
  StartFromHost,
  Reboot
}

export enum GetMaxPCpuNumForVmCreateType {
  Zone,
  L2Network
}

export enum VmBackupTaskType {
  BackupTask = 'BackupTask',
  CdpTask = 'CdpTask'
}

registerEnumType(ChangeVmInstanceStateType, {
  name: 'ChangeVmInstanceStateType'
})

registerEnumType(GetMaxPCpuNumForVmCreateType, {
  name: 'GetMaxPCpuNumForVmCreateType'
})

registerEnumType(VmBackupTaskType, {
  name: 'VmBackupTaskType'
})

export enum VmQueryType {
  Normal = 'Normal',
  eipAttachCandidate = 'eipAttachCandidate',

  Se = 'Se',
  GetVmBySchedulerJobGroup = 'GetVmBySchedulerJobGroup',
  GetBackupJobAttachableVM = 'GetBackupJobAttachableVM',
  GetCdpTaskAttachableVM = 'GetCdpTaskAttachableVM',
  GetVmForPortForwardingAttachVmNic = 'GetVmForPortForwardingAttachVmNic',
  GetAffinityGroupAttachableVM = 'GetAffinityGroupAttachableVM',
  GetDataVolumeAttachableVm = 'GetDataVolumeAttachableVm',
  GetVmCandidatesForAttachingScsiLun = 'GetVmCandidatesForAttachingScsiLun',
  GetVmCandidatesForDetachScsiLun = 'GetVmCandidatesForDetachScsiLun',
  GetVmCandidatesForPortMirror = 'GetVmCandidatesForPortMirror',
  Account = 'Account',
  GetCandidatesVmForAttachSshKeyPair = 'GetCandidatesVmForAttachSshKeyPair',
  GetCandidatesVmForDetachSshKeyPair = 'GetCandidatesVmForDetachSshKeyPair',
  GetCandidatesVmForCreateVmSnapshot = 'GetCandidatesVmForCreateVmSnapshot',
  GetCandidatesVmForCreateVmSnapshotGroup = 'GetCandidatesVmForCreateVmSnapshotGroup',
  GetVmCandidatesForAddToVmGroup = 'GetVmCandidatesForAddToVmGroup',
  GetVmByVmGroup = 'GetVmByVmGroup',
  GetCandidatesVmForCreateVmSnapshotGroupJob = 'GetCandidatesVmForCreateVmSnapshotGroupJob',
  GetCandidatesVmForCreateVmSnapshotJob = 'GetCandidatesVmForCreateVmSnapshotJob',

  //---for zsv----
  GetKeyProviderRelatedResource = 'GetKeyProviderRelatedResource',
  GetInstanceWithSnapshotGroup = 'GetInstanceWithSnapshotGroup',
  GetInstanceWithSnapshotStrategy = 'GetInstanceWithSnapshotStrategy',
  GetCandidatesForSnapshotStrategy = 'GetCandidatesForSnapshotStrategy',
  GetVmInstanceTemplate = 'GetVmInstanceTemplate',
  GetVmInstanceTemplateRelatedVM = 'GetVmInstanceTemplateRelatedVM',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE',
  Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE = 'Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE',
  Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE = 'Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE'
}

registerEnumType(VmQueryType, {
  name: 'VmQueryType'
})

export enum GuestToolsState {
  Uninstall = 'Uninstall',
  IsRunning = 'IsRunning',
  Stopped = 'Stopped',
  Installed = 'Installed',
  Unsupport = 'Unsupport'
}

registerEnumType(GuestToolsState, {
  name: 'GuestToolsState'
})

export enum VmInstanceSchedulingState {
  Normal = 'Normal',
  Invalid = 'Invalid',
  Conflict = 'Conflict'
}

registerEnumType(VmInstanceSchedulingState, {
  name: 'VmInstanceSchedulingState'
})

export enum VmInstanceQemuState {
  Matched = 'Matched',
  Unmatched = 'Unmatched',
  Unknown = 'Unknown'
}

registerEnumType(VmInstanceQemuState, {
  name: 'VmInstanceQemuState'
})

@ObjectType()
export class ToolsState {
  @Field(() => GuestToolsState, { nullable: true })
  toolsState?: GuestToolsState
}

@ObjectType()
export class GuestToolsStateInfo {
  @Field(() => String, { nullable: true })
  osType?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  qgaState?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => GuestToolsZWatchState, { nullable: true })
  zwatchState?: GuestToolsZWatchState

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string
}

@ArgsType()
export class QueryVmArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => VmQueryType, {
    nullable: true,
    defaultValue: VmQueryType.Normal
  })
  declare type?: VmQueryType
}

@ObjectType()
export class VmOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  linkedAccountUuid?: string
}
@InputType()
export class QueryTagInput {
  @Field(() => String)
  uuid: string

  @Field(() => QueryAction, { nullable: true })
  queryParams?: QueryAction
}

@ObjectType()
export class BootOrderResp {
  @Field(() => [VmBootDevice])
  orders: VmBootDevice[]
}
@ObjectType()
class VmIso {
  @Field(() => String)
  uuid: string

  @Field(() => Int, { nullable: true })
  index: number
}

@ObjectType()
export class VmCapabilities {
  @Field(() => Boolean, { nullable: true })
  LiveMigration: boolean

  @Field(() => Boolean, { nullable: true })
  MemorySnapshot: boolean

  @Field(() => Boolean, { nullable: true })
  Reimage: boolean

  @Field(() => Boolean, { nullable: true })
  VolumeMigration: boolean
}

@ObjectType()
export class RelatedResource {
  @Field(() => Int, { nullable: true })
  volume?: number

  @Field(() => Int, { nullable: true })
  vmNic?: number

  @Field(() => Int, { nullable: true })
  snapshot?: number

  @Field(() => Int, { nullable: true })
  alarm?: number

  @Field(() => Int, { nullable: true })
  schedulerJob?: number

  @Field(() => Int, { nullable: true })
  backupData?: number
}

@InputType()
export class VmNicConfig {
  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  ipv4StaticIp?: string

  @Field(() => String, { nullable: true })
  ipv6StaticIp?: string

  @Field(() => String, { nullable: true })
  customMac?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { defaultValue: [] })
  securityGroupList?: string[]

  @Field(() => [String], { defaultValue: [] })
  eipList?: string[]

  @Field(() => Boolean, { defaultValue: false })
  enableSRIOV: boolean
}

@ObjectType()
export class SecurityGroupInVminstance {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string
}

@ObjectType()
export class EipInVminstance {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  vipIp: string
}

@ObjectType()
export class GpuDeivceSpecOnVmInstance {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => Boolean)
  isVirtual: boolean

  @Field(() => VGpuDeviceType, { nullable: true })
  deviceType?: VGpuDeviceType
}
@ObjectType()
export class RequestConsoleAccess {
  @Field(() => String)
  hostname: string

  @Field(() => String)
  port: string

  @Field(() => String)
  token: string
}

@ObjectType()
export class VmCpuPinning {
  @Field(() => String)
  vCPU: string

  @Field(() => String)
  pCPU: string
}

@ObjectType()
class StaticIpInVm {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String)
  ip: string
}

@ObjectType()
class QxlMemory {
  @Field(() => Int, { nullable: true })
  ram?: number

  @Field(() => Int, { nullable: true })
  vram?: number

  @Field(() => Int, { nullable: true })
  vgamem?: number
}

/**
 * VM 高可用信息（VmHaVO）
 * 存储 VM 的高可用信息。since ZSphere 4.10.6
 * 该表从 ha 和 inhibitHA 这两个 tag 升级而来
 * 参见 ZSV-7867 / ZSV-7433
 */
@ObjectType()
export class VmHaVO {
  /** 虚拟机 UUID，也是主键 */
  @Field(() => String)
  uuid: string

  /**
   * HA 高可用等级。
   * 一般是 "None" / "OnHostFailure" / "NeverStop"。
   * 只有在 VM 刚启动时，可能显示为 "Undefined"
   */
  @Field(() => String, { nullable: true })
  haLevel?: string

  /** HA 高可用等级上次更新时间 */
  @Field(() => String, { nullable: true })
  haLevelUpdateTime?: string

  /** 为什么 VM 被临时禁止 HA */
  @Field(() => String, { nullable: true })
  inhibitionReason?: string

  /** 上次临时禁止 HA 的时间点 */
  @Field(() => String, { nullable: true })
  inhibitionTime?: string
}

@ObjectType()
export class VmInstanceSystemTag {
  @Field(() => [VmIso], { defaultValue: [] })
  isoList?: VmIso[]

  @Field(() => [String], { defaultValue: [] })
  bootOrder?: string[]

  @Field(() => Boolean, { nullable: true })
  bootOrderOnce?: boolean

  @Field(() => String, { nullable: true })
  ha?: string

  @Field(() => String, { nullable: true })
  sshkey?: string

  @Field(() => String, { nullable: true })
  consolePassword?: string

  @Field(() => String, { nullable: true })
  vmConsoleMode?: string

  @Field(() => String, { nullable: true })
  bootMode?: string

  @Field(() => Boolean, { nullable: true })
  RDPEnable?: boolean

  @Field(() => Boolean, { nullable: true })
  usbRedirect?: boolean

  @Field(() => String, { nullable: true })
  VDIMonitorNumber?: string

  @Field(() => String, { nullable: true })
  userdata?: string

  @Field(() => String, { nullable: true })
  qemuga?: string

  @Field(() => [VmCpuPinning], { nullable: true })
  vmCpuPinningList?: VmCpuPinning[]

  @Field(() => Boolean, { nullable: true })
  antiSpoofing?: boolean

  @Field(() => Boolean, { nullable: true })
  autoReleaseSpecReleatedPhysicalPciDevice?: boolean

  @Field(() => Boolean, { nullable: true })
  autoReleaseSpecReleatedVirtualPciDevice?: boolean

  @Field(() => String, { nullable: true })
  vmPriority?: string

  @Field(() => String, { nullable: true })
  GuestTools?: string

  @Field(() => String, { nullable: true })
  clockTrack?: string

  @Field(() => String, { nullable: true })
  timeTrack?: string

  @Field(() => Boolean, { nullable: true })
  haStickStragedy?: boolean

  @Field(() => [StaticIpInVm], { nullable: true })
  staticIp?: StaticIpInVm[]

  @Field(() => Boolean, { nullable: true })
  vmDriver?: boolean

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => QxlMemory, { nullable: true })
  qxlMemory?: QxlMemory

  @Field(() => String, { nullable: true })
  cpuSockets?: string

  @Field(() => String, { nullable: true })
  cpuCores?: string

  @Field(() => String, { nullable: true })
  vmMachineType?: string
}

@ObjectType()
export class MaxCdRomNum {
  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  defaultValue: string

  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@ObjectType()
export class GuestToolFeatures {
  @Field(() => String, { nullable: true })
  pvpanic?: string

  @Field(() => String, { nullable: true })
  pvpanic_guest_tools_enable?: string

  @Field(() => String, { nullable: true })
  pvpanic_guest_kernel_supported: string

  @Field(() => String, { nullable: true })
  pvpanic_host_enable?: string
}

@ObjectType()
export class GuestToolInfo {
  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  version: string

  @Field(() => Boolean, { nullable: true })
  lowVersion: boolean

  @Field(() => GuestToolFeatures, { nullable: true })
  features?: GuestToolFeatures
}

@ObjectType()
export class VmExportInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  description?: string

  @Field(() => Int)
  size: number

  @Field(() => String)
  uuid: string

  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  backupStorageUuid: string

  @Field(() => String)
  exportUrl: string

  @Field(() => String)
  md5Sum: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class VmCpuMode {
  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => DependentResourceType, {
    nullable: true,
    defaultValue: DependentResourceType.GlobalConfig,
    description: '默认参考全局配置'
  })
  dependentResourceType?: DependentResourceType
}

@ObjectType()
export class OperatorInfo {
  @Field(() => String, { nullable: true, description: '操作人' })
  operator?: string

  @Field(() => String, { nullable: true, description: '操作人UUID' })
  operatorAccountUuid?: string

  @Field(() => OperatorState, {
    nullable: true,
    defaultValue: OperatorState.ACTIVE,
    description: '操作人状态'
  })
  operatorState?: OperatorState

  @Field(() => String, { nullable: true, description: '开始操作时间' })
  createTime?: string

  @Field(() => String, {
    nullable: true,
    description: '操作类型，也就是操作API, 目前可作为保留字段使用，后续有需求再补充'
  })
  apiName?: string
}

@ObjectType()
export class VmUsage {
  @Field(() => Float, { nullable: true })
  cpuUsed?: number

  @Field(() => Float, { nullable: true })
  memoryUsed?: number

  @Field(() => Float, { nullable: true })
  storageUsed?: number
}

@ObjectType()
export class DefaultL3Network {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => L3NetworkType, { nullable: true })
  networkType?: L3NetworkType
}

@ObjectType()
export class VmInstance extends ResourceWithAttributes {
  @Field()
  name?: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  affinityGroupUuid?: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => VmCpuMode, { nullable: true })
  cpuModeInfo?: VmCpuMode

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => VmInstanceState, { nullable: true })
  state?: VmInstanceState

  // 4.6.0-feature-云主机调度策略， 新增的调度状态
  @Field(() => VmInstanceSchedulingState, { nullable: true })
  schedulingState?: VmInstanceSchedulingState

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  instanceOfferingUuid?: string

  @Field(() => InstanceOffering, { nullable: true })
  instanceOffering?: InstanceOffering

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  lastHostUuid?: string

  @Field(() => DefaultL3Network, { nullable: true })
  defaultL3Network?: DefaultL3Network

  @Field(() => [EipInVminstance], { defaultValue: [] })
  eip?: EipInVminstance[]

  @Field(() => [SecurityGroupInVminstance], { nullable: true })
  securityGroup?: SecurityGroupInVminstance[]

  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  @Field(() => VmBackupTaskType, { nullable: true, defaultValue: null })
  backupTaskType?: VmBackupTaskType

  @Field(() => String, { nullable: true })
  guestOsType?: string

  @Field(() => [String], { defaultValue: [] })
  attachedShareableVolumeUuidList?: string[]

  @Field(() => String, { nullable: true })
  rootVolumeUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => [CdRom], { defaultValue: [] })
  vmCdRoms?: CdRom[]

  @Field(() => [Volume], { defaultValue: [] })
  allVolumes?: Volume[]

  @Field(() => [SshKeyPair], {
    defaultValue: [],
    description: '云主机上挂载的sshKeyPair'
  })
  sshKeyPairs?: SshKeyPair[]

  @Field(() => Float, {
    defaultValue: 0,
    description: '云主机上挂载的sshKeyPair数量，本来取数组长度即可，但是获取的字段更多消耗更多。'
  })
  sshKeyPairNum?: number

  @Field(() => Cluster, { nullable: true })
  cluster?: Cluster

  @Field(() => [GpuDeivceSpecOnVmInstance], { nullable: true })
  gpuDeviceSpec?: GpuDeivceSpecOnVmInstance[]

  @Field(() => Image, { nullable: true })
  image?: Image

  @Field(() => Host, { nullable: true })
  host?: Host

  @Field(() => Host, { nullable: true })
  lastHost?: Host

  @Field(() => PrimaryStorage, { nullable: true })
  primaryStorage?: PrimaryStorage

  @Field(() => VmOwner, { nullable: true })
  owner?: VmOwner

  @Field(() => VmInstanceSystemTag, { nullable: true })
  systemTag?: VmInstanceSystemTag

  /**
   * VmHaVO 高可用信息（since ZSphere 4.10.6）
   * 替代原 systemTag.ha 字段，参见 ZSV-7867
   */
  @Field(() => VmHaVO, { nullable: true })
  vmHa?: VmHaVO

  @Field(() => [Tag], { defaultValue: [] })
  tag?: Tag[]

  @Field(() => RelatedResource, { nullable: true })
  relatedResource?: RelatedResource

  @Field(() => [VmNic], { defaultValue: [] })
  vmNics?: VmNic[]

  @Field(() => [TpmInventory], { defaultValue: [] })
  tpmList?: TpmInventory[]

  @Field(() => MetricData, { nullable: true })
  metric?: MetricData

  @Field(() => String, { nullable: true })
  healthStatus?: string

  @Field(() => AffinityGroup, { nullable: true })
  affinityGroup?: AffinityGroup

  @Field(() => VmGroup, { nullable: true })
  vmGroup?: VmGroup

  @Field(() => MaxCdRomNum, { nullable: true })
  maxCdRomNum?: MaxCdRomNum

  @Field(() => [String], { nullable: true })
  consoleAddress?: string[]

  @Field(() => String, { nullable: true })
  volumeAttributeUserConfig?: string

  @Field(() => String, { nullable: true, defaultValue: 'Ready' })
  backupStatus?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  crashStrategy?: string

  @Field(() => Boolean, { nullable: true })
  isMemoryReservationOpened?: boolean

  @Field(() => GuestToolsState, { nullable: true })
  toolsState?: GuestToolsState

  @Field(() => GuestToolInfo, { nullable: true })
  toolsInfo?: GuestToolInfo

  @Field(() => CdpTaskStatus, { nullable: true, defaultValue: null })
  cdpTaskStatus?: CdpTaskStatus

  @Field(() => Boolean, { nullable: true })
  vnuma?: boolean

  @Field(() => String, { nullable: true })
  emulatorPin?: string

  @Field(() => Boolean, { nullable: true })
  hasTopology?: boolean

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: '云主机云盘上任何一个有备份任务，则为true'
  })
  hasBackupJob?: boolean

  @Field(() => VmExportInfo, { nullable: true })
  exportInfo?: VmExportInfo

  @Field(() => VMGroupDirectory, { nullable: true })
  group?: VMGroupDirectory

  @Field(() => VmInstanceQemuState, { nullable: true })
  qemuState: VmInstanceQemuState

  @Field(() => GuestToolsStateInfo, { nullable: true })
  guestToolsState?: GuestToolsStateInfo

  @Field(() => OperatorInfo, {
    nullable: true,
    description: '目前只查询了删除的操作信息，后续有需求再扩展'
  })
  operatorInfo?: OperatorInfo

  @Field(() => State, { nullable: true })
  backupTaskStatus?: State

  @Field(() => SchedulerJobHistory, { nullable: true })
  lastBackupJobResult?: SchedulerJobHistory

  @Field(() => Int, { nullable: true })
  localBackupCount?: number

  @Field(() => BigInt, { nullable: true })
  localBackupCapacity?: number

  @Field(() => SchedulerJob, { nullable: true })
  backupJob?: SchedulerJob

  @Field(() => Float, { nullable: true, description: '内存预留大小' })
  reservedMemorySize?: number

  @Field(() => Boolean, { nullable: true })
  haveScsiLun?: boolean

  @Field(() => [SchedulerJob], { nullable: true })
  snapshotSchedulerJob?: SchedulerJob[]

  @Field(() => VmUsage, { nullable: true })
  vmUsage?: VmUsage

  @Field(() => String, { nullable: true })
  uptime?: string

  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => String, { nullable: true })
  zmigrateType?: string

  @Field(() => [UserGroup], { nullable: true })
  userGroup?: UserGroup[]
}

@ArgsType()
export class QueryExportArgs extends OmitType(QueryAction, ['type']) {}
@ObjectType()
export class OvfDisk {
  @Field(() => String, { nullable: true })
  fileName?: string

  @Field(() => String, { nullable: true })
  capacity?: string

  @Field(() => String, { nullable: true })
  ovfId?: string
}

@ObjectType()
export class OvfFile extends PickType(PartialType(VmInstance, ObjectType), [
  'cpuNum',
  'memorySize'
]) {
  @Field(() => String, { nullable: true })
  ovf?: string

  @Field(() => [OvfDisk], { nullable: true })
  disks?: OvfDisk[]

  @Field(() => [String], { nullable: true })
  networks?: string[]
}

@ObjectType()
export class OvfExportEntity {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Float)
  size: number

  @Field(() => String, { nullable: true })
  format?: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  backupStorageUuid: string

  @Field(() => String)
  exportUrl: string

  @Field(() => String)
  md5Sum: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance

  @Field(() => BackupStorage, { nullable: true })
  backupStorage?: BackupStorage
}

@ObjectType()
export class OvfExportEntityList {
  @Field(() => [OvfExportEntity], { defaultValue: [] })
  list?: OvfExportEntity[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateVmInput extends PickType(PartialType(VmInstance, InputType), [
  'name',
  'description'
]) {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteVmInput {
  @Field(() => String)
  uuid: string
}

@InputType()
export class ExpungeVmInput {
  @Field(() => String)
  uuid: string
}

@InputType()
export class StartVmInstanceParam {
  @Field(() => String, { nullable: true })
  hostUuid?: string
}

@InputType()
export class StopVmInstanceParam {
  @Field(() => Boolean, { nullable: true })
  stopHA?: boolean

  @Field(() => String, { nullable: true })
  type?: string
}

@InputType()
export class RequestConsoleAccessInput {
  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
export class ChangeVmInstanceStateInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => ChangeVmInstanceStateType)
  type: ChangeVmInstanceStateType

  @Field(() => StopVmInstanceParam || StartVmInstanceParam, { nullable: true })
  param?: StopVmInstanceParam | StartVmInstanceParam
}

@InputType()
export class CreateVolumeSnapshotInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  volumeUuid: string
}

@InputType()
export class CreateVolumeSnapshotGroupInput extends PickType(
  CreateVolumeSnapshotInput,
  ['name', 'description'],
  InputType
) {
  @Field(() => String)
  rootVolumeUuid: string
}

@InputType()
export class AttachTagToResourcesInput {
  @Field(() => String)
  tagUuid: string

  @Field(() => [String], { defaultValue: [] })
  resourceUuids: string[]
}

@InputType()
export class DetachTagFromResourcesInput extends PickType(AttachTagToResourcesInput, [
  'tagUuid',
  'resourceUuids'
]) {}

@InputType()
export class SetVmSshKeyInput {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  SshKey: string
}

@InputType()
export class DeleteVmSshKeyInput {
  @Field(() => String)
  uuid: string
}

@InputType()
export class SetVmInstanceHaLevelInput {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  level: string
}

@InputType()
export class ChangeInstanceOfferingInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  instanceOfferingUuid: string
}

@InputType()
export class SetVmConsolePasswordInput {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  consolePassword: string
}

@InputType()
export class DeleteVmConsolePasswordInput {
  @Field(() => [String], { defaultValue: [] })
  uuids: string[]
}

@InputType()
export class ReimageVmInstanceInput {
  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
export class ChangeResourceOwnerInput {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  accountUuid: string
}

@InputType()
export class ResizeRootVolumeInput {
  @Field(() => String)
  uuid: string

  @Field(() => Int)
  size: number
}

@InputType()
export class AddMdevDeviceSpecToVmInstanceInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  mdevSpecUuid: string
}

@InputType()
export class AddPciDeviceSpecToVmInstanceInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  pciSpecUuid: string
}
@InputType()
export class RemoveHaStickStragedyInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  clusterUuid: string
}
@InputType()
export class RemoveMdevDeviceSpecFromVmInstanceInput extends PickType(
  AddMdevDeviceSpecToVmInstanceInput,
  ['vmInstanceUuid', 'mdevSpecUuid']
) {}

@ObjectType()
class VmLabels {
  @Field(() => String, { nullable: true })
  VMUuid: string

  @Field(() => String, { nullable: true })
  CPUNum: string

  @Field(() => String, { nullable: true })
  NetworkDeviceLetter: string

  @Field(() => String, { nullable: true })
  DiskDeviceLetter: string
}

@ObjectType()
export class VmInstanceMetricData extends MetricData {
  @Field(() => VmLabels, { nullable: true })
  labels: VmLabels
}

@ArgsType()
export class GetVmMetricDataListArgs extends OmitType(GetMetricDataListArgs, [
  'namespace',
  'metricList'
]) {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  metricNames: string[]

  @Field(() => String, { nullable: true })
  namespace?: string
}

@ObjectType()
export class StorageMigrateVmInstancedepends extends PickType(VmInstance, ['uuid']) {
  @Field(() => Boolean)
  isAttachedScsiLunDevice: boolean

  @Field(() => Boolean)
  hasUnavailableUsbDevice: boolean

  @Field(() => Boolean)
  hasPeripheralAttached: boolean
}
@ObjectType()
export class BatchStorageMigrateVmInstancedepends extends PickType(VmInstance, ['uuid']) {
  @Field(() => Boolean)
  isAttachedScsiLunDevice: boolean

  @Field(() => Boolean)
  hasUnavailableUsbDevice: boolean

  @Field(() => Boolean)
  hasPeripheralAttached: boolean
}

@InputType()
export class RemovePciDeviceSpecFromVmInstanceInput extends PickType(
  AddPciDeviceSpecToVmInstanceInput,
  ['vmInstanceUuid', 'pciSpecUuid']
) {}

@ObjectType()
export class VmInstanceSummary {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  available: number

  @Field(() => Int, { nullable: true })
  destroyed: number

  @Field(() => Int, { nullable: true })
  running: number

  @Field(() => Int, { nullable: true })
  stopped: number

  @Field(() => Int, { nullable: true })
  unknown: number

  @Field(() => Int, { nullable: true })
  other: number
}

@ObjectType()
export class CdromConfigForVmCreate {
  @Field(() => Int)
  maximumCdRomNum: number

  @Field(() => Int)
  vmDefaultCdRomNum: number
}

@ObjectType()
export class VmInstanceActionSimpleResp extends OmitType(ISimpleActionResp, ['result']) {
  @Field(() => VmInstance, { nullable: true })
  declare result?: VmInstance
}

@ObjectType()
export class VmInstanceList {
  @Field(() => [VmInstance], { defaultValue: [] })
  list?: VmInstance[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class GuestTool {
  @Field(() => String)
  version?: string
  @Field(() => String)
  status?: string
}

@ObjectType()
export class Hostname {
  @Field(() => String, { nullable: true })
  hostname?: string
}

@ObjectType()
export class CpuModelList {
  @Field(() => [String], { defaultValue: [] })
  list?: string[]
}
@ObjectType()
export class VmInstanceActionResp extends CreateActionResp(VmInstance) {}

@ObjectType()
export class GetCpuMemoryCapacity {
  @Field(() => Int)
  availableCpu: number

  @Field(() => Float)
  availableMemory: number
}
@ObjectType()
export class VMNUMATopology {
  @Field(() => [String])
  CPUsID?: [string]

  @Field(() => Int)
  nodeID?: number

  @Field(() => Float)
  memSize?: number

  @Field(() => Int)
  phyNodeID?: number
}
@ObjectType()
export class HostNUMATopology {
  @Field(() => Int)
  node: number

  @Field(() => [String])
  cpus?: [string]

  @Field(() => [String])
  VMsUuid?: [string]

  @Field(() => Float)
  free?: number

  @Field(() => Float)
  size?: number
}

@ObjectType()
export class NUMATopology {
  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => String, { nullable: true })
  vmName?: string

  @Field(() => [VMNUMATopology], { nullable: true })
  vmTopology?: [VMNUMATopology]

  @Field(() => [HostNUMATopology], { nullable: true })
  hostTopology?: [HostNUMATopology]
}

@ArgsType()
export class GetHostResourceAllocationArgs {
  @Field(() => String)
  uuid: string

  @Field(() => String, { defaultValue: 'host' })
  uuidType: string

  @Field(() => Int)
  vcpu: number

  @Field(() => String, { defaultValue: 'continuous' })
  strategy: string

  @Field(() => String, { defaultValue: 'normal' })
  scene: string
}
@ArgsType()
export class NUMATopologyArgs {
  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  sortByVmNode?: boolean
}
@ArgsType()
export class GetHostNUMANodeArgs {
  @Field(() => String)
  uuid: string

  @Field(() => String, { defaultValue: 'host' })
  uuidType: string

  @Field(() => String)
  startTime: string

  @Field(() => String)
  endTime: string

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  isAverage?: boolean

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  withCPUUsedUtilization?: boolean
}
@ObjectType()
export class VCPUPinItem {
  @Field(() => String)
  vCPU: string

  @Field(() => String)
  pCPU: string
}
@ObjectType()
export class HostResourceAllocation {
  @Field(() => [VCPUPinItem], { defaultValue: [] })
  vCPUPin: VCPUPinItem[]
}
@ObjectType()
export class NumaNodeItem {
  @Field(() => [String], { defaultValue: [] })
  cpus: string[]

  @Field(() => String)
  numaNode: string
}

@ObjectType()
export class PCPUUsedItem {
  @Field(() => String)
  cpuNum: string

  @Field(() => Float)
  value: number
}

@ObjectType()
export class HostNUMANode {
  @Field(() => [NumaNodeItem], { defaultValue: [] })
  numaNodeList: NumaNodeItem[]

  @Field(() => [PCPUUsedItem], { defaultValue: [] })
  pCPUUsedList: PCPUUsedItem[]
}

@ObjectType()
export class MemorySnapshotByVm {
  @Field(() => Boolean, { nullable: true })
  isMemorySnapshot?: boolean
}

@InputType()
export class GetFlattenVmInstanceOccupyCapacityInput {
  @Field(() => [String])
  uuids: string[]
}

@ObjectType()
export class VmOccupyCapacity {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Float, { nullable: true })
  actualSize?: number
}

@ObjectType()
export class QueryFlattenVmInstanceOccupyCapacityResp {
  @Field(() => [VmOccupyCapacity])
  list?: VmOccupyCapacity[]

  @Field(() => Boolean)
  success: boolean

  @Field(() => String, { nullable: true })
  error?: string
}

@ObjectType()
export class Screenshot {
  @Field(() => String, { nullable: true })
  imageData: string
}

@ObjectType()
export class VmDns {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  vmNicUuid?: string

  @Field(() => String)
  dns: string

  @Field(() => Int)
  ipVersion: number
}

@ObjectType()
export class VmDnsQueryResp extends QueryCommonResponse(VmDns) {}
