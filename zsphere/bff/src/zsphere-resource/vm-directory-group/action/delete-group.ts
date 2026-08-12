import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteDirectoryAction } from '@/api/zstack/DeleteDirectoryAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  groupName?: string
}

@InputType()
export class DeleteGroupInput {
  @Field(() => [DeleteGroupPayload])
  payload: DeleteGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteGroupService extends ActionService {
  @Inject() deleteDirectoryAction: DeleteDirectoryAction

  @Mutation(() => ActionResult)
  deleteGroup(@Args('input') input: DeleteGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'DirectoryGroup', async (payload: DeleteGroupPayload, taskId) => {
      await this.deleteDirectoryAction.call(
        { uuid: payload.uuid },
        {
          actionId,
          taskId
        }
      )
      return {
        id: actionId,
        inventory: {
          type: 'delete',
          actionType: 'delete',
          uuid: payload.uuid,
          groupName: payload.groupName
        }
      }
    })
    return { actionId }
  }
}
