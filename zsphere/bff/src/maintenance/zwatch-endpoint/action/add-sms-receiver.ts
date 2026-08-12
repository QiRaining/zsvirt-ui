import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSSmsReceiverAction } from '@/api/zstack/AddSNSSmsReceiverAction'
import { ActionService } from '@/base/action-service'
import { SmsReceiverType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AddSmsReceiverPayload {
  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => SmsReceiverType, {
    nullable: true,
    description: '现阶段只有一个选项,所以非必填'
  })
  type?: SmsReceiverType
}

@InputType()
class AddSmsReceiverInput {
  @Field(() => [AddSmsReceiverPayload])
  payload: AddSmsReceiverPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSmsReceiverService extends ActionService {
  @Inject() addAction: AddSNSSmsReceiverAction

  @Mutation(() => ActionResult)
  addSmsReceiver(@Args('input') input: AddSmsReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPointSmsAddress',
      async (payload: AddSmsReceiverPayload, taskId: string) => {
        const { phoneNumber, endpointUuid, type = SmsReceiverType.AliyunSms } = payload
        await this.addAction.call(
          {
            phoneNumber,
            endpointUuid,
            type
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
