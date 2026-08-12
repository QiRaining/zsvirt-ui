import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddActionToAlarmAction } from '@/api/zstack/AddActionToAlarmAction'
import { AddActionToEventSubscriptionAction } from '@/api/zstack/AddActionToEventSubscriptionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZWatchAlarmQueryType } from '@/maintenance/zwatch-alarm/zwatch.alarm.model'

@InputType()
class AddAlarmToEndPointPayload {
  @Field(() => String, { nullable: true })
  alarmUuid: string

  @Field(() => String, { nullable: true })
  subscriptionUuid: string

  @Field(() => String)
  actionUuid: string

  @Field(() => String)
  actionType: string

  @Field(() => ZWatchAlarmQueryType)
  type: ZWatchAlarmQueryType
}

@InputType()
class AddAlarmToEndPointInput {
  @Field(() => [AddAlarmToEndPointPayload])
  payload: AddAlarmToEndPointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddAlarmToEndpointService extends ActionService {
  @Inject() addActionToAlarmAction: AddActionToAlarmAction
  @Inject()
  addActionToEventSubscriptionAction: AddActionToEventSubscriptionAction

  @Mutation(() => ActionResult)
  addAlarmToEndpoint(@Args('input') input: AddAlarmToEndPointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: AddAlarmToEndPointPayload, taskId: string) => {
        if (payload.type === ZWatchAlarmQueryType.Resource) {
          await this.addActionToAlarmAction.call(payload, {
            actionId,
            taskId
          })
        } else {
          await this.addActionToEventSubscriptionAction.call(payload, {
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
