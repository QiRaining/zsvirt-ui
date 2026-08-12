import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RemoveActionFromAlarmAction,
  RemoveActionFromAlarmResult
} from '@/api/zstack/RemoveActionFromAlarmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class RemoveActionFromAlarmPayload {
  @Field(() => String)
  alarmUuid: string

  @Field(() => String)
  actionUuid: string
}

@InputType()
class RemoveActionFromAlarmInput {
  @Field(() => [RemoveActionFromAlarmPayload])
  payload: RemoveActionFromAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveActionFromAlarmService extends ActionService {
  @Inject() removeActionFromAlarmAction: RemoveActionFromAlarmAction

  @Mutation(() => ActionResult)
  removeActionFromAlarm(@Args('input') input: RemoveActionFromAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: RemoveActionFromAlarmPayload, taskId: string) => {
        const result: RemoveActionFromAlarmResult = await this.removeActionFromAlarmAction.call(
          payload,
          {
            actionId,
            taskId
          }
        )
        return {
          id: payload.alarmUuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
