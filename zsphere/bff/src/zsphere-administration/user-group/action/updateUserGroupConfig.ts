import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { AddAccountToGroupAction } from '@/api/zstack/AddAccountToGroupAction'
import { AttachRoleToAccountGroupAction } from '@/api/zstack/AttachRoleToAccountGroupAction'
import { DetachRoleFromAccountGroupAction } from '@/api/zstack/DetachRoleFromAccountGroupAction'
import { RemoveAccountFromGroupAction } from '@/api/zstack/RemoveAccountFromGroupAction'
import { RevokeResourceSharingToGroupAction } from '@/api/zstack/RevokeResourceSharingToGroupAction'
import { ShareResourceToGroupAction } from '@/api/zstack/ShareResourceToGroupAction'
import { UpdateAccountGroupAction } from '@/api/zstack/UpdateAccountGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateUserGroupConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  addAccountUuids?: string[]

  @Field(() => [String], { nullable: true })
  removeAccountUuids?: string[]

  @Field(() => [String], { nullable: true })
  addRoleUuids?: string[]

  @Field(() => [String], { nullable: true })
  removeRoleUuids?: string[]

  @Field(() => [[String]], { nullable: true })
  addResourceUuids?: string[][]

  @Field(() => [[String]], { nullable: true })
  removeResourceUuids?: string[][]
}

@InputType()
class UpdateUserGroupConfigInput {
  @Field(() => UpdateUserGroupConfigPayload)
  payload: UpdateUserGroupConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateUserGroupConfigService extends ActionService {
  @Inject() updateAccountGroupAction: UpdateAccountGroupAction
  @Inject() addAccountToGroupAction: AddAccountToGroupAction
  @Inject() removeAccountFromGroupAction: RemoveAccountFromGroupAction
  @Inject() attachRoleToAccountGroupAction: AttachRoleToAccountGroupAction
  @Inject() detachRoleFromAccountGroupAction: DetachRoleFromAccountGroupAction
  @Inject() shareResourceToGroupAction: ShareResourceToGroupAction
  @Inject()
  revokeResourceSharingToGroupAction: RevokeResourceSharingToGroupAction

  @Mutation(() => ActionResult)
  updateUserGroupConfig(@Args('input') input: UpdateUserGroupConfigInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateUserGroupConfigPayload, taskId: string) => {
      const {
        uuid: groupUuid,
        name,
        description,
        addAccountUuids,
        removeAccountUuids,
        addRoleUuids,
        removeRoleUuids,
        addResourceUuids,
        removeResourceUuids
      } = payload

      // 更新用户组基本信息
      await this.updateAccountGroupAction.call(
        {
          uuid: groupUuid,
          name,
          description
        },
        { actionId, taskId }
      )

      const tasks = []

      // 处理账户
      if (addAccountUuids?.length) {
        tasks.push(
          this.addAccountToGroupAction.call(
            {
              accountUuids: addAccountUuids,
              groupUuid
            },
            { actionId, taskId }
          )
        )
      }

      if (removeAccountUuids?.length) {
        tasks.push(
          this.removeAccountFromGroupAction.call(
            {
              accountUuids: removeAccountUuids,
              groupUuid
            },
            { actionId, taskId }
          )
        )
      }

      // 处理角色
      if (addRoleUuids?.length) {
        tasks.push(
          this.attachRoleToAccountGroupAction.call(
            {
              roleUuids: addRoleUuids,
              groupUuid
            },
            { actionId, taskId }
          )
        )
      }

      if (removeRoleUuids?.length) {
        tasks.push(
          this.detachRoleFromAccountGroupAction.call(
            {
              roleUuids: removeRoleUuids,
              groupUuid
            },
            { actionId, taskId }
          )
        )
      }

      // 处理资源
      if (addResourceUuids?.length) {
        const flattenedAddResources = _flatten(addResourceUuids)
        if (flattenedAddResources.length > 0) {
          tasks.push(
            this.shareResourceToGroupAction.call(
              {
                groupUuid,
                resourceUuids: flattenedAddResources
              },
              { actionId, taskId }
            )
          )
        }
      }

      if (removeResourceUuids?.length) {
        const flattenedRemoveResources = _flatten(removeResourceUuids)
        if (flattenedRemoveResources.length > 0) {
          tasks.push(
            this.revokeResourceSharingToGroupAction.call(
              {
                groupUuid,
                resourceUuids: flattenedRemoveResources
              },
              { actionId, taskId }
            )
          )
        }
      }

      await Promise.all(tasks)

      return {
        id: groupUuid
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
