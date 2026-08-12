import { Float, Field, ObjectType, ArgsType, Int } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'

@ObjectType()
export class OperatorAccount {
  @Field(() => String)
  name: string
}

@ObjectType()
export class Audit {
  @Field(() => Int, { nullable: true })
  id: number

  @Field(() => String, { nullable: true })
  requestUuid: string

  @Field(() => String, { nullable: true })
  responseUuid: string

  @Field(() => String, { nullable: true })
  apiName: string

  @Field(() => String, { nullable: true })
  operatorAccountUuid: string

  @Field(() => String, { nullable: true })
  operator: string

  @Field(() => String, { nullable: true })
  operatorAccountName: string

  @Field(() => Boolean, { nullable: true })
  isError: boolean

  @Field(() => String, { nullable: true })
  error: string

  @Field(() => String, { nullable: true })
  reason: string

  @Field(() => Float, { nullable: true })
  duration: number

  @Field(() => Float, { nullable: true })
  time: number

  @Field(() => Float, { nullable: true })
  createTime: number

  @Field(() => String, { nullable: true })
  clientIp: string

  @Field(() => String, { nullable: true })
  clientBrowser: string

  @Field(() => String, { nullable: true })
  requestDump: string

  @Field(() => String, { nullable: true })
  responseDump: string

  @Field(() => String, { nullable: true })
  resourceType: string

  @Field(() => String, { description: '资源 UUID', nullable: true })
  resourceUuid?: string

  @Field(() => Boolean, { description: '数据保护是否通过', nullable: true })
  isValid?: boolean

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  currentResourceName?: string

  @Field(() => String, { nullable: true })
  alarmZhName?: string
}

@ArgsType()
export class QueryAuditArgs extends QueryAction {
  @Field(() => Float, { description: '开始时间', nullable: true })
  startTime?: number

  @Field(() => Float, { description: '结束时间', nullable: true })
  endTime?: number
}

@ObjectType()
export class AuditResp extends QueryCommonResponse(Audit) {}

@ObjectType()
export class CurrentTime {
  @Field(() => Float)
  MillionSeconds: number

  @Field(() => Float)
  Seconds: number
}

@ObjectType()
export class GetCurrentTime {
  @Field(() => CurrentTime)
  currentTime: CurrentTime

  @Field(() => String, { nullable: true })
  timezone?: string

  @Field(() => String, { nullable: true })
  offset?: string
}
