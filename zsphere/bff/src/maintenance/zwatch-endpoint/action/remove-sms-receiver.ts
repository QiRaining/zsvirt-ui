import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveSNSSmsReceiverAction } from '@/api/zstack/RemoveSNSSmsReceiverAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveSmsReceiverPayload {
  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class RemoveSmsReceiverInput {
  @Field(() => [RemoveSmsReceiverPayload])
  payload: RemoveSmsReceiverPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveSmsReceiverService extends ActionService {
  @Inject() RemoveAction: RemoveSNSSmsReceiverAction

  @Mutation(() => ActionResult)
  removeSmsReceiver(@Args('input') input: RemoveSmsReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: RemoveSmsReceiverPayload, taskId: string) => {
        const { phoneNumber, endpointUuid } = payload
        await this.RemoveAction.call(
          {
            phoneNumber,
            endpointUuid
          },
          { actionId, taskId }
        )
        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
