import { ObjectType, Field, Int } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class StorageAdapter {
  @Field(() => String)
  name: string

  @Field(() => String)
  hostUuid: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String)
  type: string

  @Field(() => [String], { nullable: true })
  transport?: string[]

  @Field(() => String, { nullable: true })
  identifier?: string

  @Field(() => String, { nullable: true })
  speed?: string

  @Field(() => Int, { nullable: true })
  target?: number

  @Field(() => Int, { nullable: true })
  device?: number
}

@ObjectType()
export class StorageAdapterResponse extends QueryCommonResponse(StorageAdapter) {}

@ObjectType()
export class StorageAdapterCountResponse {
  @Field(() => Int)
  total: number
}
