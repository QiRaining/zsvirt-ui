import {
  Field,
  ObjectType,
  Float,
  InputType,
  ArgsType,
  registerEnumType,
  Int
} from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { PrimaryStorageCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'

export enum CBDPrimaryStoragePoolQueryType {
  Normal = 'Normal',
  PsAttachablePool = 'PsAttachablePool'
}

registerEnumType(CBDPrimaryStoragePoolQueryType, {
  name: 'CBDPrimaryStoragePoolQueryType'
})

@ObjectType()
export class CBDPrimaryStoragePool {
  @Field(() => String, {
    description:
      '在 server 端基于 name 构造出来的，为了保持 ui 端 table/gql cache 中使用 uuid 作为 rowkey'
  })
  uuid: string

  @Field(() => String, { description: '逻辑上的 name', nullable: true })
  logicalPoolName: string

  @Field(() => Float, { nullable: true, description: '使用量' })
  usedSize?: number

  @Field(() => Float, { nullable: true, description: '可用量' })
  availableCapacity?: number

  @Field(() => Float, { nullable: true, description: '总容量' })
  capacity?: number

  @Field(() => Float, { nullable: true, description: '副本数量' })
  replicaNum?: number

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => Float, {
    nullable: true,
    description: '存储池的创建时间，单位 s'
  })
  createTime?: number

  @Field(() => PrimaryStorageCapacity, { nullable: true })
  primaryStorageCapacity?: PrimaryStorageCapacity
}

@ArgsType()
export class QuerCBDPrimaryStoragePoolyArgs extends QueryAction {
  @Field(() => CBDPrimaryStoragePoolQueryType, { nullable: true })
  declare type?: CBDPrimaryStoragePoolQueryType
}

@ObjectType()
export class CBDPrimaryStoragePoolList {
  @Field(() => [CBDPrimaryStoragePool], { defaultValue: [], nullable: true })
  list?: CBDPrimaryStoragePool[]

  @Field(() => Int, { defaultValue: 0 })
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class CBDStoragePoolPayload {
  @Field(() => String)
  name: string
}

@InputType()
export class CBDStoragePoolConfigPayload {
  @Field(() => [CBDStoragePoolPayload], {
    nullable: true,
    description: '已经添加到主存储中的池子'
  })
  pools?: CBDStoragePoolPayload[]
}

@InputType()
export class ActionCBDPrimaryStoragePoolPayload {
  @Field(() => String, { description: 'CBD主存储的 uuid' })
  uuid: string

  @Field(() => CBDStoragePoolConfigPayload, { nullable: true })
  config?: CBDStoragePoolConfigPayload
}
