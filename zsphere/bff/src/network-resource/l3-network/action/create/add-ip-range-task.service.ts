import { Injectable, Inject } from '@nestjs/common'

import { AddIpRangeAction, AddIpRangeActionParam } from '@/api/zstack/AddIpRangeAction'
import {
  AddIpRangeByNetworkCidrAction,
  AddIpRangeByNetworkCidrActionParam
} from '@/api/zstack/AddIpRangeByNetworkCidrAction'
import { AddIpv6RangeAction, AddIpv6RangeActionParam } from '@/api/zstack/AddIpv6RangeAction'
import {
  AddIpv6RangeByNetworkCidrAction,
  AddIpv6RangeByNetworkCidrActionParam
} from '@/api/zstack/AddIpv6RangeByNetworkCidrAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class AddIpRangeTaskService extends FlowTaskBase {
  @Inject() private addIpRangeAction: AddIpRangeAction
  @Inject()
  private addIpRangeByNetworkCidrAction: AddIpRangeByNetworkCidrAction
  @Inject() private addIpv6RangeAction: AddIpv6RangeAction
  @Inject()
  private addIpv6RangeByNetworkCidrAction: AddIpv6RangeByNetworkCidrAction

  async action(task) {
    const apiId = task.taskId
    const param: AddIpRangeTaskParam = task.input.param
    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const createL3NetworkTask = rootTask.children[0].children.find(
      task => task.service === CreateL3NetworkTaskService.name
    )
    const l3NetworkUuid = createL3NetworkTask.result.inventory.uuid

    const rt = await this._addIpRange(
      param,
      {
        actionId: task.input.info.actionId,
        taskId: task.input.info.taskId,
        apiId
      },
      l3NetworkUuid
    )

    return rt
  }

  _addIpRange = async (input: Partial<IAddIpRange>, apiId, l3NetworkUuid) => {
    const { ipVersion, dhcpIp, ...resInput } = input
    const { networkCidr } = resInput
    resInput.l3NetworkUuid = l3NetworkUuid
    if (dhcpIp) {
      resInput.systemTags = [`flatNetwork::DhcpServer::${dhcpIp.replace('::', '--')}::ipUuid::null`]
    }
    if (ipVersion === 4) {
      return networkCidr
        ? this.addIpRangeByNetworkCidrAction.call(
            resInput as AddIpRangeByNetworkCidrActionParam,
            apiId
          )
        : this.addIpRangeAction.call(resInput as AddIpRangeActionParam, apiId)
    } else {
      return networkCidr
        ? this.addIpv6RangeByNetworkCidrAction.call(
            resInput as AddIpv6RangeByNetworkCidrActionParam,
            apiId
          )
        : this.addIpv6RangeAction.call(resInput as AddIpv6RangeActionParam, apiId)
    }
  }
}

type IAddIpRange = (AddIpRangeActionParam &
  AddIpRangeByNetworkCidrActionParam &
  AddIpv6RangeActionParam &
  AddIpv6RangeByNetworkCidrActionParam) & {
  ipVersion: 4 | 6 | 46
  dhcpIp?: string
}

export interface AddIpRangeTaskParam extends IAddIpRange {}
