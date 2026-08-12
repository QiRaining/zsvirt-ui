import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateAlertDataAckAction } from '@/api/zstack/UpdateAlertDataAckAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAlertDataAckPayload {
  @Field(() => String)
  dataUuid: string

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  resumeAlert?: boolean = true
}

@InputType()
class UpdateAlertDataAckInput {
  @Field(() => [UpdateAlertDataAckPayload])
  payload: UpdateAlertDataAckPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAlertDataAckService extends ActionService {
  @Inject() updateAlertDataAckAction: UpdateAlertDataAckAction

  @Mutation(() => ActionResult)
  updateAlertDataAck(@Args('input') input: UpdateAlertDataAckInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateAlertDataAckPayload, taskId: string) => {
      const { dataUuid, ...res } = payload

      const _payload = {
        alertDataUuid: dataUuid,
        ...res
      }

      const { inventory } = await this.updateAlertDataAckAction.call(_payload, {
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
