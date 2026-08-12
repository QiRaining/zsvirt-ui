import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UnsubscribeEventAction } from '@/api/zstack/UnsubscribeEventAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UnsubscribeEventPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class UnsubscribeEventInput {
  @Field(() => [UnsubscribeEventPayload])
  payload: UnsubscribeEventPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UnsubscribeEventService extends ActionService {
  @Inject() unsubscribeEventAction: UnsubscribeEventAction

  // 退订事件 （删除事件报警器、第三方报警器）
  @Mutation(() => ActionResult)
  unsubscribeEvent(@Args('input') input: UnsubscribeEventInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: UnsubscribeEventPayload, taskId: string) => {
        const { uuid } = payload
        await this.unsubscribeEventAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
