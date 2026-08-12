import { ArgsType, Field, ID, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'

import { VmInstance } from '../vm-instance/vm-instance.model'
import { Volume } from '../volume/model/volume.model'

export enum SnapshotType {
  'Single' = 'Single',
  'Group' = 'Group'
}

registerEnumType(SnapshotType, {
  name: 'SnapshotType'
})

export enum RevertState {
  'Available' = 'Available',
  'Unable' = 'Unable'
}

registerEnumType(RevertState, {
  name: 'RevertState'
})

export enum SnapshotFormat {
  qcow2 = 'qcow2',
  raw = 'raw'
}

registerEnumType(SnapshotFormat, {
  name: 'SnapshotFormat'
})

export enum SnapshotGroupType {
  Hypervisor = 'Hypervisor',
  Storage = 'Storage'
}

registerEnumType(SnapshotGroupType, {
  name: 'SnapshotGroupType'
})

@ObjectType()
export class VolumeSnapshotGroupRef {
  @Field(() => String, { nullable: true })
  volumeSnapshotGroupUuid: string

  @Field(() => String, { nullable: true })
  volumeSnapshotUuid: string

  @Field(() => String, { nullable: true })
  volumeName: string

  @Field(() => String, { nullable: true })
  volumeUuid: string

  @Field(() => String, { nullable: true })
  volumeType: string

  @Field(() => String, { nullable: true })
  volumeLastAttachDate: string
}
@ObjectType()
export class VolumeSnapshotGroup {
  @Field(() => String, { description: 'uuid' })
  uuid: string

  @Field(() => String, { description: '名字', nullable: true })
  name: string

  @Field(() => [VolumeSnapshotGroupRef], { nullable: true })
  volumeSnapshotRefs?: VolumeSnapshotGroupRef[]

  @Field(() => String, { description: '简介', nullable: true })
  description: string

  @Field(() => String, { description: '创建时间', nullable: true })
  createDate: string

  @Field(() => String, { description: '最后操作时间', nullable: true })
  lastOpDate?: string

  @Field(() => String, { description: '快照数量', nullable: true })
  snapshotCount: string

  @Field(() => String, { description: '云主机uuid', nullable: true })
  vmInstanceUuid: string

  @Field(() => VmInstance, { description: '云主机', nullable: true })
  vmInstance: VmInstance

  @Field(() => Float, { description: '总容量', nullable: true })
  totalSize: number

  @Field(() => SnapshotType, { nullable: true })
  snapshotType?: SnapshotType

  @Field(() => PrimaryStorage, { description: '主存储', nullable: true })
  primaryStorage?: PrimaryStorage
}

@ObjectType()
export class VolumeSnapshot {
  @Field(() => String)
  uuid: string

  @Field(() => String, { description: 'name', nullable: true })
  name?: string

  @Field(() => String, { description: 'description', nullable: true })
  description?: string

  @Field(() => String, { description: 'volumeUuid', nullable: true })
  volumeUuid?: string

  @Field(() => Float, { description: 'size', nullable: true })
  size?: number

  @Field(() => String, { description: 'state', nullable: true })
  state?: string

  @Field(() => String, { description: 'status', nullable: true })
  status?: string

  @Field(() => String, { description: 'treeUuid', nullable: true })
  treeUuid?: string

  @Field(() => String, { description: '云盘类型', nullable: true })
  volumeType?: string

  @Field(() => SnapshotGroupType, { description: 'type', nullable: true })
  type?: SnapshotGroupType

  @Field(() => String, {
    description: 'primaryStorageInstallPath',
    nullable: true
  })
  primaryStorageInstallPath?: string

  @Field(() => String, { description: '主存储Uuid', nullable: true })
  primaryStorageUuid?: string

  @Field(() => PrimaryStorage, { description: '主存储', nullable: true })
  primaryStorage?: PrimaryStorage

  @Field(() => String, { description: '快照组Uuid', nullable: true })
  groupUuid?: string

  @Field(() => SnapshotFormat, { description: 'format', nullable: true })
  format?: SnapshotFormat

  @Field(() => String, { description: 'parentUuid', nullable: true })
  parentUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Boolean, { nullable: true })
  latest?: boolean

  @Field(() => Volume, { nullable: true })
  volume?: Volume

  @Field(() => SnapshotType, { nullable: true })
  snapshotType?: SnapshotType

  @Field(() => VolumeSnapshotGroup, { nullable: true })
  group?: VolumeSnapshotGroup

  @Field(() => Boolean, { nullable: true })
  current?: boolean

  @Field(() => Float, { nullable: true })
  actualSize?: number
}

