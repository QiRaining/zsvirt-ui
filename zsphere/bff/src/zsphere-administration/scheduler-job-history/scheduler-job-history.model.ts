import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { BackupMode } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'

export enum SchedulerJobHistoryQueryType {
  NORMAL = 'NORMAL'
}

registerEnumType(SchedulerJobHistoryQueryType, {
  name: 'SchedulerJobHistoryQueryType'
})

@ArgsType()
export class QuerySchedulerJobHistoryArgs extends QueryAction {
  @Field(() => SchedulerJobHistoryQueryType, { nullable: true })
  declare type?: SchedulerJobHistoryQueryType

  @Field(() => String, { nullable: true, defaultValue: 'startTime' })
  declare sortBy?: string
}

@ObjectType()
export class ResourceInfo {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string
}

@ObjectType()
export class VmInstanceNameAndUuid {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class SchedulerJobHistory {
  @Field(() => Int, { nullable: true })
  executeTime: number

  @Field(() => String, { nullable: true })
  fireInstanceId: string

  @Field(() => Int, { nullable: true })
  id: number

  @Field(() => String, { nullable: true })
  jobType: string

  @Field(() => String, { nullable: true })
  requestDump: string

  @Field(() => String, { nullable: true })
  resultDump: string

  @Field(() => String, { nullable: true })
  schedulerJobUuid: string

  @Field(() => String, { nullable: true })
  startTime: string

  @Field(() => Boolean, { nullable: true })
  success: boolean

  @Field(() => String, { nullable: true })
  targetResourceUuid: string

  @Field(() => String, { nullable: true })
  triggerUuid: string

  @Field(() => String, { nullable: true })
  endTime?: string

  @Field(() => VmInstanceNameAndUuid, { nullable: true })
  vmInstance: VmInstanceNameAndUuid

  @Field(() => Volume, { nullable: true })
  volume: Volume

  @Field(() => ResourceInfo, { nullable: true })
  resourceInfo?: ResourceInfo

  @Field(() => String, { nullable: true })
  backupCapacity?: string
}

@ObjectType()
export class SchedulerJobHistoryGroupByFireInstanceId extends SchedulerJobHistory {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  resourceCount?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  successCount?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  failCount?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  runningCount?: number

  @Field(() => Int, { nullable: true })
  declare executeTime: number

  @Field(() => String, { nullable: true, description: '开始执行时间' })
  declare startExecutionTime: string

  @Field(() => String, { nullable: true })
  declare endTime?: string

  @Field(() => BackupMode, { nullable: true })
  mode?: BackupMode

  @Field(() => String, { nullable: true })
  schedulerName?: string

  @Field(() => String, { nullable: true })
  schedulerJobGroupUuid?: string

  @Field(() => String, { nullable: true })
  backupCapacityForSchedulerJobHistoryGroup?: string
}

export enum SchedulerJobHistoryGroupByFireInstanceIdQueryType {
  NORMAL = 'NORMAL',
  OVERVIEW = 'OVERVIEW'
}

registerEnumType(SchedulerJobHistoryGroupByFireInstanceIdQueryType, {
  name: 'SchedulerJobHistoryGroupByFireInstanceIdQueryType'
})
@ArgsType()
export class QuerySchedulerJobHistoryGroupByFireInstanceIdArgs extends QueryAction {
  @Field(() => SchedulerJobHistoryGroupByFireInstanceIdQueryType, {
    nullable: true
  })
  declare type?: SchedulerJobHistoryGroupByFireInstanceIdQueryType

  @Field(() => String, { nullable: true, defaultValue: 'startTime' })
  declare sortBy?: string

  @Field(() => String, { nullable: true, defaultValue: 'fireInstanceId' })
  declare groupBy?: string
}

@ObjectType()
export class SchedulerJobHistoryList {
  @Field(() => [SchedulerJobHistory])
  list: SchedulerJobHistory[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class SchedulerJobHistoryGroupByFireInstanceIdList {
  @Field(() => [SchedulerJobHistoryGroupByFireInstanceId])
  list: SchedulerJobHistoryGroupByFireInstanceId[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
