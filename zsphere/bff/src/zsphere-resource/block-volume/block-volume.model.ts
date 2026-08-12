import {
  ObjectType,
  Field,
  Int,
  registerEnumType,
  Float,
  ArgsType,
  OmitType
} from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { VolumeStatus } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'

import { VmInstance } from '../vm-instance/vm-instance.model'

export enum BlockVolumeStatus {
  Active = 'active',
  Warning = 'warning',
  Error = 'error'
}

registerEnumType(BlockVolumeStatus, {
  name: 'BlockVolumeStatus'
})

export enum BlockVolumeQueryType {
  NORMAL = 'NORMAL',
  BM2Instance = 'BM2Instance',
  ForBM2InstanceSelect = 'ForBM2InstanceSelect'
}

registerEnumType(BlockVolumeQueryType, {
  name: 'BlockVolumeQueryType'
})

@ObjectType()
export class BlockVolume {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  iscsiPath?: string

  @Field(() => String)
  primaryStorageUuid?: string

  @Field(() => String)
  cephPrimaryStoragePoolUuid?: string

  @Field(() => String)
  bareMetal2Uuid?: string

  @Field(() => String)
  lastVmInstanceUuid?: string

  @Field(() => String)
  accessPathUuid?: string

  @Field(() => Int)
  blockSnapshotNum?: number

  @Field(() => VolumeStatus, { nullable: true })
  status?: VolumeStatus

  @Field(() => BigInt, { nullable: true })
  size?: number

  @Field(() => Float, { nullable: true })
  burstTotalBw?: number

  @Field(() => Float, { nullable: true })
  burstTotalIops?: number

  @Field(() => Float, { nullable: true })
  maxTotalBw?: number

  @Field(() => Float, { nullable: true })
  maxTotalIops?: number

  @Field(() => BigInt, { nullable: true })
  actualSize?: number

  @Field(() => String)
  createDate?: string

  @Field(() => String)
  lastOpDate?: string

  @Field(() => PrimaryStorage, { nullable: true })
  primaryStorage?: PrimaryStorage

  @Field(() => [VmInstance], { defaultValue: [] })
  instance?: VmInstance[]

  @Field(() => BlockVolumeStatus)
  xskyStatus?: BlockVolumeStatus

  @Field(() => VmInstance, {
    nullable: true,
    description: '云盘从云主机上卸载之后上次所在云主机'
  })
  lastVmInstance?: VmInstance
}

@ObjectType()
export class BlockVolumeQueryResp {
  @Field(() => [BlockVolume], { nullable: true })
  list?: BlockVolume[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ArgsType()
export class QueryBlockVolumeArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => BlockVolumeQueryType, {
    nullable: true,
    defaultValue: BlockVolumeQueryType.NORMAL
  })
  declare type?: BlockVolumeQueryType
}

@ObjectType()
export class BlockVolumeActionResp {
  @Field(() => BlockVolume, { nullable: true })
  result?: BlockVolume

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class AccessPath {
  @Field(() => Int)
  accessPathId?: number

  @Field(() => Int)
  targetCount?: number

  @Field(() => String)
  accessPathIqn?: string

  @Field(() => String)
  name?: string
}

@ObjectType()
export class AccessPathQueryResp {
  @Field(() => [AccessPath], { nullable: true })
  list?: AccessPath[]

  @Field(() => Boolean, { nullable: true })
  success?: boolean
}
