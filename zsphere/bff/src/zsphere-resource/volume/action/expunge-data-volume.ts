import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import {
  ExpungeDataVolumeAction,
  ExpungeDataVolumeResult
} from '@/api/zstack/ExpungeDataVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExpungeDataVolumePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ExpungeDataVolumeInput {
  @Field(() => [ExpungeDataVolumePayload])
  payload: ExpungeDataVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExpungeDataVolumeService extends ActionService {
  @Inject() expungeDataVolumeAction: ExpungeDataVolumeAction

  @Mutation(() => ActionResult)
  expungeDataVolume(@Args('input') input: ExpungeDataVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: ExpungeDataVolumePayload, taskId: string) => {
        const { uuid } = payload
        const result: ExpungeDataVolumeResult = await this.expungeDataVolumeAction.call(
          { uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          ...result
        }
      }
    )
    return { actionId }
  }
}
