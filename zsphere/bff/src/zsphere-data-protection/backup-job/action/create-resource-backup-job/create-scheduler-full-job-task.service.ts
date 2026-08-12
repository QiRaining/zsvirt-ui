import { Injectable, Inject } from '@nestjs/common'

import {
  CreateSchedulerJobAction,
  CreateSchedulerJobActionParam
} from '@/api/zstack/CreateSchedulerJobAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class CreateSchedulerFullJobTaskService extends FlowTaskBase {
  @Inject() private createSchedulerJobAction: CreateSchedulerJobAction

  async action(task) {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    let parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)

    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    const prevTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    const fullTriggerTask = await this.flowInstanceService.getPrevFromRoot(
      prevTask.taskId,
      rootTask
    )

    const param: CreateSchedulerJobActionParam = task.input.param
    param.parameters = {
      ...param.parameters,
      fullBackupTriggerUuid: fullTriggerTask.result.inventory.uuid
    }

    return await this.createSchedulerJobAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
