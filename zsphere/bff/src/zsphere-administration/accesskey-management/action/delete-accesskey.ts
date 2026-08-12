import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteAccessKeyAction } from '@/api/zstack/DeleteAccessKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteAccessKeyPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteAccessKeyInput {
  @Field(() => [DeleteAccessKeyPayload])
  payload: DeleteAccessKeyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteAccessKeyService extends ActionService {
  @Inject() deleteAccessKeyAction: DeleteAccessKeyAction

  @Mutation(() => ActionResult)
  deleteAccessKey(@Args('input') input: DeleteAccessKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccessKey',
      async (payload: DeleteAccessKeyPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteAccessKeyAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
