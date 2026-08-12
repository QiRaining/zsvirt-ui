import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddSharedBlockToSharedBlockGroupAction,
  AddSharedBlockToSharedBlockGroupResult
} from '@/api/zstack/AddSharedBlockToSharedBlockGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddSharedBlockToSharedBlockGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  diskUuid: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class AddSharedBlockToSharedBlockGroupInput {
  @Field(() => [AddSharedBlockToSharedBlockGroupPayload])
  payload: AddSharedBlockToSharedBlockGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSharedBlockToSharedBlockGroupService extends ActionService {
  @Inject()
  addSharedBlockToSharedBlockGroupAction: AddSharedBlockToSharedBlockGroupAction

  @Mutation(() => ActionResult)
  addSharedBlockToSharedBlockGroup(@Args('input') input: AddSharedBlockToSharedBlockGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'SharedBlock', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: AddSharedBlockToSharedBlockGroupPayload, taskId: string) => {
      const result: AddSharedBlockToSharedBlockGroupResult =
        await this.addSharedBlockToSharedBlockGroupAction.call(payload, {
          actionId,
          taskId
        })
      return {
        id: actionId,
        inventory: result.inventory
      }
    }
  }
}
