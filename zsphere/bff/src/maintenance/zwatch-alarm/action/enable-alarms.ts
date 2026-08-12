import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeAlarmStateAction, ChangeAlarmStateResult } from '@/api/zstack/ChangeAlarmStateAction'
import { ActionService } from '@/base/action-service'
import { StateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class EnableZWatchAlarmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class EnableZWatchAlarmInput {
  @Field(() => [EnableZWatchAlarmPayload])
  payload: EnableZWatchAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EnableZWatchAlarmService extends ActionService {
  @Inject() changeAlarmStateAction: ChangeAlarmStateAction

  @Mutation(() => ActionResult)
  enableAlarms(@Args('input') input: EnableZWatchAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: EnableZWatchAlarmPayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangeAlarmStateResult = await this.changeAlarmStateAction.call(
          {
            uuid,
            stateEvent: StateEvent.enable
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
