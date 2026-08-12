import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateEmailAddressOfSNSEmailEndpointAction } from '@/api/zstack/UpdateEmailAddressOfSNSEmailEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateEmailAddressToEndpointPayload {
  @Field(() => String)
  emailAddressUuid: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String)
  emailAddress: string
}

@InputType()
class UpdateEmailAddressToEndpointInput {
  @Field(() => [UpdateEmailAddressToEndpointPayload])
  payload: UpdateEmailAddressToEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateEmailAddressToEndpointService extends ActionService {
  @Inject() updateAction: UpdateEmailAddressOfSNSEmailEndpointAction

  @Mutation(() => ActionResult)
  updateEmailAddressToEndpoint(@Args('input') input: UpdateEmailAddressToEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPointEmailAddress',
      async (payload: UpdateEmailAddressToEndpointPayload, taskId: string) => {
        const { endpointUuid } = payload
        await this.updateAction.call(payload, { actionId, taskId })
        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
