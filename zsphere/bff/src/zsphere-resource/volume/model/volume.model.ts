import {
  Field,
  ObjectType,
  InputType,
  Int,
  registerEnumType,
  Float,
  ArgsType
} from '@nestjs/graphql'

import {
  CdpTaskStatus,
  VolumeProvisioningStrategy,
  VolumeStatus,
  VolumeType,
  State
} from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ISimpleActionResp, ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorageVO } from '@/hardware-resource/primary-storage/primary-storage.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { Image } from '@/zsphere-resource/image/image.model'
import { VmInstanceBase } from '@/zsphere-resource/vm-instance/vm-instance-base.model'

export enum VolumeQueryType {
  NORMAL = 'NORMAL',
  GET_VM_ATTACHABLE_DATA_VOLUME = 'GET_VM_ATTACHABLE_DATA_VOLUME',
  GET_VOLUME_BY_ACCOUNT = 'GET_VOLUME_BY_ACCOUNT',
  GET_VOLUME_BY_VMINSTANCE_UUID = 'GET_VOLUME_BY_VMINSTANCE_UUID',
  GetVolumeBySchedulerJobGroup = 'GetVolumeBySchedulerJobGroup',
  GetBackupJobAndCdpTaskAttachableVolume = 'GetBackupJobAndCdpTaskAttachableVolume',
  GetCandidatesVolumeForCreateVolumeSnapshot = 'GetCandidatesVolumeForCreateVolumeSnapshot',
  GetCandidatesVolumeForCreateVolumeSnapshotJob = 'GetCandidatesVolumeForCreateVolumeSnapshotJob',
  GetTagAttachableVolume = 'GetTagAttachableVolume',
  GET_VOLUME_BY_NOT_SNAPSHOT = 'GET_VOLUME_BY_NOT_SNAPSHOT',
  GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME = 'GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME',

  GetVolumeByVMAndHostForEditVM = 'GetVolumeByVMAndHostForEditVM'
}

registerEnumType(VolumeQueryType, {
  name: 'VolumeQueryType'
})

export enum VolumeState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

registerEnumType(VolumeState, {
  name: 'VolumeState'
})

export enum VolumeQosMode {
  total = 'total',
  read = 'read',
  write = 'write',
  all = 'all',
  overwrite = 'overwrite'
}

registerEnumType(VolumeQosMode, {
  name: 'VolumeQosMode'
})

export enum VolumeBackupTaskType {
  BackupJob = 'BackupJob',
  OtherTasks = 'OtherTasks'
}

registerEnumType(VolumeBackupTaskType, {
  name: 'VolumeBackupTaskType'
})

export enum WithMemoryByResourceType {
  L2NetworkVO = 'L2NetworkVO',
  L3NetworkVO = 'L3NetworkVO'
}

registerEnumType(WithMemoryByResourceType, {
  name: 'WithMemoryByResourceType'
})

@ArgsType()
export class QueryVolumeArgs extends QueryAction {
  @Field(() => VolumeQueryType, { nullable: true })
  declare type?: VolumeQueryType
}

@ObjectType()
export class VolumeCapabilities {
  @Field(() => Boolean, { defaultValue: false })
  MigrationInCurrentPrimaryStorage: boolean

  @Field(() => Boolean, { defaultValue: false })
  MigrationToOtherPrimaryStorage: boolean
}

@ObjectType()
export class VolumeSystemTag {
  @Field(() => String, { nullable: true })
  WWN?: string

  @Field(() => Boolean, { defaultValue: false })
  VirtioSCSI: boolean

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  notSupportActualSize: boolean

  @Field(() => VolumeProvisioningStrategy, { nullable: true })
  VolumeProvisioningStrategy?: VolumeProvisioningStrategy

  @Field(() => String, { nullable: true })
  volumeAttributeUserConfig?: string

  @Field(() => String, { nullable: true, description: '总线类型' })
  capability?: string

  @Field(() => String, { nullable: true, description: '存储池' })
  cephStoragePool?: string
}

@ObjectType()
export class VolumeBandwidth {
  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidth: number

  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidthRead: number

  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidthWrite: number

  @Field(() => Float, { defaultValue: -1 })
  iopsTotal: number

  @Field(() => Float, { defaultValue: -1 })
  iopsRead: number

  @Field(() => Float, { defaultValue: -1 })
  iopsWrite: number

  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidthUpthreshold: number

  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidthReadUpthreshold: number

  @Field(() => Float, { defaultValue: -1 })
  volumeBandwidthWriteUpthreshold: number

  @Field(() => String, { nullable: true })
  volumeUuid?: string
}

@ObjectType()
export class VolumeOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  linkedAccountUuid?: string
}

@ObjectType()
export class VolumeIoThreadPin {
  @Field(() => String, {
    nullable: true,
    description: '后端返回是个String，设置的时候使用的是Number'
  })
  ioThreadId: string

  @Field(() => String, { nullable: true })
  pin: string
}

@ObjectType()
export class VolumeRelatedResource {
  @Field(() => Int)
  backupData: number
}

@ObjectType()
export class VolumeResourceConfig {
  @Field(() => String, { nullable: true })
  vmcacheMode?: string

  @Field(() => String, { nullable: true })
  aionative?: string
}

