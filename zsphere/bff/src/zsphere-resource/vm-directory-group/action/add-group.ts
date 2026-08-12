import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { CreateDirectoryAction, CreateDirectoryResult } from '@/api/zstack/CreateDirectoryAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddGroupPayload {
  @Field(() => String)
  parentUuid?: string

  @Field(() => String)
  name: string

  //区别 vm
  @Field(() => String)
  type: string

  @Field(() => String)
  zoneUuid: string
}

@InputType()
class AddGroupInput {
  @Field(() => [AddGroupPayload])
  payload: AddGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddGroupService extends ActionService {
  @Inject() createDirectoryAction: CreateDirectoryAction

  @Mutation(() => ActionResult)
  addGroup(@Args('input') input: AddGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'DirectoryGroup', async (payload: AddGroupPayload, taskId) => {
      if (!payload.parentUuid) {
        delete payload.parentUuid
      }
      const result: CreateDirectoryResult = await this.createDirectoryAction.call(
        { ...payload },
        {
          actionId,
          taskId
        }
      )
      return {
        id: actionId,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
