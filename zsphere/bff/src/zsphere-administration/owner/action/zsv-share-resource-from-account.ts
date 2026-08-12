import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { RevokeResourceSharingToGroupAction } from '@/api/zstack/RevokeResourceSharingToGroupAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ShareResourceToGroupAction } from '@/api/zstack/ShareResourceToGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ZsvShareResourceFromAccountPayload {
  @Field(() => [[String]])
  resourceUuids: string[][]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => [String], { nullable: true })
  userGroupUuids?: string[]
}

@InputType()
class ZsvShareResourceFromAccountInput {
  @Field(() => ZsvShareResourceFromAccountPayload)
  payload: ZsvShareResourceFromAccountPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZsvShareResourceFromAccountService extends ActionService {
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() shareResourceToGroupAction: ShareResourceToGroupAction
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction
  @Inject()
  revokeResourceSharingToGroupAction: RevokeResourceSharingToGroupAction

  @Mutation(() => ActionResult)
  zsvShareResourceFromAccount(@Args('input') input: ZsvShareResourceFromAccountInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Owner',
      async (payload: ZsvShareResourceFromAccountPayload, taskId: string) => {
        const { resourceUuids, userGroupUuids, accountUuids } = payload

        const _resourceUuids = _flatten(resourceUuids)
        const tasks = []

        if (_resourceUuids.length) {
          if (userGroupUuids) {
            userGroupUuids.forEach(userGroupUuid => {
              tasks.push(
                this.shareResourceToGroupAction.call(
                  { resourceUuids: _resourceUuids, groupUuid: userGroupUuid },
                  {
                    actionId,
                    taskId
                  }
                )
              )
            })
          }
          if (accountUuids) {
            await this.shareResourceAction.call(
              { accountUuids, resourceUuids: _resourceUuids },
              {
                actionId,
                taskId
              }
            )
          }
        }

        await Promise.all(tasks)

        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
