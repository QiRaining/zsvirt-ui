import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteEmailAddressOfSNSEmailEndpointAction } from '@/api/zstack/DeleteEmailAddressOfSNSEmailEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteEmailAddressToEndpointPayload {
  @Field(() => String)
  emailAddressUuid: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String)
  emailAddress: string
}

@InputType()
class DeleteEmailAddressToEndpointInput {
  @Field(() => [DeleteEmailAddressToEndpointPayload])
  payload: DeleteEmailAddressToEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteEmailAddressToEndpointService extends ActionService {
  @Inject() deleteAction: DeleteEmailAddressOfSNSEmailEndpointAction

  @Mutation(() => ActionResult)
  deleteEmailAddressToEndpoint(@Args('input') input: DeleteEmailAddressToEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPointEmailAddress',
      async (payload: DeleteEmailAddressToEndpointPayload, taskId: string) => {
        const { endpointUuid } = payload
        await this.deleteAction.call(payload, { actionId, taskId })
        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
