import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Mutation } from '@nestjs/graphql'

import { AckAlarmDataAction } from '@/api/zstack/AckAlarmDataAction'
import { AckEventDataAction } from '@/api/zstack/AckEventDataAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AckAlarmDataPayload {
  @Field(() => String)
  dataUuid: string

  @Field(() => String)
  type: string

  @Field(() => Float)
  ackPeriodSec: number

  @Field(() => String, { nullable: true })
  resourceUuid: string

  @Field(() => String, { nullable: true, description: '资源报警uuid' })
  alarmUuid: string

  @Field(() => String, { nullable: true, description: '事件报警uuid' })
  subscriptionUuid: string
}

@InputType()
class AckAlarmDataInput {
  @Field(() => AckAlarmDataPayload)
  payload: AckAlarmDataPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AckAlarmDataService extends ActionService {
  @Inject() ackEventDataAction: AckEventDataAction
  @Inject() ackAlarmDataAction: AckAlarmDataAction

  @Mutation(() => ActionResult)
  ackAlarmData(@Args('input') input: AckAlarmDataInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AckAlarmDataPayload, taskId: string) => {
      const { dataUuid, subscriptionUuid, type, ...res } = payload

      const typeToFn = {
        alarm: this.ackAlarmDataAction,
        event: this.ackEventDataAction
      }

      const _payload = {
        dataType: type,
        alertDataUuid: dataUuid,
        eventSubscriptionUuid: subscriptionUuid,
        ...res
      }

      const { inventory } = await typeToFn[type].call(_payload, {
        actionId,
        taskId
      })

      return {
        id: payload.dataUuid,
        fields: 'ackData',
        inventory: {
          ackData: inventory
        }
      }
    }

    this.actionHelper(input, 'AlarmHistories', actionFn)
    return { actionId }
  }
}
