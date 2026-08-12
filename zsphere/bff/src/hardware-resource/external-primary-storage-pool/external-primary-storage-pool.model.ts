import { Field, ObjectType, Float, InputType, Int } from '@nestjs/graphql'

import { RedundancyPolicy } from '@/common/enum'
import { ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorageCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'

@ObjectType()
export class ExternalPrimaryStoragePool {
  @Field(() => String, {
    description:
      '在 server 端基于 name 构造出来的，为了保持 ui 端 table/gql cache 中使用 uuid 作为 rowkey'
  })
  uuid: string

  @Field(() => String)
  id: string

  @Field(() => String, { description: 'name 唯一' })
  name: string

  @Field(() => String, { nullable: true })
  aliasName?: string

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  usedCapacity?: number

  @Field(() => String)
  createDate: string

  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => String, { nullable: true })
  replicatedSize?: string

  @Field(() => Float, { nullable: true })
  diskUtilization?: number

  @Field(() => RedundancyPolicy, { nullable: true })
  redundancyPolicy?: RedundancyPolicy

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => PrimaryStorageCapacity, { nullable: true })
  primaryStorageCapacity?: PrimaryStorageCapacity
}

@ObjectType()
export class ExternalPrimaryStoragePoolList {
  @Field(() => [ExternalPrimaryStoragePool], { defaultValue: [] })
  list?: ExternalPrimaryStoragePool[]

  @Field(() => Int, { defaultValue: 0 })
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class StoragePoolPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  aliasName?: string
}

@InputType()
export class StoragePoolConfigPayload {
  @Field(() => [StoragePoolPayload!], {
    description: '已经添加到主存储中的池子'
  })
  pools: StoragePoolPayload[]
}

@InputType()
export class ActionExternalPrimaryStoragePoolPayload {
  @Field(() => String, { description: '外部主存储的 uuid' })
  uuid: string

  @Field(() => StoragePoolConfigPayload, { nullable: true })
  config?: StoragePoolConfigPayload
}
