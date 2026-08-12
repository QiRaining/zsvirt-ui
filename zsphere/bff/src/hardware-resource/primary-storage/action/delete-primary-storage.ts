import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeletePrimaryStorageAction } from '@/api/zstack/DeletePrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeletePrimaryStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeletePrimaryStorageListInput {
  @Field(() => [DeletePrimaryStoragePayload])
  payload: DeletePrimaryStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeletePrimaryStorageService extends ActionService {
  @Inject() deletePrimaryStorageAction: DeletePrimaryStorageAction

  @Mutation(() => ActionResult)
  deletePrimaryStorageList(@Args('input') input: DeletePrimaryStorageListInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: DeletePrimaryStoragePayload, taskId: string) => {
        const { uuid } = payload
        await this.deletePrimaryStorageAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid,
          inventory: {
            actionType: 'delete',
            id: payload.uuid
          }
        }
      }
    )
    return { actionId }
  }
}
