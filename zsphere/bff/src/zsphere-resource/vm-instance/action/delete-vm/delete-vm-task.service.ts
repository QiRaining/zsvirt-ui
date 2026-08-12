import { Injectable, Inject } from '@nestjs/common'

import {
  DestroyVmInstanceAction,
  DestroyVmInstanceActionParam as IDestroyVmInstanceActionParam
} from '@/api/zstack/DestroyVmInstanceAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class DeleteVmInstanceTaskService extends FlowTaskBase {
  @Inject() private destroyVmInstanceAction: DestroyVmInstanceAction

  async action(task) {
    const apiId = task.taskId
    const param: IDestroyVmInstanceActionParam = task.input.param
    return await this.destroyVmInstanceAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
