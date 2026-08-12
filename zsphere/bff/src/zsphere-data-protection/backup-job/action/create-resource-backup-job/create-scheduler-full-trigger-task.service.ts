import { Injectable, Inject } from '@nestjs/common'

import {
  CreateSchedulerTriggerAction,
  CreateSchedulerTriggerActionParam
} from '@/api/zstack/CreateSchedulerTriggerAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class CreateSchedulerFullTriggerTaskService extends FlowTaskBase {
  @Inject() private createSchedulerTriggerAction: CreateSchedulerTriggerAction

  async action(task) {
    const apiId = task.taskId

    const param: CreateSchedulerTriggerActionParam = task.input.param
    return await this.createSchedulerTriggerAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
