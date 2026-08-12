import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ShareImageToPublicPayload {
  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
class ShareImageToPublicInput {
  @Field(() => [ShareImageToPublicPayload])
  payload: ShareImageToPublicPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ShareImageToPublicService extends ActionService {
  @Inject() shareResourceAction: ShareResourceAction

  @Mutation(() => ActionResult)
  shareImageToPublic(@Args('input') input: ShareImageToPublicInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Image',
      async (payload: ShareImageToPublicPayload, taskId: string) => {
        await this.shareResourceAction.call(
          {
            ...payload,
            toPublic: true
          },
          { actionId, taskId }
        )
        return {
          id: payload?.[0]?.uuid
        }
      }
    )
    return { actionId }
  }
}
