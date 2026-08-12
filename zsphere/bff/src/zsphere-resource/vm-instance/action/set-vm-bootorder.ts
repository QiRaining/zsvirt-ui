import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmBootOrderAction, SetVmBootOrderResult } from '@/api/zstack/SetVmBootOrderAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmBootOrderPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  bootOrder: string[]

  @Field(() => [String])
  systemTags: string[]
}

@InputType()
class SetVmBootOrderInput {
  @Field(() => [SetVmBootOrderPayload])
  payload: SetVmBootOrderPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmBootOrderService extends ActionService {
  @Inject() setVmBootOrderAction: SetVmBootOrderAction

  @Mutation(() => ActionResult)
  setVmBootOrder(@Args('input') input: SetVmBootOrderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmBootOrderPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: SetVmBootOrderPayload, taskId: string, actionId: string) {
    const { uuid, bootOrder, systemTags } = payload
    await this.setVmBootOrderAction.call({ uuid, bootOrder, systemTags }, { actionId, taskId })
    return {
      id: payload.uuid,
      fields: 'bootOrder,systemTag',
      inventory: {
        bootOrder: payload.bootOrder,
        systemTag: payload.systemTags
      }
    }
  }
}
