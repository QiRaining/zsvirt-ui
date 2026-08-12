import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'

export enum SchedulerTriggerQueryType {
  Normal = 'Normal',
  CandidateForCreatingSchedulerJob = 'CandidateForCreatingSchedulerJob'
}
registerEnumType(SchedulerTriggerQueryType, {
  name: 'SchedulerTriggerQueryType'
})

export enum SchedulerType {
  simple = 'simple',
  cron = 'cron'
}

registerEnumType(SchedulerType, {
  name: 'SchedulerType'
})

@ObjectType()
export class OwnerNameAndUuidAndType {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string
}

@ObjectType()
export class SchedulerTrigger {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => [String], { nullable: true })
  jobsUuid: string[]

  @Field(() => SchedulerType, {
    description: '定时器类型',
    nullable: true,
    defaultValue: SchedulerType.simple
  })
  schedulerType?: SchedulerType

  @Field(() => Int, { nullable: true })
  schedulerInterval: number

  @Field(() => Int, { nullable: true })
  repeatCount: number

  @Field(() => String, { nullable: true })
  cron?: string

  @Field(() => String, { nullable: true })
  startTime: string

  @Field(() => String, { nullable: true })
  stopTime: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  state: string

  @Field(() => OwnerNameAndUuidAndType, { nullable: true })
  owner: OwnerNameAndUuidAndType
}

@ObjectType()
export class SchedulerTriggerList {
  @Field(() => [SchedulerTrigger])
  list: SchedulerTrigger[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
