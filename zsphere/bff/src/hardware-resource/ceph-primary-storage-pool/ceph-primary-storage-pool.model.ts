import { Field, Float, Int, ObjectType } from '@nestjs/graphql'

import { CephPrimaryStoragePoolType, DataSecurityPolicy } from '@/common/enum'
import { ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorageCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'

@ObjectType()
export class PSForCephPrimaryStoragePool {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  type?: string
}

@ObjectType()
export class CephPrimaryStoragePool {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  aliasName?: string

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  poolName?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => PSForCephPrimaryStoragePool, { nullable: true })
  primaryStorage?: PSForCephPrimaryStoragePool

  @Field(() => String, { nullable: true })
  replicatedSize?: string

  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => CephPrimaryStoragePoolType, { nullable: true })
  type?: CephPrimaryStoragePoolType

  @Field(() => Float, { nullable: true })
  diskUtilization?: number

  @Field(() => DataSecurityPolicy, { nullable: true })
  securityPolicy?: DataSecurityPolicy

  @Field(() => Float, { nullable: true })
  usedCapacity?: number

  @Field(() => PrimaryStorageCapacity, { nullable: true })
  primaryStorageCapacity?: PrimaryStorageCapacity
}

@ObjectType()
export class CephPrimaryStoragePoolList {
  @Field(() => [CephPrimaryStoragePool], { defaultValue: [] })
  list?: CephPrimaryStoragePool[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
