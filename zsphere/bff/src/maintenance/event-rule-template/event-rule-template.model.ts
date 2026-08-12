import { Field, ObjectType, InputType } from '@nestjs/graphql'

import { EmergencyLevel } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class EventRuleTempalteLabel {
  @Field(() => String)
  key: string

  @Field(() => String, { nullable: true })
  op?: string

  @Field(() => String, { nullable: true })
  value?: string
}

@InputType()
export class EventLableInput {
  @Field(() => String)
  key: string

  @Field(() => String)
  op: string

  @Field(() => String)
  value: string
}

@ObjectType()
export class EventRuleTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  namespace?: string

  @Field(() => String, { nullable: true })
  monitorTemplateUuid?: string

  @Field(() => String, { nullable: true })
  eventName?: string

  @Field(() => EmergencyLevel, { nullable: true })
  emergencyLevel?: EmergencyLevel

  @Field(() => [EventRuleTempalteLabel], { nullable: true })
  labels?: EventRuleTempalteLabel[]
}

@ObjectType()
export class QueryEventRuleTemplateResp extends QueryCommonResponse(EventRuleTemplate) {}
