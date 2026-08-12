import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RemoveAccountFromGroupAction } from '@/api/zstack/RemoveAccountFromGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveUsersPayload {
  @Field(() => [String])
  accountUuids: string[]

  @Field(() => [String])
  userGroupUuids: string[]
}

@InputType()
class RemoveUsersInput {
  @Field(() => [RemoveUsersPayload])
  payload: RemoveUsersPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveUsersService extends ActionService {
  @Inject() removeAccountFromGroupAction: RemoveAccountFromGroupAction

  @Mutation(() => ActionResult)
  removeUsers(@Args('input') input: RemoveUsersInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: RemoveUsersPayload, taskId: string) => {
      const { userGroupUuids, accountUuids } = payload

      const task = []

      if (userGroupUuids.length) {
        userGroupUuids.map(userGroupUuid => {
          task.push(
            this.removeAccountFromGroupAction.call(
              {
                accountUuids,
                groupUuid: userGroupUuid
              },
              {
                actionId,
                taskId
              }
            )
          )
        })
      }

      await Promise.all(task)

      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
