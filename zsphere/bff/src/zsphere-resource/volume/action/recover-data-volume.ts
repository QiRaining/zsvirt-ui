import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RecoverDataVolumeAction,
  RecoverDataVolumeResult
} from '@/api/zstack/RecoverDataVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RecoverDataVolumePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class RecoverDataVolumeInput {
  @Field(() => [RecoverDataVolumePayload])
  payload: RecoverDataVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RecoverDataVolumeService extends ActionService {
  @Inject() recoverDataVolumeAction: RecoverDataVolumeAction

  @Mutation(() => ActionResult)
  recoverDataVolume(@Args('input') input: RecoverDataVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: RecoverDataVolumePayload, taskId: string) => {
        const { uuid } = payload
        const result: RecoverDataVolumeResult = await this.recoverDataVolumeAction.call(
          { uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'state,status,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
