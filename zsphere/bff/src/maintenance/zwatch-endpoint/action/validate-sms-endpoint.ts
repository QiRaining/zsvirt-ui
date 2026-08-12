import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ValidateSNSAliyunSmsEndpointAction } from '@/api/zstack/ValidateSNSAliyunSmsEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ValidateAliyunSmsEndpointPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  phoneNumbers: string[]
}

@InputType()
class ValidateAliyunSmsEndpointInput {
  @Field(() => ValidateAliyunSmsEndpointPayload)
  payload: ValidateAliyunSmsEndpointPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ValidateAliyunSmsEndpointService extends ActionService {
  @Inject() ValidateAction: ValidateSNSAliyunSmsEndpointAction

  @Mutation(() => ActionResult)
  validateAliyunSmsEndpoint(@Args('input') input: ValidateAliyunSmsEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AliyunSmsEndPoint',
      async (payload: ValidateAliyunSmsEndpointPayload, taskId: string) => {
        await this.ValidateAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
