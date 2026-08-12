import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteLdapServerAction } from '@/api/zstack/DeleteLdapServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteThirdPartyAuthPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteThirdPartyAuthInput {
  @Field(() => [DeleteThirdPartyAuthPayload])
  payload: DeleteThirdPartyAuthPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteThirdPartyAuthService extends ActionService {
  @Inject() deleteLdapServerAction: DeleteLdapServerAction

  @Mutation(() => ActionResult)
  deleteThirdPartyAuths(@Args('input') input: DeleteThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ThirdPartyAuthVO',
      async (payload: DeleteThirdPartyAuthPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteLdapServerAction.call(
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
