import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { AddAccountToGroupAction } from '@/api/zstack/AddAccountToGroupAction'
import { AttachRoleToAccountAction } from '@/api/zstack/AttachRoleToAccountAction'
import { DetachRoleFromAccountAction } from '@/api/zstack/DetachRoleFromAccountAction'
import { RemoveAccountFromGroupAction } from '@/api/zstack/RemoveAccountFromGroupAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { UpdateAccountAction } from '@/api/zstack/UpdateAccountAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAccountConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  removeUserGroupUuids?: string[]

  @Field(() => [String], { nullable: true })
  addUserGroupUuids?: string[]

  @Field(() => [String], { nullable: true })
  removeRoleUuids?: string[]

  @Field(() => [String], { nullable: true })
  addRoleUuids?: string[]

  @Field(() => [[String]], { nullable: true })
  removeResourceUuids?: string[][]

  @Field(() => [[String]], { nullable: true })
  addResourceUuids?: string[][]
}

@InputType()
class UpdateAccountConfigInput {
  @Field(() => [UpdateAccountConfigPayload])
  payload: UpdateAccountConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAccountConfigService extends ActionService {
  @Inject() updateAccountAction: UpdateAccountAction
  @Inject() addAccountToGroupAction: AddAccountToGroupAction
  @Inject() removeAccountFromGroupAction: RemoveAccountFromGroupAction
  @Inject() attachRoleToAccountAction: AttachRoleToAccountAction
  @Inject() detachRoleFromAccountAction: DetachRoleFromAccountAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction

  @Mutation(() => ActionResult)
  updateAccountConfig(@Args('input') input: UpdateAccountConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccountVO',
      async (payload: UpdateAccountConfigPayload, taskId: string) => {
        const {
          uuid: accountUuid,
          name,
          description,
          addUserGroupUuids,
          removeUserGroupUuids,
          addRoleUuids,
          removeRoleUuids,
          addResourceUuids,
          removeResourceUuids
        } = payload

        // 更新账户基本信息
        await this.updateAccountAction.call(
          { uuid: accountUuid, name, description },
          { actionId, taskId }
        )

        const tasks = []

        // 处理用户组
        if (addUserGroupUuids?.length) {
          addUserGroupUuids.forEach(groupUuid => {
            tasks.push(
              this.addAccountToGroupAction.call(
                { accountUuids: [accountUuid], groupUuid },
                { actionId, taskId }
              )
            )
          })
        }

        if (removeUserGroupUuids?.length) {
          removeUserGroupUuids.forEach(groupUuid => {
            tasks.push(
              this.removeAccountFromGroupAction.call(
                { accountUuids: [accountUuid], groupUuid },
                { actionId, taskId }
              )
            )
          })
        }

        // 处理角色
        if (addRoleUuids?.length) {
          addRoleUuids.forEach(roleUuid => {
            tasks.push(
              this.attachRoleToAccountAction.call({ roleUuid, accountUuid }, { actionId, taskId })
            )
          })
        }

        if (removeRoleUuids?.length) {
          removeRoleUuids.forEach(roleUuid => {
            tasks.push(
              this.detachRoleFromAccountAction.call({ roleUuid, accountUuid }, { actionId, taskId })
            )
          })
        }

        // 处理资源
        if (addResourceUuids?.length) {
          const flattenedAddResources = _flatten(addResourceUuids)
          if (flattenedAddResources.length > 0) {
            tasks.push(
              this.shareResourceAction.call(
                {
                  accountUuids: [accountUuid],
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
              this.revokeResourceSharingAction.call(
                {
                  accountUuids: [accountUuid],
                  resourceUuids: flattenedRemoveResources
                },
                { actionId, taskId }
              )
            )
          }
        }

        await Promise.all(tasks)

        return { id: accountUuid }
      }
    )
    return { actionId }
  }
}
