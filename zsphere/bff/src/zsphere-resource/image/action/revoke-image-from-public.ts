import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RevokeImageFromPublicPayload {
  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
class RevokeImageFromPublicInput {
  @Field(() => [RevokeImageFromPublicPayload])
  payload: RevokeImageFromPublicPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RevokeImageFromPublicService extends ActionService {
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction

  @Mutation(() => ActionResult)
  revokeImageFromPublic(@Args('input') input: RevokeImageFromPublicInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Image',
      async (payload: RevokeImageFromPublicPayload, taskId: string) => {
        await this.revokeResourceSharingAction.call(
          {
            ...payload,
            toPublic: true,
            all: true
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
