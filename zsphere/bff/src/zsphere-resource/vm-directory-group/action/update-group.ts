import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateDirectoryAction, UpdateDirectoryResult } from '@/api/zstack/UpdateDirectoryAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string
}

@InputType()
export class UpdateGroupInput {
  @Field(() => [UpdateGroupPayload])
  payload: UpdateGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateGroupService extends ActionService {
  @Inject() updateDirectoryAction: UpdateDirectoryAction

  @Mutation(() => ActionResult)
  updateGroup(@Args('input') input: UpdateGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'DirectoryGroup', async (payload: UpdateGroupPayload, taskId) => {
      const resp: UpdateDirectoryResult = await this.updateDirectoryAction.call(
        { ...payload },
        {
          actionId,
          taskId
        }
      )
      return {
        id: actionId,
        inventory: {
          nodeUuid: payload.uuid,
          type: 'update',
          data: resp.inventory
        }
      }
    })
    return { actionId }
  }
}
