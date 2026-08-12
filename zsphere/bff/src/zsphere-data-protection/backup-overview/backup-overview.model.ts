import { ObjectType, Field, Int, ArgsType, Float } from '@nestjs/graphql'

import { SchedulerJobHistory } from '@/zsphere-administration/scheduler-job-history/scheduler-job-history.model'

@ArgsType()
export class QuerySchedulerReportArgs {
  @Field(() => Float, { defaultValue: 0 })
  startTime: number

  @Field(() => String)
  intervalTimeUnit: string

  @Field(() => Float)
  range: number

  @Field(() => [String])
  schedulerJobTypes: string[]
}

@ArgsType()
export class QuerySchedulerHistoryArgs {
  @Field(() => Float, { nullable: true })
  minStartTime: number

  @Field(() => Int, { nullable: true })
  minId: number

  @Field(() => String)
  startTime: string

  @Field(() => String)
  endTime: string

  @Field(() => [String])
  schedulerJobTypes: string[]
}

@ObjectType()
export class SchedulerReportResult {
  @Field(() => [Int])
  failureRecords: number[]

  @Field(() => [Int])
  partialSuccessRecords: number[]

  @Field(() => [Int])
  successRecords: number[]

  @Field(() => [Int])
  waitingRecords: number[]
}

@ObjectType()
export class MissionOverviewStatistics {
  @Field(() => Int, { defaultValue: 0 })
  totalTaskCount: number

  @Field(() => Int, { defaultValue: 0 })
  vmTaskCount: number

  @Field(() => Int, { defaultValue: 0 })
  volumeTaskCount: number

  @Field(() => Int, { defaultValue: 0 })
  dateBaseCount: number

  @Field(() => Int, { defaultValue: 0 })
  enabledCount: number

  @Field(() => Int, { defaultValue: 0 })
  disabledCount: number

  @Field(() => Int, { defaultValue: 0, description: 'KVM 云主机总数' })
  vmCount: number

  @Field(() => Int, { defaultValue: 0, description: '云盘总数' })
  volumeCount: number

  @Field(() => Int, { defaultValue: 0 })
  vmBackUpTaskCount: number

  @Field(() => Int, {
    defaultValue: 0,
    description: '云主机除了BackUpJob就是CDP Task'
  })
  vmCdpTaskCount: number

  @Field(() => Int, { defaultValue: 0 })
  vmNoneTaskCount: number

  @Field(() => Int, {
    defaultValue: 0,
    description: '纯粹的云盘备份，jobClassName=org.zstack.storage.backup.CreateVolumeBackupJob'
  })
  volumeBackUpTaskCount: number

  @Field(() => Int, {
    defaultValue: 0,
    description: '云主机全量备份，云主机CDP Task'
  })
  volumeOtherTaskCount: number

  @Field(() => Int, { defaultValue: 0 })
  volumeNoneTaskCount: number
}

@ObjectType()
export class OverviewSchedulerJobHistory {
  @Field(() => String, { nullable: true })
  id: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  resourceCount: number

  @Field(() => Float, { nullable: true })
  startTime: number

  @Field(() => String, { nullable: true })
  mode: string

  @Field(() => String, { nullable: true })
  endTime: string

  @Field(() => Int, { nullable: true })
  duration: number

  @Field(() => Int, { nullable: true })
  successCount: number

  @Field(() => Int, { nullable: true })
  failCount: number

  @Field(() => Int, { nullable: true })
  runningCount: number

  @Field(() => [SchedulerJobHistory], { nullable: true })
  jobList: SchedulerJobHistory[]

  @Field(() => String, { nullable: true })
  fireInstanceId: string

  @Field(() => String, { nullable: true })
  schedulerJobGroupUuid: string

  @Field(() => String, { nullable: true })
  jobType: string

  @Field(() => String, { nullable: true })
  type: string
}
