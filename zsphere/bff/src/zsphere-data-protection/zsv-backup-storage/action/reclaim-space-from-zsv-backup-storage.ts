import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReclaimSpaceFromImageStoreAction } from '@/api/zstack/ReclaimSpaceFromImageStoreAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReclaimSpaceFromZSVBackupStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReclaimSpaceFromZSVBackupStorageInput {
  @Field(() => [ReclaimSpaceFromZSVBackupStoragePayload])
  payload: ReclaimSpaceFromZSVBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReclaimSpaceFromZSVBackupStorageService extends ActionService {
  @Inject() reclaimSpaceFromImageStoreAction: ReclaimSpaceFromImageStoreAction

  @Mutation(() => ActionResult)
  async reclaimSpaceFromZSVBackupStorage(
    @Args('input') input: ReclaimSpaceFromZSVBackupStorageInput
  ) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ReclaimSpaceFromZSVBackupStoragePayload, taskId: string) => {
      const result = await this.reclaimSpaceFromImageStoreAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: actionId,
        inventory: result?.gcResult
      }
    }
    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
