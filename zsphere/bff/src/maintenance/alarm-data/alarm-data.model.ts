import { ArgsType, Field, Float, ObjectType } from '@nestjs/graphql'

import { Condition } from '@/common/model/action-query.model'

@ObjectType()
export class AlarmData {
  @Field(() => String)
  accountUuid: string

  @Field(() => String)
  alarmName: string

  @Field(() => String)
  alarmStatus: string

  @Field(() => String)
  alarmUuid: string

  @Field(() => String)
  comparisonOperator: string

  @Field(() => String)
  context: string

  @Field(() => String)
  dataUuid: string

  @Field(() => String)
  emergencyLevel: string

  @Field(() => String)
  labels: string

  @Field(() => String)
  metricName: string

  @Field(() => String)
  metricValue: string

  @Field(() => String)
  namespace: string

  @Field(() => String)
  period: string

  @Field(() => String)
  readStatus: string

  @Field(() => String)
  resourceType: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  threshold: string

  @Field(() => String)
  time: string
}

@ObjectType()
export class AssignResourceAlarmData {
  @Field(() => Float)
  Important: number

  @Field(() => Float)
  Emergent: number

  @Field(() => Float)
  Normal: number
}

@ArgsType()
export class GetAssignResourceAlarmDataInput {
  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => [Condition])
  conditions: Condition[]
}
