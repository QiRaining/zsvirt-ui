import { Injectable, Inject } from '@nestjs/common'

import {
  CreateSchedulerJobGroupAction,
  CreateSchedulerJobGroupActionParam
} from '@/api/zstack/CreateSchedulerJobGroupAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class CreateSchedulerJobGroupTaskService extends FlowTaskBase {
  @Inject()
  private createSchedulerJobGroupAction: CreateSchedulerJobGroupAction

  async action(task) {
    const apiId = task.taskId

    const param: CreateSchedulerJobGroupActionParam = task.input.param
    return await this.createSchedulerJobGroupAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
