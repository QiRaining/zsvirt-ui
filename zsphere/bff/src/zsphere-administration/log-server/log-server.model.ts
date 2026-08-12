import { Field, Int, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class LogServer {
  @Field(() => Int)
  id: number

  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  level?: string

  @Field(() => String, { nullable: true })
  configuration?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  port?: string

  @Field(() => String, { nullable: true })
  facility?: string

  @Field(() => String, { nullable: true })
  logType?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  labelKey?: string

  @Field(() => String, { nullable: true })
  labelValue?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@ObjectType()
export class LogServerQueryResp extends QueryCommonResponse(LogServer) {}
