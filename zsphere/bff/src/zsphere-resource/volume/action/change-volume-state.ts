import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeVolumeStateAction,
  ChangeVolumeStateResult
} from '@/api/zstack/ChangeVolumeStateAction'
import { ActionService } from '@/base/action-service'
import { VolumeStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeVolumeStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => VolumeStateEvent)
  stateEvent: VolumeStateEvent
}

@InputType()
export class ChangeVolumeStateInput {
  @Field(() => [ChangeVolumeStatePayload])
  payload: ChangeVolumeStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVolumeStateService extends ActionService {
  @Inject() changeVolumeStateAction: ChangeVolumeStateAction

  @Mutation(() => ActionResult)
  changeVolumeState(@Args('input') input: ChangeVolumeStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: ChangeVolumeStatePayload, taskId: string) => {
        const { uuid, stateEvent } = payload
        const result: ChangeVolumeStateResult = await this.changeVolumeStateAction.call(
          { uuid, stateEvent },
          { actionId, taskId }
        )

        // 批量修改的时候有走缓存有bug，这里先不走缓存。
        return {
          id: payload.uuid
          // fields: 'state',
          // inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
