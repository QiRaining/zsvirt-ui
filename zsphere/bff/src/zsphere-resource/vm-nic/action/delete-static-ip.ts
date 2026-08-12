import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteVmStaticIpAction } from '@/api/zstack/DeleteVmStaticIpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { UpdateVmNetworkConfigService } from './sync-network-config'

@InputType()
export class DeleteVmStaticIpPayload {
  @Field(() => String, { description: '当前vm的uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  l3NetworkUuid: string
}

@InputType()
class DeleteVmStaticIpInput {
  @Field(() => DeleteVmStaticIpPayload)
  payload: DeleteVmStaticIpPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmStaticIpService extends ActionService {
  @Inject() DeleteVmStaticIpAction: DeleteVmStaticIpAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  deleteVmStaticIp(@Args('input') input: DeleteVmStaticIpInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmNic', async (payload: DeleteVmStaticIpPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: DeleteVmStaticIpPayload, taskId: string, actionId: string) {
    const res = await this.DeleteVmStaticIpAction.call(payload, {
      actionId,
      taskId
    })

    await this.updateVmNetworkConfigService.syncConfig(payload, {
      actionId,
      taskId
    })
    return {
      id: payload.vmInstanceUuid
    }
  }
}
