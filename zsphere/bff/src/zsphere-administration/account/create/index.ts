import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { flatten as _flatten } from 'lodash'

import { AddAccountToGroupAction } from '@/api/zstack/AddAccountToGroupAction'
import { AttachRoleToAccountAction } from '@/api/zstack/AttachRoleToAccountAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateAccountAction } from '@/api/zstack/CreateAccountAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { AccountType } from '../account.model'

@InputType()
class CreateAccountPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  password: string

  @Field(() => AccountType)
  type: AccountType

  @Field(() => [String], { nullable: true })
  userGroupUuids?: string[]

  @Field(() => [String], { nullable: true })
  roleUuids?: string[]

  @Field(() => [[String]], { nullable: true })
  resourceUuids?: string[][]
}

@InputType()
class CreateAccountInput {
  @Field(() => [CreateAccountPayload])
  payload: CreateAccountPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateAccountService extends ActionService {
  @Inject()
  createAccountAction: CreateAccountAction
  @Inject() addAccountToGroupAction: AddAccountToGroupAction
  @Inject() attachRoleToAccountAction: AttachRoleToAccountAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  createAccount(@Args('input') input: CreateAccountInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'AccountVO', async (payload: CreateAccountPayload, taskId: string) => {
      const { name, description, password, type, userGroupUuids, roleUuids, resourceUuids } =
        payload

      const { inventory } = await this.createAccountAction.call(
        {
          name,
          description,
          password,
          type
        },
        { actionId, taskId }
      )

      const accountUuid = inventory.uuid

      if (accountUuid) {
        // 用户->组
        const tasks = []
        if (userGroupUuids?.length) {
          userGroupUuids?.map(userGroupUuid => {
            tasks.push(
              this.addAccountToGroupAction.call({
                accountUuids: [accountUuid],
                groupUuid: userGroupUuid
              })
            )
          })
        }

        // 角色->用户
        if (roleUuids?.length) {
          roleUuids?.map(roleUuid => {
            tasks.push(
              this.attachRoleToAccountAction.call({
                roleUuid,
                accountUuid
              })
            )
          })
        }
        // 资源共享
        if (_flatten(resourceUuids)?.length) {
          tasks.push(
            this.shareResourceAction.call({
              accountUuids: [accountUuid],
              resourceUuids: _flatten(resourceUuids)
            })
          )
        }

        await Promise.all(tasks)
      }

      return {
        id: actionId
      }
    })
    return { actionId }
  }
}
