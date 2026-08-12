import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateVmNicDriverAction } from '@/api/zstack/UpdateVmNicDriverAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmNicDriverPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  vmNicUuid: string

  @Field(() => String)
  driverType: string
}

@InputType()
class UpdateVmNicDriverInput {
  @Field(() => UpdateVmNicDriverPayload)
  payload: UpdateVmNicDriverPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmNicDriverService extends ActionService {
  @Inject() updateVmNicDriverAction: UpdateVmNicDriverAction

  @Mutation(() => ActionResult)
  updateVmNicDriver(@Args('input') input: UpdateVmNicDriverInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmNic', async (payload: UpdateVmNicDriverPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: UpdateVmNicDriverPayload, taskId: string, actionId) {
    const res = await this.updateVmNicDriverAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: payload.vmNicUuid,
      fields: 'driverType',
      inventory: res.inventory
    }
  }
}
