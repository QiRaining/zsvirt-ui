import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddAccountToGroupAction } from '@/api/zstack/AddAccountToGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddUsersPayload {
  @Field(() => [String])
  accountUuids: string[]

  @Field(() => [String])
  userGroupUuids: string[]
}

@InputType()
class AddUsersInput {
  @Field(() => [AddUsersPayload])
  payload: AddUsersPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddUsersService extends ActionService {
  @Inject() addAccountToGroupAction: AddAccountToGroupAction

  @Mutation(() => ActionResult)
  addUsers(@Args('input') input: AddUsersInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddUsersPayload, taskId: string) => {
      const { userGroupUuids, accountUuids } = payload

      const task = []
      if (userGroupUuids.length) {
        userGroupUuids.map(userGroupUuid => {
          task.push(
            this.addAccountToGroupAction.call(
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
