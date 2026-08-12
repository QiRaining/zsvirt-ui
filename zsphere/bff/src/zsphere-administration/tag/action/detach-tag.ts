import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachTagFromResourcesAction } from '@/api/zstack/DetachTagFromResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachTagPayload {
  @Field(() => String)
  tagUuid: string

  @Field(() => [String])
  resourceUuids: any[]
}

@InputType()
class DetachTagInput {
  @Field(() => [DetachTagPayload])
  payload: DetachTagPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachTagService extends ActionService {
  @Inject() detachTagFromResourcesAction: DetachTagFromResourcesAction

  @Mutation(() => ActionResult)
  detachTag(@Args('input') input: DetachTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Tag', async (payload: DetachTagPayload, taskId: string) => {
      const { tagUuid, resourceUuids } = payload
      await this.detachTagFromResourcesAction.call({ tagUuid, resourceUuids }, { actionId, taskId })
      return {
        id: tagUuid
      }
    })
    return { actionId }
  }
}
