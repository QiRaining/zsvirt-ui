import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeAlarmStateAction, ChangeAlarmStateResult } from '@/api/zstack/ChangeAlarmStateAction'
import { ActionService } from '@/base/action-service'
import { StateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DisableZWatchAlarmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DisableZWatchAlarmInput {
  @Field(() => [DisableZWatchAlarmPayload])
  payload: DisableZWatchAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DisableZWatchAlarmService extends ActionService {
  @Inject() changeAlarmStateAction: ChangeAlarmStateAction

  @Mutation(() => ActionResult)
  disableAlarms(@Args('input') input: DisableZWatchAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: DisableZWatchAlarmPayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangeAlarmStateResult = await this.changeAlarmStateAction.call(
          {
            uuid,
            stateEvent: StateEvent.disable
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'state,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
