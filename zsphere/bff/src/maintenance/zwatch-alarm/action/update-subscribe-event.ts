import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateSubscribeEventAction } from '@/api/zstack/UpdateSubscribeEventAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSubscribeEventPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true, description: '报警等级' })
  emergencyLevel: string
}

@InputType()
class UpdateSubscribeEventInput {
  @Field(() => [UpdateSubscribeEventPayload])
  payload: UpdateSubscribeEventPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSubscribeEventService extends ActionService {
  @Inject() updateSubscribeEventAction: UpdateSubscribeEventAction

  @Mutation(() => ActionResult)
  updateSubscribeEvent(@Args('input') input: UpdateSubscribeEventInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateSubscribeEventPayload, taskId: string) => {
      const { inventory } = await this.updateSubscribeEventAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: inventory.uuid,
        inventory
      }
    }

    this.actionHelper(input, 'ZWatchAlarmVO', actionFn)
    return { actionId }
  }
}
