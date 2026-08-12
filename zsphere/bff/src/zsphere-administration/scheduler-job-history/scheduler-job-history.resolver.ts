import { Inject } from '@nestjs/common'
import { Args, Query, Parent, Resolver, ResolveField } from '@nestjs/graphql'

import { BackupMode } from '@/common/enum'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VolumeDataloader } from '@/zsphere-resource/volume/volume.dataloader'

import { SchedulerJobHistoryGroupByFireInstanceIdQueryService } from './scheduler-job-history-group-by-fire-instance-id-query/scheduler-job-history-group-by-fire-instance-id-query.service'
import { SchedulerJobHistoryQueryService } from './scheduler-job-history-query/scheduler-job-history-query.service'
import {
  QuerySchedulerJobHistoryArgs,
  QuerySchedulerJobHistoryGroupByFireInstanceIdArgs,
  SchedulerJobHistory as ISchedulerJobHistory,
  SchedulerJobHistoryGroupByFireInstanceId,
  SchedulerJobHistoryGroupByFireInstanceIdList,
  SchedulerJobHistoryList as ISchedulerJobHistoryList
} from './scheduler-job-history.model'

@Resolver(() => ISchedulerJobHistory)
export class SchedulerJobHistoryResolver {
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() volumeDataloader: VolumeDataloader
  @Inject() schedulerJobHistoryQueryService: SchedulerJobHistoryQueryService

  @ResolveField()
  async vmInstance(@Parent() schedulerJobHistory: ISchedulerJobHistory) {
    return this.vmInstanceDataloader.query(
      schedulerJobHistory.id,
      schedulerJobHistory.targetResourceUuid
    )
  }

  @ResolveField()
  async endTime(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return String(
      Date.parse(schedulerJobHistory.startTime) + schedulerJobHistory.executeTime * 1000
    )
  }

  @ResolveField()
  async volume(@Parent() schedulerJobHistory: ISchedulerJobHistory) {
    return this.volumeDataloader.query(
      schedulerJobHistory.id,
      schedulerJobHistory.targetResourceUuid
    )
  }

  @ResolveField()
  async resourceInfo(@Parent() schedulerJobHistory: ISchedulerJobHistory) {
    return this.schedulerJobHistoryQueryService.getResourceInfo(
      schedulerJobHistory.fireInstanceId + schedulerJobHistory.id,
      schedulerJobHistory
    )
  }

  @ResolveField()
  async backupCapacity(@Parent() schedulerJobHistory: ISchedulerJobHistory) {
    let resultDumps: any[] = []

    //失败的是  0
    if (!schedulerJobHistory?.success) {
      return '0'
    }

    try {
      const result = JSON.parse(schedulerJobHistory?.resultDump ?? '{}')
      resultDumps = result?.inventory ? result?.inventory : (result?.inventories ?? [])
    } catch (err) {}
    resultDumps = Array.isArray(resultDumps) ? resultDumps : [resultDumps]

    const totalSize = resultDumps?.reduce((pre, current) => {
      return pre + (current?.size ?? 0)
    }, 0) as number

    return (totalSize ?? 0).toString()
  }

  @Query(() => ISchedulerJobHistoryList)
  schedulerJobHistoryList(@Args() queryArgs: QuerySchedulerJobHistoryArgs) {
    return this.schedulerJobHistoryQueryService.queryList(queryArgs)
  }
}

@Resolver(() => SchedulerJobHistoryGroupByFireInstanceId)
export class SchedulerJobHistoryGroupByFireInstanceIdResolver {
  @Inject()
  schedulerJobHistoryGroupByFireInstanceIdQueryService: SchedulerJobHistoryGroupByFireInstanceIdQueryService

  @ResolveField()
  async resourceCount(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getResourceCount(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async successCount(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getSuccessCount(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async failCount(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getFailCount(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async runningCount(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getRunningCount(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async executeTime(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getExecuteTime(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async endTime(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getEndTime(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async startExecutionTime(
    @Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId
  ) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getStartExecutionTime(
      schedulerJobHistory.fireInstanceId
    )
  }

  @ResolveField()
  async mode(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    // 数据库
    if (schedulerJobHistory?.targetResourceUuid === '7ae6456c0b01324dae6d4bef358a5772') {
      return BackupMode.full
    }

    let resultDump: any
    try {
      resultDump = JSON.parse(String(schedulerJobHistory?.resultDump))
    } catch (error) {
      console.log(error)
      return BackupMode.incremental
    }
    if (resultDump?.inventories?.[0]?.mode === 'full') {
      return BackupMode.full
    } else {
      return BackupMode.incremental
    }
  }

  @ResolveField()
  async schedulerName(@Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.getSchedulerName(
      schedulerJobHistory
    )
  }

  @Query(() => SchedulerJobHistoryGroupByFireInstanceIdList)
  schedulerJobHistoryGroupByFireInstanceIdList(
    @Args() queryArgs: QuerySchedulerJobHistoryGroupByFireInstanceIdArgs
  ) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.queryList(queryArgs)
  }

  //backup.capacity

  @ResolveField()
  async backupCapacityForSchedulerJobHistoryGroup(
    @Parent() schedulerJobHistory: SchedulerJobHistoryGroupByFireInstanceId
  ) {
    return this.schedulerJobHistoryGroupByFireInstanceIdQueryService.backupCapacityForSchedulerJobHistoryGroup(
      schedulerJobHistory.fireInstanceId
    )
  }
}
