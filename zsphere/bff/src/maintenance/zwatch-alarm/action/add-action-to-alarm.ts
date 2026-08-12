import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddActionToAlarmAction, AddActionToAlarmResult } from '@/api/zstack/AddActionToAlarmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddActionToAlarmPayload {
  @Field(() => String)
  alarmUuid: string

  @Field(() => String)
  actionUuid: string

  @Field(() => String, { nullable: true, defaultValue: 'sns' })
  actionType: string
}

@InputType()
class AddActionToAlarmInput {
  @Field(() => [AddActionToAlarmPayload])
  payload: AddActionToAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddActionToAlarmService extends ActionService {
  @Inject() addActionToAlarmAction: AddActionToAlarmAction

  @Mutation(() => ActionResult)
  addActionToAlarm(@Args('input') input: AddActionToAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: AddActionToAlarmPayload, taskId: string) => {
        const result: AddActionToAlarmResult = await this.addActionToAlarmAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.alarmUuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
