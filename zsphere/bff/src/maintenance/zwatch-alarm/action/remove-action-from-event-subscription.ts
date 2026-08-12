import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  QueryEventSubscriptionAction,
  QueryEventSubscriptionResult
} from '@/api/zstack/QueryEventSubscriptionAction'
import { RemoveActionFromEventSubscriptionAction } from '@/api/zstack/RemoveActionFromEventSubscriptionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveActionFromEventSubscriptionPayload {
  @Field(() => String)
  subscriptionUuid: string

  @Field(() => String)
  actionUuid: string
}

@InputType()
class RemoveActionFromEventSubscriptionInput {
  @Field(() => [RemoveActionFromEventSubscriptionPayload])
  payload: RemoveActionFromEventSubscriptionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveActionFromEventSubscriptionService extends ActionService {
  @Inject()
  removeActionFromEventSubscriptionAction: RemoveActionFromEventSubscriptionAction
  @Inject() queryEventSubscriptionAction: QueryEventSubscriptionAction

  @Mutation(() => ActionResult)
  removeActionFromEventSubscription(@Args('input') input: RemoveActionFromEventSubscriptionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: RemoveActionFromEventSubscriptionPayload, taskId: string) => {
        await this.removeActionFromEventSubscriptionAction.call(payload, {
          actionId,
          taskId
        })
        const resp: QueryEventSubscriptionResult = await this.queryEventSubscriptionAction.call({
          conditions: [{ key: 'uuid', value: payload.subscriptionUuid }]
        })

        return {
          id: payload.subscriptionUuid,
          inventory: resp?.inventories?.[0]
        }
      }
    )
    return { actionId }
  }
}

export interface RemoveActionFromEventSubscriptionResult {
  inventory: any
}
