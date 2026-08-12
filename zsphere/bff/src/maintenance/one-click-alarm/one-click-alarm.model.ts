import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { BasicEndPoint } from '@/maintenance/zwatch-endpoint/zwatch-endpoint.model'

export enum StateEventEnum {
  'ENABLE' = 'enable',
  'DISABLE' = 'disable'
}
@InputType()
export class OperatorAccount {
  @Field(() => String)
  accountUuid: string
}

@ObjectType({
  implements: [BasicEndPoint]
})
class TemplateEndPoint extends BasicEndPoint {}

@ObjectType()
export class NotifyObject {
  @Field(() => String, { nullable: true })
  actionUuid: string

  @Field(() => String, { nullable: true })
  alarmUuid: string
}
@ObjectType()
export class ActiveAlarmStatus {
  @Field(() => String, { nullable: true })
  ActiveAlarmStatus: string

  @Field(() => String, { nullable: true })
  state: string
}

@ObjectType()
export class OneClickAlarmTemplate {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  alarmName: string

  @Field(() => String, { nullable: true })
  state: string

  @Field(() => Int, { nullable: true })
  repeatCount: number

  @Field(() => Int, { nullable: true })
  period: number

  @Field(() => Int, { nullable: true })
  repeatInterval: number

  @Field(() => Float, { nullable: true })
  threshold: number

  @Field(() => String, { nullable: true })
  operatorAccountName: string

  @Field(() => String, { nullable: true })
  emergencyLevel: string

  @Field(() => String, { nullable: true })
  comparisonOperator: string

  @Field(() => [NotifyObject], { nullable: true })
  actions: [NotifyObject]

  @Field(() => [String], { nullable: true })
  actionsName: [string]

  @Field(() => [TemplateEndPoint], { nullable: true })
  endPoint?: [TemplateEndPoint]

  @Field(() => String, { nullable: true })
  metricName: string

  @Field(() => String, { nullable: true })
  namespace: string
}
@ObjectType()
export class OneClickAlarmResourceCountResp {
  @Field(() => Int, { nullable: true })
  vmTotal: number

  @Field(() => Int, { nullable: true })
  hostTotal: number

  @Field(() => Int, { nullable: true })
  vpcRouterTotal: number
}

@ObjectType()
export class OneClickAlarm {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  namespace: string

  @Field(() => String, { nullable: true })
  status: string

  @Field(() => [OneClickAlarmTemplate], { nullable: true })
  oneClickAlarmTemplate: [OneClickAlarmTemplate]

  @Field(() => [OneClickAlarmTemplate], { nullable: true })
  activeAlarmTemplate: [OneClickAlarmTemplate]
}

@ObjectType()
export class ActiveAlarm {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  alarmName: string

  @Field(() => Int, { nullable: true })
  repeatCount: number

  @Field(() => Int, { nullable: true })
  period: number

  @Field(() => Int, { nullable: true })
  repeatInterval: number

  @Field(() => Float, { nullable: true })
  threshold: number

  @Field(() => String, { nullable: true })
  operatorAccountName: string

  @Field(() => String, { nullable: true })
  emergencyLevel: string

  @Field(() => String, { nullable: true })
  comparisonOperator: string

  @Field(() => String, { nullable: true })
  metricName: string

  @Field(() => String, { nullable: true })
  namespace: string

  @Field(() => String, { nullable: true })
  state: string

  @Field(() => NotifyObject, { nullable: true })
  actions: NotifyObject
}
@ObjectType()
export class ActiveAlarmResp extends QueryCommonResponse(ActiveAlarm) {}
@ObjectType()
export class OneClickAlarmResp extends QueryCommonResponse(OneClickAlarm) {}
@ObjectType()
export class ActiveAlarmStatusResp extends QueryCommonResponse(ActiveAlarmStatus) {}
