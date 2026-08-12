import { Field, ObjectType, Int, ArgsType, Float } from '@nestjs/graphql'

import { Condition } from '@/common/model/action-query.model'

@ArgsType()
export class WidgetMonitorTrendInput {
  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Int)
  offset: number

  @Field(() => String)
  namespace: string

  @Field(() => [String])
  metricNameList: string[]

  @Field(() => String)
  calculateType?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => [Condition], { nullable: true, defaultValue: [] })
  metricConditions?: Condition[]
}

@ObjectType()
export class WidgetMonitorTrendItem {
  @Field(() => Float, { nullable: true })
  time: number

  @Field(() => Float || String, { nullable: true })
  value: number | string

  @Field(() => String, { nullable: true })
  type: string
}

@ObjectType()
export class WidgetMonitorTrend {
  @Field(() => [WidgetMonitorTrendItem], { nullable: true })
  list: WidgetMonitorTrendItem[]

  @Field(() => [Float], { nullable: true })
  currentValue: [number]
}
