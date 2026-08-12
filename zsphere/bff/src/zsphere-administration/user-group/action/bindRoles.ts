import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AttachRoleToAccountAction } from '@/api/zstack/AttachRoleToAccountAction'
import { AttachRoleToAccountGroupAction } from '@/api/zstack/AttachRoleToAccountGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class BindRolesPayload {
  @Field(() => [String])
  roleUuids: string[]

  @Field(() => [String], { nullable: true })
  resourceUuids?: string[]

  @Field(() => String, { nullable: true })
  resourceType: string
}

@InputType()
class BindRolesInput {
  @Field(() => BindRolesPayload)
  payload: BindRolesPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class BindRolesService extends ActionService {
  @Inject() attachRoleToAccountGroupAction: AttachRoleToAccountGroupAction
  @Inject() attachRoleToAccountAction: AttachRoleToAccountAction

  @Mutation(() => ActionResult)
  bindRoles(@Args('input') input: BindRolesInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: BindRolesPayload, taskId: string) => {
      const { roleUuids, resourceType, resourceUuids } = payload

      const tasks = []

      if (resourceUuids.length && roleUuids.length) {
        resourceUuids.forEach(resourceUuid => {
          roleUuids.forEach(roleUuid => {
            if (resourceType === 'Account') {
              tasks.push(
                this.attachRoleToAccountAction.call(
                  {
                    roleUuid,
                    accountUuid: resourceUuid
                  },
                  {
                    actionId,
                    taskId
                  }
                )
              )
            } else if (resourceType === 'UserGroup') {
              tasks.push(
                this.attachRoleToAccountGroupAction.call(
                  {
                    roleUuids: [roleUuid],
                    groupUuid: resourceUuid
                  },
                  {
                    actionId,
                    taskId
                  }
                )
              )
            }
          })
        })
      }

      await Promise.all(tasks)

      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
