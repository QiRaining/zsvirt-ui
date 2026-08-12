import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent } from '@nestjs/graphql'

import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VolumeDataloader } from '@/zsphere-resource/volume/volume.dataloader'

import { OwnerDataLoader } from '../owner/owner.dataloader'
import { SchedulerJobQueryService } from './scheduler-job-query/scheduler-job-query.service'
import {
  QuerySchedulerJobArgs,
  SchedulerJob as ISchedulerJob,
  SchedulerJobList as ISchedulerJobList
} from './scheduler-job.model'
import { SchedulerJobService } from './scheduler-job.service'

@Resolver(() => ISchedulerJob)
export class SchedulerJobResolver {
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() schedulerJobService: SchedulerJobService
  @Inject() volumeDataloader: VolumeDataloader
  @Inject() schedulerJobQueryService: SchedulerJobQueryService
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => ISchedulerJobList)
  schedulerJobList(@Args() queryArgs: QuerySchedulerJobArgs) {
    return this.schedulerJobQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async schedulerTrigger(@Parent() schedulerJob: ISchedulerJob) {
    return this.schedulerJobService.getSchedulerTrigger(
      schedulerJob.uuid,
      schedulerJob.triggersUuid[0]
    )
  }

  @ResolveField()
  async vmInstance(@Parent() schedulerJob: ISchedulerJob) {
    return this.vmInstanceDataloader.query(schedulerJob.uuid, schedulerJob.targetResourceUuid)
  }

  @ResolveField()
  async localBackupStorage(@Parent() schedulerJob: ISchedulerJob) {
    return this.schedulerJobQueryService.getLocalBackupStorage(schedulerJob)
  }

  @ResolveField()
  async remoteBackupStorage(@Parent() schedulerJob: ISchedulerJob) {
    return this.schedulerJobQueryService.getRemoteBackupStorage(schedulerJob)
  }

  @ResolveField()
  async volume(@Parent() schedulerJob: ISchedulerJob) {
    return this.volumeDataloader.query(schedulerJob.uuid, schedulerJob.targetResourceUuid)
  }

  @ResolveField()
  async owner(@Parent() schedulerJob: ISchedulerJob) {
    return this.ownerDataLoader.query(schedulerJob.uuid)
  }

  @ResolveField()
  async schedulerJobGroupJobRefs(@Parent() schedulerJob: ISchedulerJob) {
    return this.schedulerJobQueryService.getSchedulerJobGroupJobRefs(schedulerJob.uuid)
  }

  @ResolveField()
  async schedulerJobGroup(@Parent() schedulerJob: ISchedulerJob) {
    if (!schedulerJob.schedulerJobGroupUuids?.length) {
      return []
    }
    return this.schedulerJobQueryService.getSchedulerJobGroup(schedulerJob)
  }
}
