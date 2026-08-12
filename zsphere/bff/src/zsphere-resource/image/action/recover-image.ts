import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RecoverImageAction } from '@/api/zstack/RecoverImageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RecoverImagePayload {
  @Field(() => String)
  imageUuid: string

  @Field(() => [String])
  backupStorageUuids: string[]
}

@InputType()
class RecoverImageInput {
  @Field(() => [RecoverImagePayload])
  payload: RecoverImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RecoverImageService extends ActionService {
  @Inject() recoverImageAction: RecoverImageAction

  @Mutation(() => ActionResult)
  recoverImage(@Args('input') input: RecoverImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: RecoverImagePayload, taskId: string) => {
      const { imageUuid, backupStorageUuids } = payload
      await this.recoverImageAction.call(
        {
          imageUuid,
          backupStorageUuids
        },
        { actionId, taskId }
      )
      return {
        id: payload.imageUuid
      }
    })
    return { actionId }
  }
}
