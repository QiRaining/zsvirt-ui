import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { RevokeResourceSharingToGroupAction } from '@/api/zstack/RevokeResourceSharingToGroupAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

@InputType()
class ShareResourcePayload {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => String, { nullable: true })
  permission?: string
}

@InputType()
export class ShareResourceInput {
  @Field(() => ShareResourcePayload)
  payload: ShareResourcePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ShareResourceService extends ActionService {
  @Inject() shareAction: ShareResourceAction
  @Inject() revokeAction: RevokeResourceSharingAction
  @Inject() zqlService: ZQLService
  @Inject()
  revokeResourceSharingToGroupAction: RevokeResourceSharingToGroupAction

  @Mutation(() => ActionResult)
  shareResource(@Args('input') input: ShareResourceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Owner', async (payload: ShareResourcePayload, taskId: string) => {
      const { resourceUuids, toPublic = false } = payload
      const _resourceUuids = _flatten(resourceUuids)
      const tasks = []

      const { results = [] } = await this.zqlService.call(
        ZQL.stringify({
          tableName: 'AccountGroup',
          fields: ['uuid'],
          condition: {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'AccountGroupResourceRef',
                  fields: ['groupUuid'],
                  condition: {
                    resourceUuid: {
                      [ZOp.in]: resourceUuids
                    }
                  }
                }
              }
            }
          }
        })
      )
      const sharedFromGroupUuids = (results[0]?.inventories ?? []).map(
        (inventory: any) => inventory.uuid
      )

      sharedFromGroupUuids.forEach(userGroupUuid => {
        tasks.push(
          this.revokeResourceSharingToGroupAction.call(
            { resourceUuids: _resourceUuids, groupUuid: userGroupUuid },
            {
              actionId,
              taskId
            }
          )
        )
      })

      if (toPublic) {
        // 全局共享前先全部召回
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
        await Promise.all(tasks)
      }
      await this.shareAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: resourceUuids[0]
      }
    })
    return { actionId }
  }
}
