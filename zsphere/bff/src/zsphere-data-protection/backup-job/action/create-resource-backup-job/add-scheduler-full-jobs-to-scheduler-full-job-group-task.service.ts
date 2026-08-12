import { Injectable, Inject } from '@nestjs/common'

import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'

@Injectable()
export class AddSchedulerFullJobsToSchedulerFullJobGroupTaskService extends FlowTaskBase {
  name = AddSchedulerFullJobsToSchedulerFullJobGroupTaskService.name
  @Inject() declare flowInstanceService: FlowInstanceService
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction

  async action(task): Promise<any> {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    const jobTask = await this.flowInstanceService.getPrevFromRoot(task.taskId, rootTask)

    let parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)
    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)
    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    const jobGroupTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    const schedulerJobUuids = jobTask.children?.map(job => job.result.inventory.uuid)
    const schedulerJobGroupUuid = jobGroupTask.result.inventory.uuid

    const jobUuidMap = new Map(
      jobTask.children?.map(job => [
        job.result.inventory.targetResourceUuid,
        job.result.inventory.uuid
      ]) ?? []
    )
    const priorities = {}
    task.input.param.forEach(({ rootVolumeUuid, priority = 0 }) => {
      const jobUuid = jobUuidMap.get(rootVolumeUuid) as string
      if (jobUuid) {
        priorities[jobUuid] = priority
      }
    })

    const param = {
      schedulerJobGroupUuid,
      schedulerJobUuids,
      priorities
    }

    return await this.addSchedulerJobsToSchedulerJobGroupAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
