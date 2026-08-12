import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReclaimSpaceFromImageStoreAction } from '@/api/zstack/ReclaimSpaceFromImageStoreAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReclaimSpaceFromImageStorePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReclaimSpaceFromImageStoreInput {
  @Field(() => [ReclaimSpaceFromImageStorePayload])
  payload: ReclaimSpaceFromImageStorePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReclaimSpaceFromImageStoreService extends ActionService {
  @Inject() reclaimSpaceFromImageStoreAction: ReclaimSpaceFromImageStoreAction

  @Mutation(() => ActionResult)
  async reclaimSpaceFromImageStore(@Args('input') input: ReclaimSpaceFromImageStoreInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'BackupStorage', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: ReclaimSpaceFromImageStorePayload, taskId: string) => {
      const result = await this.reclaimSpaceFromImageStoreAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: actionId,
        inventory: result?.gcResult
      }
    }
  }
}
