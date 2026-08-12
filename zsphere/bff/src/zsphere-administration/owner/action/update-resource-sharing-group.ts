import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateResourceSharingGroupPayload {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => String, { nullable: true })
  permission?: string
}

@InputType()
class UpdateResourceSharingGroupInput {
  @Field(() => UpdateResourceSharingGroupPayload)
  payload: UpdateResourceSharingGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateResourceSharingGroupService extends ActionService {
  @Inject() shareAction: ShareResourceAction
  @Inject() revokeAction: RevokeResourceSharingAction

  @Mutation(() => ActionResult)
  updateResourceSharingGroup(@Args('input') input: UpdateResourceSharingGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Owner',
      async (payload: UpdateResourceSharingGroupPayload, taskId: string) => {
        const { resourceUuids } = payload
        await this.revokeAction.call(
          {
            resourceUuids,
            all: true
          },
          {
            actionId,
            taskId
          }
        )
        await this.shareAction.call(payload, {
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
