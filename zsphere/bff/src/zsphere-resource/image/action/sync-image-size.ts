import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SyncImageSizeAction, SyncImageSizeResult } from '@/api/zstack/SyncImageSizeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SyncImageSizePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class SyncImageSizeInput {
  @Field(() => SyncImageSizePayload)
  payload: SyncImageSizePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncImageSizeService extends ActionService {
  @Inject() syncImageSizeAction: SyncImageSizeAction

  @Mutation(() => ActionResult)
  syncImageSize(@Args('input') input: SyncImageSizeInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: SyncImageSizePayload, taskId: string) => {
      const { uuid } = payload
      const result: SyncImageSizeResult = await this.syncImageSizeAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'actualSize',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
