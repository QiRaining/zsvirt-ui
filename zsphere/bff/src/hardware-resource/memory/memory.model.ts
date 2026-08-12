import { ObjectType, Field, ArgsType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

import { HardwareState } from '../host/host.model'

@ObjectType()
export class Memory {
  @Field(() => String)
  uuid?: string

  @Field(() => String, { nullable: true })
  manufacturer?: string

  @Field(() => String, { nullable: true })
  size?: string

  @Field(() => HardwareState, { nullable: true })
  state?: HardwareState

  @Field(() => String, { nullable: true })
  locator?: string

  @Field(() => String, { nullable: true })
  serialNumber?: string

  @Field(() => String, { nullable: true })
  clockSpeed?: string

  @Field(() => String, { nullable: true })
  speed?: string

  @Field(() => String, { nullable: true })
  rank?: string

  @Field(() => String, { nullable: true })
  voltage?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ArgsType()
export class QueryMemoryArgs extends QueryAction {}

@ObjectType()
export class QueryMemoryResp extends QueryCommonResponse(Memory) {}
