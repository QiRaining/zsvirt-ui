import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddEmailAddressToSNSEmailEndpointAction } from '@/api/zstack/AddEmailAddressToSNSEmailEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddEmailAddressToEndpointPayload {
  @Field(() => String)
  emailAddress: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class AddEmailAddressToEndpointInput {
  @Field(() => [AddEmailAddressToEndpointPayload])
  payload: AddEmailAddressToEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddEmailAddressToEndpointService extends ActionService {
  @Inject() addAction: AddEmailAddressToSNSEmailEndpointAction

  @Mutation(() => ActionResult)
  addEmailAddress(@Args('input') input: AddEmailAddressToEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPointEmailAddress',
      async (payload: AddEmailAddressToEndpointPayload, taskId: string) => {
        const { endpointUuid } = payload
        await this.addAction.call(payload, { actionId, taskId })
        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
