import { Injectable, Inject } from '@nestjs/common'

import {
  CreateL3NetworkAction,
  CreateL3NetworkActionParam
} from '@/api/zstack/CreateL3NetworkAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class CreateL3NetworkTaskService extends FlowTaskBase {
  @Inject() private createL3NetworkAction: CreateL3NetworkAction

  async action(task) {
    const apiId = task.taskId
    const param: CreateL3NetworkActionParam = task.input.param
    try {
      return this.createL3NetworkAction.call(param, {
        actionId: task.input.info.actionId,
        taskId: task.input.info.taskId,
        apiId
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

export interface CreateL3NetworkTaskParam extends CreateL3NetworkActionParam {}
