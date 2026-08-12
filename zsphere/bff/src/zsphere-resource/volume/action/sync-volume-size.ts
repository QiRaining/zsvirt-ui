import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SyncVolumeSizeAction, SyncVolumeSizeResult } from '@/api/zstack/SyncVolumeSizeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SyncVolumeSizePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class SyncVolumeSizeInput {
  @Field(() => [SyncVolumeSizePayload])
  payload: SyncVolumeSizePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncVolumeSizeService extends ActionService {
  @Inject() syncVolumeSizeAction: SyncVolumeSizeAction

  @Mutation(() => ActionResult)
  syncVolumeSize(@Args('input') input: SyncVolumeSizeInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Volume', async (payload: SyncVolumeSizePayload, taskId: string) => {
      const { uuid } = payload
      const result: SyncVolumeSizeResult = await this.syncVolumeSizeAction.call(
        { uuid },
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
