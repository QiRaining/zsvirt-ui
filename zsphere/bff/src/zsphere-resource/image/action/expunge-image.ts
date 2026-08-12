import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ExpungeImageAction } from '@/api/zstack/ExpungeImageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExpungeImagePayload {
  @Field(() => String)
  imageUuid: string

  @Field(() => [String])
  backupStorageUuids: string[]
}

@InputType()
class ExpungeImageInput {
  @Field(() => [ExpungeImagePayload])
  payload: ExpungeImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExpungeImageService extends ActionService {
  @Inject() expungeImageAction: ExpungeImageAction

  @Mutation(() => ActionResult)
  expungeImage(@Args('input') input: ExpungeImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: ExpungeImagePayload, taskId: string) => {
      const { imageUuid, backupStorageUuids } = payload
      await this.expungeImageAction.call(
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
