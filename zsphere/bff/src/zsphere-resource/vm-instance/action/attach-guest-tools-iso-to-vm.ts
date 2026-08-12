import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AttachGuestToolsIsoToVmAction } from '@/api/zstack/AttachGuestToolsIsoToVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachGuestToolsIsoToVmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class AttachGuestToolsIsoToVmInput {
  @Field(() => AttachGuestToolsIsoToVmPayload)
  payload: AttachGuestToolsIsoToVmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachGuestToolsIsoToVmService extends ActionService {
  @Inject() attachGuestToolsIsoToVmAction: AttachGuestToolsIsoToVmAction

  @Mutation(() => ActionResult)
  attachGuestToolsIsoToVm(@Args('input') input: AttachGuestToolsIsoToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'GuestToolsIso',
      async (payload: AttachGuestToolsIsoToVmPayload, taskId: string) => {
        await this.attachGuestToolsIsoToVmAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
