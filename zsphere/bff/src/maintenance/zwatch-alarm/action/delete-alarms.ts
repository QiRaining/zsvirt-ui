import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteAlarmAction } from '@/api/zstack/DeleteAlarmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteZWatchAlarmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteZWatchAlarmInput {
  @Field(() => [DeleteZWatchAlarmPayload])
  payload: DeleteZWatchAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteZWatchAlarmService extends ActionService {
  @Inject() deleteAlarmAction: DeleteAlarmAction

  @Mutation(() => ActionResult)
  deleteAlarms(@Args('input') input: DeleteZWatchAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: DeleteZWatchAlarmPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteAlarmAction.call(
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
