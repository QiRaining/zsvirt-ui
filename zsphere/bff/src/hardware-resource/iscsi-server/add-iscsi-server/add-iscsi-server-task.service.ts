import { Injectable, Inject } from '@nestjs/common'

import { AddIscsiServerAction, AddIscsiServerActionParam } from '@/api/zstack/AddIscsiServerAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class AddIscsiServerTaskService extends FlowTaskBase {
  @Inject() private addIscsiServerAction: AddIscsiServerAction

  async action(task) {
    const apiId = task.taskId

    const param: AddIscsiServerActionParam = task.input.param
    return await this.addIscsiServerAction.call(param, {
      actionId: apiId,
      taskId: apiId,
      apiId
    })
  }
}

export interface AddIscsiServerTaskParam {
  name: string
  ip: string
  port: string
  chapUserName?: string
  chapUserPassword?: string
  clusterUuid?: string
}
