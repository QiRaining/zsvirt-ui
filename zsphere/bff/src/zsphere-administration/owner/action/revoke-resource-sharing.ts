import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RevokeResourceSharingPayload {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => Boolean, { nullable: true })
  all?: boolean
}

@InputType()
export class RevokeResourceSharingInput {
  @Field(() => RevokeResourceSharingPayload)
  payload: RevokeResourceSharingPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class RevokeResourceSharingService extends ActionService {
  @Inject() revokeAction: RevokeResourceSharingAction

  @Mutation(() => ActionResult)
  revokeResourceSharing(@Args('input') input: RevokeResourceSharingInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Owner',
      async (payload: RevokeResourceSharingPayload, taskId: string) => {
        const { resourceUuids } = payload
        await this.revokeAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: resourceUuids[0]
        }
      }
    )
    return { actionId }
  }
}
