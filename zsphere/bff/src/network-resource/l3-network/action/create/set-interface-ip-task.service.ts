import { Injectable, Inject } from '@nestjs/common'

import {
  SetL3NetworkRouterInterfaceIpAction,
  SetL3NetworkRouterInterfaceIpActionParam
} from '@/api/zstack/SetL3NetworkRouterInterfaceIpAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class SetInterfaceIpTaskService extends FlowTaskBase {
  @Inject()
  private setL3NetworkRouterInterfaceIpAction: SetL3NetworkRouterInterfaceIpAction

  async action(task) {
    const apiId = task.taskId
    const param: SetL3NetworkRouterInterfaceIpActionParam = task.input.param
    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const createL3NetworkTask = rootTask.children[0].children.find(
      task => task.service === CreateL3NetworkTaskService.name
    )
    const l3NetworkUuid = createL3NetworkTask.result.inventory.uuid
    param.l3NetworkUuid = l3NetworkUuid

    const rt = await this.setL3NetworkRouterInterfaceIpAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
    return rt
  }
}

export interface SetL3NetworkRouterInterfaceIpTaskParam extends SetL3NetworkRouterInterfaceIpActionParam {}
