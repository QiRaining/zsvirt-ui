import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, ResolveField, Parent } from '@nestjs/graphql'

import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { SchedulerTrigger } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

import { SchedulerJobGroupQueryService } from './scheduler-job-group-query/scheduler-job-group-query.service'
import {
  QuerySchedulerJobGroupArgs,
  SchedulerJobGroup,
  SchedulerJobGroupList,
  SchedulerJobGroupOwner
} from './scheduler-job-group.model'

@Resolver(() => SchedulerJobGroup)
export class SchedulerJobGroupResolver {
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() schedulerJobGroupQueryService: SchedulerJobGroupQueryService
  @Inject() zoneDataloader: ZoneDataloader

  @Query(() => SchedulerJobGroupList)
  async schedulerJobGroupList(@Args() queryArgs: QuerySchedulerJobGroupArgs) {
    return this.schedulerJobGroupQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async localBackupStorage(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getLocalBackupStorage(schedulerJobGroup)
  }

  @ResolveField(() => SchedulerTrigger)
  async schedulerTriggers(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getTriggers(schedulerJobGroup)
  }

  @ResolveField()
  async jobs(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getJobs(schedulerJobGroup)
  }

  @ResolveField()
  async status(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getBackupStatus(schedulerJobGroup.uuid)
  }

  @ResolveField()
  async lastJobResult(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getLastJobResult(schedulerJobGroup.uuid)
  }

  @ResolveField()
  async remoteBackupStorage(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.schedulerJobGroupQueryService.getRemoteBackupStorage(schedulerJobGroup)
  }

  @ResolveField(() => SchedulerJobGroupOwner)
  async owner(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    return this.ownerDataLoader.query(schedulerJobGroup.uuid)
  }

  @ResolveField(() => Zone)
  async zone(@Parent() schedulerJobGroup: SchedulerJobGroup) {
    if (!schedulerJobGroup.zoneUuid) {
      return null
    }
    return this.zoneDataloader.query(schedulerJobGroup.uuid, schedulerJobGroup.zoneUuid)
  }
}
