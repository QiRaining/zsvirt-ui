import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteImageAction } from '@/api/zstack/DeleteImageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteImagePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteImageInput {
  @Field(() => [DeleteImagePayload])
  payload: DeleteImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteImageService extends ActionService {
  @Inject() deleteImageAction: DeleteImageAction

  @Mutation(() => ActionResult)
  deleteImage(@Args('input') input: DeleteImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: DeleteImagePayload, taskId: string) => {
      const { uuid } = payload
      await this.deleteImageAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        inventory: {
          actionType: 'delete',
          id: payload.uuid
        }
      }
    })
    return { actionId }
  }
}
