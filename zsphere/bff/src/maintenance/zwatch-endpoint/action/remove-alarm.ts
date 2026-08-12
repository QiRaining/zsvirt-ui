import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RemoveActionFromAlarmAction
  // RemoveActionFromAlarmResult
} from '@/api/zstack/RemoveActionFromAlarmAction'
import { RemoveActionFromEventSubscriptionAction } from '@/api/zstack/RemoveActionFromEventSubscriptionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZWatchAlarmQueryType } from '@/maintenance/zwatch-alarm/zwatch.alarm.model'

@InputType()
class RemoveAlarmFromEndPointPayload {
  @Field(() => String, { nullable: true })
  alarmUuid: string

  @Field(() => String, { nullable: true })
  subscriptionUuid: string

  @Field(() => String)
  actionUuid: string

  @Field(() => ZWatchAlarmQueryType)
  type: ZWatchAlarmQueryType
}

@InputType()
class RemoveAlarmFromEndPointInput {
  @Field(() => [RemoveAlarmFromEndPointPayload])
  payload: RemoveAlarmFromEndPointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveAlarmFromEndpointService extends ActionService {
  @Inject() removeActionFromAlarmAction: RemoveActionFromAlarmAction
  @Inject()
  removeActionFromEventSubscriptionAction: RemoveActionFromEventSubscriptionAction

  @Mutation(() => ActionResult)
  removeAlarmFromEndpoint(@Args('input') input: RemoveAlarmFromEndPointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: RemoveAlarmFromEndPointPayload, taskId: string) => {
        if (payload.type === ZWatchAlarmQueryType.Resource) {
          await this.removeActionFromAlarmAction.call(payload, {
            actionId,
            taskId
          })
        } else {
          await this.removeActionFromEventSubscriptionAction.call(payload, {
            actionId,
            taskId
          })
        }
        return {
          id: payload.alarmUuid || payload.subscriptionUuid
        }
      }
    )
    return { actionId }
  }
}
