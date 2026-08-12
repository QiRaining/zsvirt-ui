import { Injectable, Inject } from '@nestjs/common'

import { AttachL3NetworkToVmAction } from '@/api/zstack/AttachL3NetworkToVmAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class AttachVpcRouterTaskService extends FlowTaskBase {
  @Inject()
  private attachVpcRouterAction: AttachL3NetworkToVmAction

  async action(task) {
    const apiId = task.taskId
    const param = task.input.param
    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const createL3NetworkTask = rootTask.children[0].children.find(
      task => task.service === CreateL3NetworkTaskService.name
    )
    const l3NetworkUuid = createL3NetworkTask.result.inventory.uuid
    param.l3NetworkUuid = l3NetworkUuid

    const rt = await this.attachVpcRouterAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
    return rt
  }
}

export interface AttachVpcRouterTaskParam {
  vmInstanceUuid: string
  driverType?: string
}
