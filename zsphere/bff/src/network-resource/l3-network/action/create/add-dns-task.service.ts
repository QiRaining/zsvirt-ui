import { Injectable, Inject } from '@nestjs/common'

import {
  AddDnsToL3NetworkAction,
  AddDnsToL3NetworkActionParam
} from '@/api/zstack/AddDnsToL3NetworkAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class AddDnsTaskService extends FlowTaskBase {
  @Inject()
  private addDnsToL3NetworkAction: AddDnsToL3NetworkAction

  async action(task) {
    const apiId = task.taskId
    const param: AddDnsToL3NetworkActionParam = task.input.param
    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const createL3NetworkTask = rootTask.children[0].children.find(
      task => task.service === CreateL3NetworkTaskService.name
    )
    const l3NetworkUuid = createL3NetworkTask.result.inventory.uuid
    param.l3NetworkUuid = l3NetworkUuid

    const rt = await this.addDnsToL3NetworkAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
    return rt
  }
}

export interface AddDnsTaskParam {
  dns: string
}
