import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, Parent, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'
import { VolumeDataloader } from '@/zsphere-resource/volume/volume.dataloader'

import { SystemSchedulingTask, SystemSchedulingTaskResp } from './system-scheduling-task.model'
import { SystemSchedulingTaskService } from './system-scheduling-task.service'

@Resolver(() => SystemSchedulingTask)
export class SystemSchedulingTaskResolver {
  @Inject() systemSchedulingTaskService: SystemSchedulingTaskService
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() volumeDataloader: VolumeDataloader

  @Query(() => SystemSchedulingTaskResp)
  async systemSchedulingTaskList(@Args() params: QueryAction): Promise<SystemSchedulingTaskResp> {
    return this.systemSchedulingTaskService.queryAction(params)
  }

  @ResolveField(() => VmInstance, { nullable: true })
  async vmInstance(@Parent() schedulerJob: SystemSchedulingTask) {
    const isVm = schedulerJob.jobName === 'APICreateVmBackupMsg'
    if (!isVm) {
      return null
    }
    const rootVolume = (await this.volumeDataloader.query(
      schedulerJob.uuid,
      schedulerJob.targetResourceUuid
    )) as Volume
    if (rootVolume && rootVolume.vmInstanceUuid) {
      const vmInstance = await this.vmInstanceDataloader.query(
        schedulerJob.uuid,
        rootVolume.vmInstanceUuid
      )

      return vmInstance
    }

    return null
  }

  @ResolveField(() => Volume, { nullable: true })
  async volume(@Parent() schedulerJob: SystemSchedulingTask) {
    const isVm = schedulerJob.jobName === 'APICreateVmBackupMsg'
    if (isVm) {
      return null
    }
    return this.volumeDataloader.query(schedulerJob.uuid, schedulerJob.targetResourceUuid)
  }

  @ResolveField(() => Number, { nullable: true })
  async progress(@Parent() schedulerJob: SystemSchedulingTask) {
    return this.systemSchedulingTaskService.getTaskProgress(schedulerJob.apiId)
  }
}
