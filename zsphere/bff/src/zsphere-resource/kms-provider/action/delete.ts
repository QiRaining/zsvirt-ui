import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteKmsAction } from '@/api/zstack/DeleteKmsAction'
import { DeleteNkpAction } from '@/api/zstack/DeleteNkpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteKmsProviderPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => String)
  type!: string
}

@InputType()
class DeleteKmsProviderInput {
  @Field(() => [DeleteKmsProviderPayload])
  payload!: DeleteKmsProviderPayload[]

  @Field(() => ActionInput)
  action!: ActionInput
}

export class DeleteKmsProviderService extends ActionService {
  @Inject() deleteKmsAction!: DeleteKmsAction
  @Inject() deleteNkpAction!: DeleteNkpAction

  @Mutation(() => ActionResult)
  deleteKmsProvider(@Args('input') input: DeleteKmsProviderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: DeleteKmsProviderPayload, taskId: string) => {
        const { uuid, type } = payload
        if (type === 'NKP') {
          await this.deleteNkpAction.call({ uuid }, { actionId, taskId })
        } else {
          await this.deleteKmsAction.call({ uuid }, { actionId, taskId })
        }
        return { id: payload.uuid }
      },
      { listenerType: 'DeleteKmsProvider' }
    )
    return { actionId }
  }
}
