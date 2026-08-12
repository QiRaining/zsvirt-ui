import { ObjectType, Field, ArgsType, registerEnumType, Int } from '@nestjs/graphql'

import { SchedulerJobGroupState } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { SchedulerJobHistoryGroupByFireInstanceId } from '@/zsphere-administration/scheduler-job-history/scheduler-job-history.model'
import { SchedulerJob } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { SchedulerTrigger } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

export enum SchedulerJobGroupQueryType {
  NORMAL = 'NORMAL',
  GetVmByZoneAndDatabase = 'GetVmByZoneAndDatabase',
  GetVMAttachableBackupJob = 'GetVMAttachableBackupJob',
  GetVolumeAttachableBackupJob = 'GetVolumeAttachableBackupJob'
}

registerEnumType(SchedulerJobGroupQueryType, {
  name: 'SchedulerJobGroupQueryType'
})

export enum SchedulerJobGroupType {
  startVm = 'startVm',
  stopVm = 'stopVm',
  rebootVm = 'rebootVm',
  volumeSnapshot = 'volumeSnapshot',
  volumeBackup = 'volumeBackup',
  rootVolumeBackup = 'rootVolumeBackup',
  vmBackup = 'vmBackup',
  databaseBackup = 'databaseBackup'
}

registerEnumType(SchedulerJobGroupType, {
  name: 'SchedulerJobGroupType'
})

@ArgsType()
export class QuerySchedulerJobGroupArgs extends QueryAction {
  @Field(() => SchedulerJobGroupQueryType, { nullable: true })
  declare type?: SchedulerJobGroupQueryType
}

@ObjectType()
export class SchedulerJobGroupOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  type: string
}

@ObjectType()
export class SchedulerJobGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SchedulerJobGroupState, { nullable: true })
  state?: SchedulerJobGroupState

  @Field(() => String, { nullable: true, defaultValue: 'Ready' })
  status?: string

  @Field(() => SchedulerJobGroupType, { nullable: true })
  jobType?: SchedulerJobGroupType

  @Field(() => String, { nullable: true })
  jobData?: string

  @Field(() => [String], { nullable: true })
  triggersUuid?: string[]

  @Field(() => [SchedulerTrigger], { nullable: true, defaultValue: [] })
  schedulerTriggers?: SchedulerTrigger[]

  @Field(() => [String], { nullable: true })
  jobsUuid?: string[]

  @Field(() => [SchedulerJob], { nullable: true, defaultValue: [] })
  jobs?: SchedulerJob[]

  @Field(() => [BackupStorage], { nullable: true, defaultValue: [] })
  localBackupStorage?: BackupStorage[]

  @Field(() => BackupStorage, { nullable: true })
  remoteBackupStorage?: BackupStorage

  @Field(() => SchedulerJobGroupOwner, { nullable: true })
  owner?: SchedulerJobGroupOwner

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => SchedulerJobHistoryGroupByFireInstanceId, { nullable: true })
  lastJobResult?: SchedulerJobHistoryGroupByFireInstanceId
}

@ObjectType()
export class SchedulerJobGroupList {
  @Field(() => [SchedulerJobGroup], { defaultValue: [] })
  list?: SchedulerJobGroup[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
