import { Injectable, Inject } from '@nestjs/common'

import {
  AttachIscsiServerToClusterAction,
  AttachIscsiServerToClusterActionParam
} from '@/api/zstack/AttachIscsiServerToClusterAction'
import { FlowTaskBase } from '@/base/flow-task-base'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'

@Injectable()
export class AttachIscsiServerToClusterTaskService extends FlowTaskBase {
  name = AttachIscsiServerToClusterTaskService.name
  @Inject() declare flowInstanceService: FlowInstanceService
  @Inject()
  declare attachIscsiServerToClusterAction: AttachIscsiServerToClusterAction

  async action(task): Promise<any> {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    const parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)
    const prevTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)
    const clusterUuid = task.input.param.clusterUuid
    const uuid = prevTask.result.inventory.uuid
    const param: AttachIscsiServerToClusterActionParam = {
      clusterUuid,
      uuid
    }

    return await this.attachIscsiServerToClusterAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
