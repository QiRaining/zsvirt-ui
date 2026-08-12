import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { AddAccountToGroupAction } from '@/api/zstack/AddAccountToGroupAction'
import { AttachRoleToAccountGroupAction } from '@/api/zstack/AttachRoleToAccountGroupAction'
import { CreateAccountGroupAction } from '@/api/zstack/CreateAccountGroupAction'
import { ShareResourceToGroupAction } from '@/api/zstack/ShareResourceToGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateUserGroupPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  accountUuids?: string[]

  @Field(() => [String], { nullable: true })
  roleUuids?: string[]

  @Field(() => [[String]], { nullable: true })
  resourceUuids?: string[][]
}

@InputType()
class CreateUserGroupInput {
  @Field(() => CreateUserGroupPayload)
  payload: CreateUserGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateUserGroupService extends ActionService {
  @Inject() createAccountGroupAction: CreateAccountGroupAction
  @Inject() addAccountToGroupAction: AddAccountToGroupAction
  @Inject() attachRoleToAccountGroupAction: AttachRoleToAccountGroupAction
  @Inject() shareResourceToGroupAction: ShareResourceToGroupAction

  @Mutation(() => ActionResult)
  createUserGroup(@Args('input') input: CreateUserGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateUserGroupPayload, taskId: string) => {
      const { name, description, accountUuids, roleUuids, resourceUuids } = payload

      const { inventory } = await this.createAccountGroupAction.call(
        {
          name,
          description
        },
        {
          actionId,
          taskId
        }
      )

      const groupUuid = inventory.uuid

      if (groupUuid) {
        // 用户->组
        const tasks = []
        if (accountUuids?.length) {
          this.addAccountToGroupAction.call({
            accountUuids,
            groupUuid
          })
        }
        // 角色->组
        if (roleUuids?.length) {
          this.attachRoleToAccountGroupAction.call({
            roleUuids,
            groupUuid
          })
        }
        // 资源共享
        if (_flatten(resourceUuids)?.length) {
          tasks.push(
            this.shareResourceToGroupAction.call({
              groupUuid,
              resourceUuids: _flatten(resourceUuids)
            })
          )
        }

        await Promise.all(tasks)
      }

      return {
        id: inventory.uuid,
        inventory
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
