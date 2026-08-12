import { Injectable, Inject } from '@nestjs/common'

import {
  AddSchedulerJobGroupToSchedulerTriggerAction,
  AddSchedulerJobGroupToSchedulerTriggerActionParam
} from '@/api/zstack/AddSchedulerJobGroupToSchedulerTriggerAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'

@Injectable()
export class AddSchedulerJobGroupToSchedulerTriggerTaskService extends FlowTaskBase {
  name = AddSchedulerJobGroupToSchedulerTriggerTaskService.name
  @Inject() declare flowInstanceService: FlowInstanceService
  @Inject()
  addSchedulerJobGroupToSchedulerTriggerAction: AddSchedulerJobGroupToSchedulerTriggerAction

  async action(task): Promise<any> {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    const triggerTask = await this.flowInstanceService.getPrevTask(task)
    let parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)

    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    const groupTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    const schedulerJobGroupUuid = groupTask.result.inventory.uuid
    const schedulerTriggerUuid = triggerTask.result.inventory.uuid
    const triggerNow = task.input.param?.triggerNow
    const param: AddSchedulerJobGroupToSchedulerTriggerActionParam = {
      schedulerJobGroupUuid,
      schedulerTriggerUuid
    }

    if (triggerNow) {
      param.triggerNow = true
    }

    return await this.addSchedulerJobGroupToSchedulerTriggerAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
