import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteResourceAttributeKeyAction } from '@/api/zstack/DeleteResourceAttributeKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteResourceAttributeKeyPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteResourceAttributeKeyInput {
  @Field(() => [DeleteResourceAttributeKeyPayload])
  payload: DeleteResourceAttributeKeyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteResourceAttributeKeyService extends ActionService {
  @Inject()
  private deleteResourceAttributeKeyAction: DeleteResourceAttributeKeyAction

  @Mutation(() => ActionResult)
  deleteResourceAttributeKey(@Args('input') input: DeleteResourceAttributeKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceAttributeKey',
      async (payload: DeleteResourceAttributeKeyPayload, taskId: string) => {
        await this.deleteResourceAttributeKeyAction.call(payload, {
          actionId,
          taskId
        })
        return { id: payload.uuid }
      },
      { listenerType: 'DeleteResourceAttributeKey' }
    )
    return { actionId }
  }
}
