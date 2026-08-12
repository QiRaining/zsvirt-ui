import { ObjectType, Field, Float, Int } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'

import { NVMeLun } from '../nvme-lun/nvme-lun.model'
import { Zone } from '../zone/zone.model'

@ObjectType()
export class NvmeTargetLUNDeviceUsageInfo {
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  totalLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  usedLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  unusedLunNum: number
}

@ObjectType()
export class NvmeTarget {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  nqn?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  nvmeServerUuid?: string

  @Field(() => String, { nullable: true })
  transport?: string

  @Field(() => [NVMeLun], { defaultValue: [] })
  nvmeLuns: NVMeLun[]

  @Field(() => NvmeTargetLUNDeviceUsageInfo, { nullable: true })
  lunDeviceUsageInfo?: NvmeTargetLUNDeviceUsageInfo

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [Zone], {
    nullable: true,
    defaultValue: [],
    description:
      'NvmeTarget 上 nvmeLuns 对应的 nvmeLunHostRefs 所在host的zone，没有nvmeLunHostRefs则无zone'
  })
  zones: Zone[]
}

@ObjectType()
export class NvmeTargetList {
  @Field(() => [NvmeTarget], { defaultValue: [] })
  list?: NvmeTarget[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
