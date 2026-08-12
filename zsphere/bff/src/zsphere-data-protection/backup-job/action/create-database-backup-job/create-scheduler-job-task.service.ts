import { Injectable, Inject } from '@nestjs/common'

import {
  CreateSchedulerJobAction,
  CreateSchedulerJobActionParam
} from '@/api/zstack/CreateSchedulerJobAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class CreateSchedulerJobTaskService extends FlowTaskBase {
  @Inject() private createSchedulerJobAction: CreateSchedulerJobAction

  async action(task) {
    const apiId = task.taskId

    const param: CreateSchedulerJobActionParam = task.input.param
    return await this.createSchedulerJobAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
