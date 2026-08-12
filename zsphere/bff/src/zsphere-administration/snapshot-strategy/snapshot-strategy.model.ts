import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import {
  SchedulerJobState,
  AccountInfo
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'

@ObjectType()
export class SnapshotStrategyJob {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  jobData: string

  @Field(() => String)
  targetResourceUuid: string

  @Field(() => [String])
  schedulerJobGroupUuids: string[]

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class SnapshotStrategyTrigger {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  cron: string

  @Field(() => String)
  startTime: string

  @Field(() => String, { nullable: true })
  stopTime?: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  createDate: string
}

@ArgsType()
export class QuerySnapshotStrategyArgs extends QueryAction {}

@ObjectType()
export class SnapshotStrategy {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SchedulerJobState)
  state: SchedulerJobState

  @Field(() => [String], { nullable: true })
  jobsUuid?: string[]

  @Field(() => [SnapshotStrategyJob], { nullable: true })
  jobs?: SnapshotStrategyJob[]

  @Field(() => String)
  jobData: string

  @Field(() => [String])
  triggersUuid: string[]

  @Field(() => [SnapshotStrategyTrigger])
  triggers: SnapshotStrategyTrigger[]

  @Field(() => AccountInfo)
  owner: AccountInfo

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class SnapshotStrategyList {
  @Field(() => [SnapshotStrategy], { defaultValue: [] })
  list: SnapshotStrategy[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
