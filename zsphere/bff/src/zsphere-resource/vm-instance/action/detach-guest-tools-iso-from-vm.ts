import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DetachGuestToolsIsoFromVmAction } from '@/api/zstack/DetachGuestToolsIsoFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachGuestToolsIsoFromVmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DetachGuestToolsIsoFromVmInput {
  @Field(() => DetachGuestToolsIsoFromVmPayload)
  payload: DetachGuestToolsIsoFromVmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachGuestToolsIsoFromVmService extends ActionService {
  @Inject() detachGuestToolsIsoFromVmAction: DetachGuestToolsIsoFromVmAction

  @Mutation(() => ActionResult)
  detachGuestToolsIsoFromVm(@Args('input') input: DetachGuestToolsIsoFromVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'GuestToolsIso',
      async (payload: DetachGuestToolsIsoFromVmPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: DetachGuestToolsIsoFromVmPayload, taskId: string, actionId: string) {
    await this.detachGuestToolsIsoFromVmAction.call({ ...payload }, { actionId, taskId })
    return {
      id: payload.uuid
    }
  }
}
