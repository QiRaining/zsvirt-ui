import { Injectable, Inject } from '@nestjs/common'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class AttachVirtualRouterOfferingTaskService extends FlowTaskBase {
  @Inject()
  private createSystemTagAction: CreateSystemTagAction

  async action(task) {
    const apiId = task.taskId
    const param: AttachVirtualRouterOfferingTaskParam = task.input.param

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const createL3NetworkTask = rootTask.children[0].children.find(
      task => task.service === CreateL3NetworkTaskService.name
    )
    const l3NetworkUuid = createL3NetworkTask.result.inventory.uuid

    const _param = {
      resourceType: 'L3NetworkVO',
      resourceUuid: l3NetworkUuid,
      tag: `virtualRouterOffering::${param.virtualRouterOfferingUuid}`
    }

    const rt = await this.createSystemTagAction.call(_param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
    return rt
  }
}

export interface AttachVirtualRouterOfferingTaskParam {
  virtualRouterOfferingUuid: string
}
