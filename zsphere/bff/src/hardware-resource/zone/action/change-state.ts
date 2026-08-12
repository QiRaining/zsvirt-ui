import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeZoneStateAction } from '@/api/zstack/ChangeZoneStateAction'
import { ActionService } from '@/base/action-service'
import { ZoneStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeZoneStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => ZoneStateEvent)
  stateEvent: ZoneStateEvent
}

@InputType()
export class ChangeZoneStateInput {
  @Field(() => [ChangeZoneStatePayload])
  payload: ChangeZoneStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeZoneStateService extends ActionService {
  @Inject() changeZoneAction: ChangeZoneStateAction

  @Mutation(() => ActionResult)
  changeZoneState(@Args('input') input: ChangeZoneStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Zone', async (payload: ChangeZoneStatePayload, taskId: string) => {
      const { uuid, stateEvent } = payload
      const { inventory } = await this.changeZoneAction.call(
        {
          uuid,
          stateEvent
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'state',
        inventory: inventory
      }
    })
    return { actionId }
  }
}
