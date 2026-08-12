import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { flatten as _flatten, difference as _difference } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { RevokeResourceSharingToGroupAction } from '@/api/zstack/RevokeResourceSharingToGroupAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ShareResourceToGroupAction } from '@/api/zstack/ShareResourceToGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

@InputType()
class ZsvShareResourcePayload {
  @Field(() => [[String]])
  resourceUuids: string[][]

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => [String], { nullable: true })
  userGroupUuids?: string[]

  @Field(() => String, { nullable: true })
  prevShareType?: string
}

@InputType()
class ZsvShareResourceToGroupInput {
  @Field(() => ZsvShareResourcePayload)
  payload: ZsvShareResourcePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZsvShareResourceService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() shareResourceToGroupAction: ShareResourceToGroupAction
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction
  @Inject()
  revokeResourceSharingToGroupAction: RevokeResourceSharingToGroupAction

  @Mutation(() => ActionResult)
  zsvShareResource(@Args('input') input: ZsvShareResourceToGroupInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'Owner', async (payload: ZsvShareResourcePayload, taskId: string) => {
      const { resourceUuids, userGroupUuids, accountUuids, prevShareType } = payload
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
                      [ZOp.in]: _resourceUuids
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

      const addSharedFromGroupUuids = _difference(userGroupUuids, sharedFromGroupUuids)
      const removeSharedFromGroupUuids = _difference(sharedFromGroupUuids, userGroupUuids)

      const { results: results2 = [] } = await this.zqlService.call(
        ZQL.stringify({
          tableName: 'Account',
          fields: ['uuid'],
          condition: {
            name: {
              [ZOp.ne]: 'admin'
            },
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['accountUuid'],
                  condition: {
                    resourceUuid: {
                      [ZOp.in]: _resourceUuids
                    }
                  }
                }
              }
            }
          }
        })
      )
      const sharedFromAccountUuids = (results2[0]?.inventories ?? []).map(
        (inventory: any) => inventory.uuid
      )

      const addSharedFromAccountUuids = _difference(accountUuids, sharedFromAccountUuids)
      const removeSharedFromAccountUuids = _difference(sharedFromAccountUuids, accountUuids)

      if (_resourceUuids.length) {
        if (addSharedFromGroupUuids.length) {
          addSharedFromGroupUuids.forEach(userGroupUuid => {
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

        // 处理需要移除的用户组
        if (removeSharedFromGroupUuids.length) {
          removeSharedFromGroupUuids.forEach(userGroupUuid => {
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
        }

        if (prevShareType === 'Public') {
          await this.revokeResourceSharingAction.call(
            {
              resourceUuids: _resourceUuids,
              all: true
            },
            {
              actionId,
              taskId
            }
          )
          if (addSharedFromAccountUuids.length) {
            await this.shareResourceAction.call(
              {
                resourceUuids: _resourceUuids,
                accountUuids: addSharedFromAccountUuids
              },
              {
                actionId,
                taskId
              }
            )
          }
        } else {
          if (accountUuids.length) {
            await this.shareResourceAction.call(
              {
                resourceUuids: _resourceUuids,
                accountUuids: accountUuids
              },
              {
                actionId,
                taskId
              }
            )
          }

          // 处理需要移除的用户
          if (removeSharedFromAccountUuids.length) {
            await this.revokeResourceSharingAction.call(
              {
                resourceUuids: _resourceUuids,
                accountUuids: removeSharedFromAccountUuids
              },
              {
                actionId,
                taskId
              }
            )
          }
        }
      }

      await Promise.all(tasks)

      return {
        id: actionId
      }
    })
    return { actionId }
  }
}
