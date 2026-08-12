import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSSmsReceiverAction } from '@/api/zstack/AddSNSSmsReceiverAction'
import { RemoveSNSSmsReceiverAction } from '@/api/zstack/RemoveSNSSmsReceiverAction'
import { ActionService } from '@/base/action-service'
import { SmsReceiverType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSmsReceiverPayload {
  @Field(() => String)
  oldPhoneNumber: string

  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class UpdateSmsReceiverInput {
  @Field(() => [UpdateSmsReceiverPayload])
  payload: UpdateSmsReceiverPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSmsReceiverService extends ActionService {
  @Inject() addSNSSmsReceiverAction: AddSNSSmsReceiverAction
  @Inject() removeSNSSmsReceiverAction: RemoveSNSSmsReceiverAction

  @Mutation(() => ActionResult)
  updateSmsReceiver(@Args('input') input: UpdateSmsReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPointSmsAddress',
      async (payload: UpdateSmsReceiverPayload, taskId: string) => {
        await this.addSNSSmsReceiverAction.call({
          phoneNumber: payload?.phoneNumber,
          endpointUuid: payload?.endpointUuid,
          type: SmsReceiverType.AliyunSms
        })
        await this.removeSNSSmsReceiverAction.call(
          {
            phoneNumber: payload?.oldPhoneNumber,
            endpointUuid: payload?.endpointUuid
          },
          { actionId, taskId }
        )
        return {
          id: payload?.[0]?.endpointUuid
        }
      }
    )
    return { actionId }
  }
}
