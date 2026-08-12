import { Field, ObjectType, Int, ArgsType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

@ObjectType()
export class WidgetResourceStateCount {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  other: number

  @Field(() => Int, { nullable: true })
  running: number

  @Field(() => Int, { nullable: true })
  stopped: number

  @Field(() => Int, { nullable: true })
  connected: number

  @Field(() => Int, { nullable: true })
  disconnected: number

  @Field(() => Int, { nullable: true })
  ready: number

  @Field(() => Int, { nullable: true })
  attached: number

  @Field(() => Int, { nullable: true })
  notAttached: number

  @Field(() => Int, { nullable: true })
  notInstantiated: number

  @Field(() => Int, { nullable: true })
  idle: number

  @Field(() => Int, { nullable: true })
  enabled: number

  @Field(() => Int, { nullable: true })
  disabled: number
}

@ArgsType()
export class WidgetResourceStateCountInput extends QueryAction {
  @Field(() => String, { nullable: true })
  hypervisorType?: string
}
