import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteAccountAction } from '@/api/zstack/DeleteAccountAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteAccountPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteAccountInput {
  @Field(() => [DeleteAccountPayload])
  payload: DeleteAccountPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteAccountService extends ActionService {
  @Inject() deleteAccountAction: DeleteAccountAction

  @Mutation(() => ActionResult)
  deleteAccounts(@Args('input') input: DeleteAccountInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'AccountVO', async (payload: DeleteAccountPayload, taskId: string) => {
      const { uuid } = payload
      await this.deleteAccountAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
