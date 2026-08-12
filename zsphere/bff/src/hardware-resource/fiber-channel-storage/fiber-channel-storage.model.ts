import { ObjectType, Field, Float, Int } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'

import { FiberChannelLun } from '../fiber-channel-lun/fiber-channel-lun.model'
import { Zone } from '../zone/zone.model'

@ObjectType()
export class FiberChannelStorageLUNDeviceUsageInfo {
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  totalLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  usedLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  unusedLunNum: number
}

@ObjectType()
export class FiberChannelStorage {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  wwnn?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [FiberChannelLun], { defaultValue: [] })
  fiberChannelLuns: FiberChannelLun[]

  @Field(() => FiberChannelStorageLUNDeviceUsageInfo, { nullable: true })
  lunDeviceUsageInfo?: FiberChannelStorageLUNDeviceUsageInfo

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [Zone], {
    nullable: true,
    defaultValue: [],
    description:
      'FiberChannelStorage 上 fiberChannelLuns 对应的 scsiLunHostRefs 所在host的zone，没有scsiLunHostRefs则无zone'
  })
  zones: Zone[]
}

@ObjectType()
export class FiberChannelStorageList {
  @Field(() => [FiberChannelStorage], { defaultValue: [] })
  list?: FiberChannelStorage[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
