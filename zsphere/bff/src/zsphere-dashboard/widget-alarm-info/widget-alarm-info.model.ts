import { Field, ObjectType, Int, ArgsType } from '@nestjs/graphql'

import { EmergencyLevel } from '@/common/enum'
import { Condition as ICondition } from '@/common/model/action-query.model'
import { AlarmHistories } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.model'
@ObjectType()
export class WidgetAlarm {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  alarmName: string

  @Field(() => EmergencyLevel, { nullable: true })
  emergencyLevel: EmergencyLevel

  @Field(() => Int)
  time: number

  @Field(() => String, { nullable: true })
  alarmStatus?: string

  @Field(() => String, { nullable: true })
  alarmUuid?: string

  @Field(() => String, { nullable: true })
  subscriptionUuid?: string

  @Field(() => String, { nullable: true })
  comparisonOperator?: string

  @Field(() => String, { nullable: true })
  context?: string

  @Field(() => String)
  dataUuid: string

  @Field(() => String, { nullable: true })
  labels?: string

  @Field(() => String, { nullable: true })
  metricName?: string

  @Field(() => String, { nullable: true })
  metricValue?: string

  @Field(() => String, { nullable: true })
  namespace?: string

  @Field(() => String, { nullable: true })
  period?: string

  @Field(() => String, { nullable: true })
  readStatus?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  threshold?: string

  @Field(() => String, { nullable: true })
  type: string
}

@ArgsType()
export class WidgetAlarmInfoInput {
  @Field(() => [ICondition], { nullable: true })
  conditions?: ICondition[]
}

@ObjectType()
export class AlarmResource {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, {
    nullable: true,
    description: '虚拟机等资源是否被删除到回收站'
  })
  state?: string
}

@ObjectType()
export class AlarmResourceInfo {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  namespace: string

  @Field(() => AlarmResource, { nullable: true })
  resourceInfo?: AlarmResource

  @Field(() => Int)
  emergent: number

  @Field(() => Int)
  important: number
}

@ObjectType()
export class WidgetAlarmInfo {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  emergentCount: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  importantCount: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  normalCount: number

  @Field(() => [AlarmHistories], { nullable: true, defaultValue: [] })
  latest10List: AlarmHistories[]

  @Field(() => [AlarmResourceInfo], { nullable: true, defaultValue: [] })
  top5ResourceList?: AlarmResourceInfo[]
}