@ObjectType()
export class Volume {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => Int, { nullable: true })
  deviceId?: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, {
    nullable: true,
    description: '云盘从云主机上卸载之后会生成lastVmInstanceUuid'
  })
  lastVmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => VolumeType)
  type: VolumeType

  @Field(() => String, { nullable: true })
  format?: string

  @Field(() => Float)
  size: number

  @Field(() => Float, { nullable: true })
  actualSize: number

  @Field(() => VolumeState)
  state: VolumeState

  @Field(() => VolumeStatus)
  status: VolumeStatus

  @Field(() => VolumeBackupTaskType, { nullable: true, defaultValue: null })
  backupTaskType?: VolumeBackupTaskType

  @Field(() => VolumeSystemTag, { nullable: true })
  systemTag?: VolumeSystemTag

  @Field(() => String, { nullable: true })
  diskOfferingUuid?: string

  @Field(() => String, { nullable: true })
  rootImageUuid?: string

  @Field(() => Image, { nullable: true })
  rootImage?: Image

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true, description: '上次被卸载时间' })
  lastDetachDate?: string

  @Field(() => Boolean, { nullable: true })
  isShareable?: boolean

  @Field(() => String, { nullable: true })
  volumeQos?: string

  @Field(() => VolumeBandwidth, { nullable: true })
  bandwidth?: VolumeBandwidth

  @Field(() => PrimaryStorageVO, { nullable: true })
  primaryStorage?: PrimaryStorageVO

  @Field(() => [VmInstanceBase], { defaultValue: [], nullable: true })
  vmInstance?: VmInstanceBase[]

  @Field(() => [VmInstanceBase], { defaultValue: [], nullable: true })
  templatedVmInstance?: VmInstanceBase[]

  @Field(() => [VmInstanceBase], { defaultValue: [], nullable: true })
  templatedVmInstanceCache?: VmInstanceBase[]

  @Field(() => VmInstanceBase, {
    nullable: true,
    description: '云盘从云主机上卸载之后上次所在云主机'
  })
  lastVmInstance?: VmInstanceBase

  @Field(() => VmInstanceBase, {
    nullable: true,
    description: '云盘从云主机上卸载之后上次所在云主机,包含虚拟机/虚拟机模板/虚拟机模板缓存'
  })
  lastVmOrTemplate?: VmInstanceBase

  @Field(() => String, {
    nullable: true,
    description: '云盘从云主机上卸载的原因'
  })
  lastDetachReason?: string

  @Field(() => VolumeCapabilities, {
    defaultValue: {
      MigrationInCurrentPrimaryStorage: false,
      MigrationToOtherPrimaryStorage: false
    }
  })
  capabilities?: VolumeCapabilities

  @Field(() => [Tag], { defaultValue: [] })
  tag?: Tag[]

  @Field(() => VolumeOwner, { nullable: true })
  owner?: VolumeOwner

  @Field(() => [Tag], { defaultValue: [] })
  mineTags?: Tag[]

  @Field(() => [Tag], { defaultValue: [] })
  othersTags?: Tag[]

  @Field(() => String, { nullable: true, defaultValue: 'Ready' })
  backupStatus?: string

  @Field(() => VolumeRelatedResource, { nullable: true })
  relatedResource?: VolumeRelatedResource

  @Field(() => CdpTaskStatus, { nullable: true })
  cdpTaskStatus?: CdpTaskStatus

  @Field(() => VolumeIoThreadPin, { nullable: true })
  volumeIoThreadPin?: VolumeIoThreadPin

  @Field(() => Boolean, { nullable: true })
  isHaveMemorySnapshot?: boolean

  @Field(() => State, { nullable: true })
  backupTaskStatus?: State

  @Field(() => VolumeResourceConfig, { nullable: true })
  resourceConfig?: VolumeResourceConfig

  @Field(() => String, { nullable: true })
  lastAttachDate?: string

  @Field(() => Boolean, { nullable: true })
  isHaveSnapshot?: boolean
}

@ObjectType()
export class VolumeSummary {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  available: number

  @Field(() => Int, { nullable: true })
  destroyed: number

  @Field(() => Int, { nullable: true })
  notInstantiated: number
}

@ObjectType()
export class VolumeList {
  @Field(() => Int)
  total: number

  @Field(() => [Volume], { defaultValue: [] })
  list?: Volume[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class AttachDataVolumeToVmInput {
  @Field(() => String)
  volumeUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@ObjectType()
export class VolumeActionResp extends ISimpleActionResp {
  @Field(() => Volume, { nullable: true })
  declare result?: Volume
}

@InputType()
export class UpdateVolumeInput {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@ObjectType()
export class VmAndBareMetal2InstanceSummary {
  @Field(() => Int, { nullable: true })
  vmTotal: number

  @Field(() => Int, { nullable: true })
  bareMetal2InstanceTotal: number
}

@ArgsType()
export class MemorySnapByResourceNetworkArgs {
  @Field(() => [String])
  uuids: string[]

  @Field(() => WithMemoryByResourceType)
  type: WithMemoryByResourceType
}

@ObjectType()
export class MemorySnapshotInfo {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class MemorySnapshotQueryResponse {
  @Field(() => [MemorySnapshotInfo], { nullable: true })
  memorySnapshotList: MemorySnapshotInfo[]

  @Field(() => [MemorySnapshotInfo], { nullable: true })
  withMemorySnapShotResourceList: MemorySnapshotInfo[]
}

@InputType()
export class GetFlattenVolumeOccupyCapacityInput {
  @Field(() => [String])
  uuids: string[]
}

@ObjectType()
export class VolumeOccupyCapacity {
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
export class QueryFlattenVolumeOccupyCapacityResp {
  @Field(() => [VolumeOccupyCapacity])
  list?: VolumeOccupyCapacity[]

  @Field(() => Boolean)
  success: boolean

  @Field(() => String, { nullable: true })
  error?: string
}
