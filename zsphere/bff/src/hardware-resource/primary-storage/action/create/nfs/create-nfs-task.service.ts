import { Injectable, Inject } from '@nestjs/common'

import {
  AddNfsPrimaryStorageAction,
  AddNfsPrimaryStorageActionParam
} from '@/api/zstack/AddNfsPrimaryStorageAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { ActionTaskState, ActionTaskResult } from '@/common/model/action.model'

@Injectable()
export class CreateNFSPrimaryStorageTaskService extends FlowTaskBase {
  @Inject()
  private addNfsPrimaryStorageAction: AddNfsPrimaryStorageAction

  async action(task) {
    const apiId = task.taskId
    let payload: ActionTaskResult
    const param: AddNfsPrimaryStorageActionParam = task.input.param

    let result
    try {
      result = await this.addNfsPrimaryStorageAction.call(param, {
        actionId: task.input.info.actionId,
        taskId: task.input.info.taskId,
        apiId
      })
      payload = {
        sessionId: this.getSessionId(),
        actionId: task.input.info.actionId,
        state: ActionTaskState.success,
        type: 'PrimaryStorageVO',
        id: result.inventory.uuid,
        inventory: JSON.stringify(result.inventory)
      }
    } catch (error) {
      payload = {
        state: ActionTaskState.fail,
        sessionId: this.getSessionId(),
        actionId: task.input.info.actionId,
        error: JSON.stringify(error)
      }
      result = error
    }
    this.pubSubService.response(payload)
    return result
  }
}
