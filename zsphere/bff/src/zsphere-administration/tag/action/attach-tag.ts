import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachTagPayload {
  @Field(() => String)
  tagUuid: string

  @Field(() => [String])
  resourceUuids: any[]
}

@InputType()
class AttachTagInput {
  @Field(() => [AttachTagPayload])
  payload: AttachTagPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachTagService extends ActionService {
  @Inject() detachTagFromResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  attachTag(@Args('input') input: AttachTagInput) {
    console.log('input.payload', input.payload)
    const actionId = input.action.actionId
    this.actionHelper(input, 'Tag', async (payload: AttachTagPayload, taskId: string) => {
      const { tagUuid, resourceUuids } = payload
      await this.detachTagFromResourcesAction.call({ tagUuid, resourceUuids }, { actionId, taskId })
      return {
        id: tagUuid
      }
    })
    return { actionId }
  }
}
