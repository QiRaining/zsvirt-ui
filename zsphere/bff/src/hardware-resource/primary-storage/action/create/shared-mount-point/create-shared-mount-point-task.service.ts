import { Injectable, Inject } from '@nestjs/common'

import {
  AddSharedMountPointPrimaryStorageAction,
  AddSharedMountPointPrimaryStorageActionParam
} from '@/api/zstack/AddSharedMountPointPrimaryStorageAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { ActionTaskState, ActionTaskResult } from '@/common/model/action.model'

@Injectable()
export class CreateSharedMountPointPrimaryStorageTaskService extends FlowTaskBase {
  @Inject()
  private addSharedMountPointPrimaryStorageAction: AddSharedMountPointPrimaryStorageAction

  async action(task) {
    const apiId = task.taskId
    let payload: ActionTaskResult
    const param: AddSharedMountPointPrimaryStorageActionParam = task.input.param

    let result
    try {
      result = await this.addSharedMountPointPrimaryStorageAction.call(param, {
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
