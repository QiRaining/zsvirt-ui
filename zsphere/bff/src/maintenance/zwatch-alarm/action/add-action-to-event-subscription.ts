import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddActionToEventSubscriptionAction,
  AddActionToEventSubscriptionResult
} from '@/api/zstack/AddActionToEventSubscriptionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddActionToEventSubscriptionPayload {
  @Field(() => String)
  subscriptionUuid: string

  @Field(() => String)
  actionUuid: string

  @Field(() => String, { nullable: true, defaultValue: 'sns' })
  actionType: string
}

@InputType()
class AddActionToEventSubscriptionInput {
  @Field(() => [AddActionToEventSubscriptionPayload])
  payload: AddActionToEventSubscriptionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddActionToEventSubscriptionService extends ActionService {
  @Inject()
  addActionToEventSubscriptionAction: AddActionToEventSubscriptionAction

  @Mutation(() => ActionResult)
  addActionToEventSubscription(@Args('input') input: AddActionToEventSubscriptionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: AddActionToEventSubscriptionPayload, taskId: string) => {
        const result: AddActionToEventSubscriptionResult =
          await this.addActionToEventSubscriptionAction.call(payload, {
            actionId,
            taskId
          })
        return {
          id: payload.subscriptionUuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
