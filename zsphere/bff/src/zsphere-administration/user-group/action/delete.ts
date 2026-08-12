import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteAccountGroupAction } from '@/api/zstack/DeleteAccountGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteUserGroupPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteUserGroupInput {
  @Field(() => [DeleteUserGroupPayload])
  payload: DeleteUserGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteUserGroupService extends ActionService {
  @Inject() deleteAccountGroupAction: DeleteAccountGroupAction

  @Mutation(() => ActionResult)
  deleteUserGroup(@Args('input') input: DeleteUserGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteUserGroupPayload, taskId: string) => {
      await this.deleteAccountGroupAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
