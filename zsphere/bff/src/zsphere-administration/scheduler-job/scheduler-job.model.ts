import { ArgsType, Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { SchedulerTrigger } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'
import { SchedulerJobGroup } from '@/zsphere-data-protection/backup-job/scheduler-job-group.model'
import { VmInstanceBase } from '@/zsphere-resource/vm-instance/vm-instance-base.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'

export enum SchedulerJobStateEvent {
  enable = 'enable',
  disable = 'disable'
}

export enum SchedulerJobType {
  startVm = 'startVm',
  stopVm = 'stopVm',
  rebootVm = 'rebootVm',
  volumeSnapshot = 'volumeSnapshot',
  volumeSnapshotGroup = 'volumeSnapshotGroup',
  volumeBackup = 'volumeBackup',
  rootVolumeBackup = 'rootVolumeBackup',
  vmBackup = 'vmBackup',
  databaseBackup = 'databaseBackup',
  localRaidSelfTest = 'localRaidSelfTest'
}

export enum SchedulerJobQueryType {
  Normal = 'Normal',
  DatabaseBackupJob = 'DatabaseBackupJob',
  GetCandidateForScheduler = 'GetCandidateForScheduler'
}

export enum SchedulerJobState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

registerEnumType(SchedulerJobStateEvent, {
  name: 'SchedulerJobStateEvent'
})

registerEnumType(SchedulerJobType, {
  name: 'SchedulerJobType'
})

registerEnumType(SchedulerJobQueryType, {
  name: 'SchedulerJobQueryType'
})

registerEnumType(SchedulerJobState, {
  name: 'SchedulerJobState'
})

@ObjectType()
export abstract class AccountInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string
}

@InputType()
export abstract class Parameters {
  @Field(() => String, { nullable: true })
  snapshotMaxNumber?: string

  @Field(() => String, { nullable: true })
  snapshotGroupMaxNumber?: string

  @Field(() => String, { nullable: true })
  retentionType?: string

  @Field(() => String, { nullable: true })
  retentionValue?: string

  @Field(() => String, { nullable: true })
  remoteRetentionType?: string

  @Field(() => String, { nullable: true })
  remoteRetentionValue?: string

  @Field(() => String, { nullable: true })
  backupStorageUuids?: string

  @Field(() => String, { nullable: true })
  remoteBackupStorageUuid?: string

  @Field(() => String, { nullable: true })
  fullBackupTriggerUuid?: string

  @Field(() => String, { nullable: true })
  networkWriteBandwidth?: string

  @Field(() => String, { nullable: true })
  networkReadBandwidth?: string

  @Field(() => String, { nullable: true })
  volumeReadBandwidth?: string

  @Field(() => String, { nullable: true, defaultValue: '' })
  volumeWriteBandwidth?: string

  @Field(() => String, { nullable: true })
  fullBackupRetentionValue?: string

  @Field(() => String, { nullable: true })
  remoteFullBackupRetentionValue?: string
}

@ArgsType()
export class QuerySchedulerJobArgs extends QueryAction {
  @Field(() => SchedulerJobQueryType, { nullable: true })
  declare type?: SchedulerJobQueryType
}

@ObjectType()
export class SchedulerJobGroupJobRef {
  @Field(() => String)
  schedulerJobUuid: string

  @Field(() => String)
  schedulerJobGroupUuid: string

  @Field(() => Int, { nullable: true })
  priority?: number
}

@ObjectType()
export class SchedulerJob {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true, description: '资源的详细描述' })
  description: string

  @Field(() => String)
  targetResourceUuid: string

  @Field(() => [String])
  triggersUuid: Array<string>

  @Field(() => SchedulerJobState, { description: '启用状态' })
  state: SchedulerJobState

  @Field(() => String, { description: '创建日期' })
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  jobData: string

  @Field(() => String)
  jobClassName: string

  @Field(() => SchedulerTrigger, { description: '定时器', nullable: true })
  schedulerTrigger: SchedulerTrigger

  @Field(() => AccountInfo, { nullable: true })
  owner: AccountInfo

  @Field(() => VmInstanceBase, { nullable: true })
  vmInstance: VmInstanceBase

  @Field(() => Volume, { nullable: true })
  volume: Volume

  @Field(() => [BackupStorage], { nullable: true, defaultValue: [] })
  localBackupStorage?: BackupStorage[]

  @Field(() => BackupStorage, { nullable: true })
  remoteBackupStorage?: BackupStorage

  @Field(() => [SchedulerJobGroupJobRef], { nullable: true })
  schedulerJobGroupJobRefs?: SchedulerJobGroupJobRef[]

  @Field(() => [String], { nullable: true })
  schedulerJobGroupUuids?: string[]

  @Field(() => [SchedulerJobGroup], { nullable: true })
  schedulerJobGroup?: SchedulerJobGroup[]
}

@ObjectType()
export class SchedulerJobList {
  @Field(() => [SchedulerJob])
  list: SchedulerJob[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateSchedulerActionInput {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@ObjectType()
export class SchedulerJobActionResp {
  @Field(() => SchedulerJob, { nullable: true })
  result?: SchedulerJob

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
