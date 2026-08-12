import { Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql'

import { EmergencyLevel, ComparisonOperator } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class MetricRuleTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  namespace?: string

  @Field(() => Int, { nullable: true })
  repeatCount?: number

  @Field(() => Int, { nullable: true })
  repeatInterval?: number

  @Field(() => Int, { nullable: true, description: '监控阈值' })
  threshold?: number

  @Field(() => Int, { nullable: true, description: '持续时间' })
  period?: number

  @Field(() => String, { nullable: true })
  monitorTemplateUuid?: string

  @Field(() => String, { nullable: true })
  metricName?: string

  @Field(() => Boolean, { nullable: true })
  enableRecovery?: boolean

  @Field(() => EmergencyLevel, { nullable: true })
  emergencyLevel?: EmergencyLevel

  @Field(() => ComparisonOperator, { nullable: true, description: '操作符' })
  comparisonOperator?: ComparisonOperator
}

@ObjectType()
export class QueryMetricRuleTemplateResp extends QueryCommonResponse(MetricRuleTemplate) {}
