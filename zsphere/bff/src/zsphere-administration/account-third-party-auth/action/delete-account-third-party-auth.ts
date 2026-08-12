import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSSOClientAction } from '@/api/zstack/DeleteSSOClientAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteAccountThirdPartyAuthPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteAccountThirdPartyAuthInput {
  @Field(() => [DeleteAccountThirdPartyAuthPayload])
  payload: DeleteAccountThirdPartyAuthPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteAccountThirdPartyAuthService extends ActionService {
  @Inject() deleteSSOClientAction: DeleteSSOClientAction

  @Mutation(() => ActionResult)
  deleteAccountThirdPartyAuth(@Args('input') input: DeleteAccountThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SSOThirdPartyAuthVO',
      async (payload: DeleteAccountThirdPartyAuthPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteSSOClientAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
