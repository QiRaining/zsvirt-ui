import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

export enum LogCollectState {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

registerEnumType(LogCollectState, {
  name: 'LogCollectState'
})

@ObjectType()
export class LogCollect {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => LogCollectState)
  state: LogCollectState

  @Field(() => String, { nullable: true })
  host: string

  @Field(() => String, { nullable: true })
  url: string

  @Field(() => String, { nullable: true })
  startTime: string

  @Field(() => String, { nullable: true })
  endTime: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class QueryLogCollectResp extends QueryCommonResponse(LogCollect) {}
