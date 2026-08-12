import { Injectable, Inject } from '@nestjs/common'

import {
  DeleteDataVolumeAction,
  DeleteDataVolumeActionParam as IDeleteDataVolumeActionParam
} from '@/api/zstack/DeleteDataVolumeAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class DeleteVolumeTaskService extends FlowTaskBase {
  @Inject() private deleteDataVolumeAction: DeleteDataVolumeAction

  async action(task) {
    const apiId = task.taskId
    const param: IDeleteDataVolumeActionParam = task.input.param
    return await this.deleteDataVolumeAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