@ObjectType()
export class VolumeSnapshotTree {
  @Field(() => String, { description: 'uuid', nullable: true })
  uuid?: string

  @Field(() => String, { description: 'volumeUuid', nullable: true })
  volumeUuid?: string

  @Field(() => String, { description: 'tree', nullable: true })
  tree?: string

  @Field(() => Boolean, { description: 'isCurrent', nullable: true })
  current?: boolean

  @Field(() => Volume, { description: 'volume', nullable: true })
  volume?: Volume

  @Field(() => String, { description: '主存储Uuid', nullable: true })
  primaryStorageUuid?: string

  @Field(() => PrimaryStorage, { description: '主存储', nullable: true })
  primaryStorage?: PrimaryStorage
}

@ObjectType()
export class VolumeSnapshotListResp extends QueryCommonResponse(VolumeSnapshot) {}

@ObjectType()
export class VolumeSnapshotGroupListResp extends QueryCommonResponse(VolumeSnapshotGroup) {}

@ObjectType()
export class VolumeSnapshotTreeListResp {
  @Field(() => [VolumeSnapshotTree])
  list: VolumeSnapshotTree[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class SnapshotGroupByVolume {
  @Field(() => String, { nullable: true })
  volumeUuid: string

  @Field(() => Int, { nullable: true })
  count: number

  @Field(() => Int, { nullable: true })
  size: number

  @Field(() => Volume, { nullable: true })
  volume?: Volume

  @Field(() => VmInstance, { nullable: true })
  vm?: VmInstance
}

@ObjectType()
export class SnapshotGroupByVolumeList {
  @Field(() => [SnapshotGroupByVolume])
  list: SnapshotGroupByVolume[]

  @Field(() => Int)
  total: number
}

export enum SnapshotQueryType {
  'VM' = 'VM',
  'VOLUME' = 'VOLUME',
  'BareMetal2' = 'BareMetal2'
}

registerEnumType(SnapshotQueryType, {
  name: 'SnapshotQueryType'
})

@ArgsType()
export class QuerySnapshotArgs extends QueryAction {
  @Field(() => SnapshotQueryType, {
    nullable: true,
    defaultValue: SnapshotQueryType.VM
  })
  declare type?: SnapshotQueryType
}

@ArgsType()
export class GetSnapshotDeleteNeedSizeArgs extends QueryAction {
  @Field(() => String, { nullable: true })
  snapShotUuid: string

  @Field(() => String, { nullable: true })
  volumeUuid: string
}
@ObjectType()
export class SnapshotDeleteNeedSize {
  @Field(() => BigInt, { nullable: true })
  deleteNeedSize: number
}

@ObjectType()
export class ZSVSnapshotResolver {
  @Field(() => BigInt, { nullable: true })
  deleteNeedSize: number
}

@ObjectType()
export class VmNicConflict {
  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceName?: string

  @Field(() => String, { nullable: true })
  vmNicName?: string
}

@ObjectType()
export class CheckMemorySnapshotGroupConflictResult {
  @Field(() => [VmNicConflict], { nullable: true })
  vmNicConflict?: VmNicConflict[]
}

@ArgsType()
export class CheckMemorySnapshotGroupConflictArgs {
  @Field()
  uuid: string
}
