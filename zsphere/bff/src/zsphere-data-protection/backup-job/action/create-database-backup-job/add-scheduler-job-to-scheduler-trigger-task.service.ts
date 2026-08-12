import { Injectable, Inject } from '@nestjs/common'

import {
  AddSchedulerJobToSchedulerTriggerAction,
  AddSchedulerJobToSchedulerTriggerActionParam
} from '@/api/zstack/AddSchedulerJobToSchedulerTriggerAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'

@Injectable()
export class AddSchedulerJobToSchedulerTriggerTaskService extends FlowTaskBase {
  name = AddSchedulerJobToSchedulerTriggerTaskService.name
  @Inject() declare flowInstanceService: FlowInstanceService
  @Inject()
  addSchedulerJobToSchedulerTriggerAction: AddSchedulerJobToSchedulerTriggerAction

  async action(task): Promise<any> {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    const triggerTask = await this.flowInstanceService.getPrevTask(task)
    let parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)

    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    const jobTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    const schedulerJobUuid = jobTask.result.inventory.uuid
    const schedulerTriggerUuid = triggerTask.result.inventory.uuid
    const param: AddSchedulerJobToSchedulerTriggerActionParam = {
      schedulerJobUuid,
      schedulerTriggerUuid
    }

    return await this.addSchedulerJobToSchedulerTriggerAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
