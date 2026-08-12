import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeEventSubscriptionStateAction,
  ChangeEventSubscriptionStateResult
} from '@/api/zstack/ChangeEventSubscriptionStateAction'
import { ActionService } from '@/base/action-service'
import { BackupStorageStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeEventAlarmStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  state: string
}

@InputType()
export class ChangeEventAlarmStateInput {
  @Field(() => [ChangeEventAlarmStatePayload])
  payload: ChangeEventAlarmStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeEventAlarmStateService extends ActionService {
  @Inject()
  changeEventSubscriptionStateAction: ChangeEventSubscriptionStateAction

  @Mutation(() => ActionResult)
  changeEventAlarmState(@Args('input') input: ChangeEventAlarmStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: ChangeEventAlarmStatePayload, taskId: string) => {
        const result: ChangeEventSubscriptionStateResult =
          await this.changeEventSubscriptionStateAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
