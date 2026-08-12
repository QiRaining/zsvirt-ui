import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateVmNicMacAction } from '@/api/zstack/UpdateVmNicMacAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmNicMacPayload {
  @Field(() => String, { description: '网卡Uuid' })
  vmNicUuid: string

  @Field(() => String, { description: 'mac地址' })
  mac: string
}

@InputType()
class UpdateVmNicMacInput {
  @Field(() => UpdateVmNicMacPayload)
  payload: UpdateVmNicMacPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmNicMacService extends ActionService {
  @Inject() updateVmNicMacAction: UpdateVmNicMacAction

  @Mutation(() => ActionResult)
  updateVmNicMac(@Args('input') input: UpdateVmNicMacInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmNic', async (payload: UpdateVmNicMacPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: UpdateVmNicMacPayload, taskId: string, actionId: string) {
    const res = await this.updateVmNicMacAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: res?.inventory?.uuid,
      fields: 'mac',
      inventory: res.inventory
    }
  }
}
