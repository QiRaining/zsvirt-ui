import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { RevokeResourceSharingToGroupAction } from '@/api/zstack/RevokeResourceSharingToGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ZsvRevokeResourceSharingPayload {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => [String], { nullable: true })
  userGroupUuids?: string[]

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => Boolean, { nullable: true })
  all?: boolean
}

@InputType()
export class ZsvRevokeResourceSharingInput {
  @Field(() => ZsvRevokeResourceSharingPayload)
  payload: ZsvRevokeResourceSharingPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZsvRevokeResourceSharingService extends ActionService {
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction
  @Inject()
  revokeResourceSharingToGroupAction: RevokeResourceSharingToGroupAction

  @Mutation(() => ActionResult)
  zsvRevokeResourceSharing(@Args('input') input: ZsvRevokeResourceSharingInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Owner',
      async (payload: ZsvRevokeResourceSharingPayload, taskId: string) => {
        const { resourceUuids, userGroupUuids, accountUuids } = payload

        const tasks = []

        if (resourceUuids) {
          if (userGroupUuids) {
            userGroupUuids.forEach(userGroupUuid => {
              tasks.push(
                this.revokeResourceSharingToGroupAction.call(
                  {
                    groupUuid: userGroupUuid,
                    resourceUuids
                  },
                  {
                    actionId,
                    taskId
                  }
                )
              )
            })
          }
          if (accountUuids) {
            await this.revokeResourceSharingAction.call(
              {
                accountUuids,
                resourceUuids
              },
              {
                actionId,
                taskId
              }
            )
          }
        }

        await Promise.all(tasks)

        return {
          id: resourceUuids[0]
        }
      }
    )
    return { actionId }
  }
}
