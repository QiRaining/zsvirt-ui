import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateHostNetworkInterfaceAction } from '@/api/zstack/UpdateHostNetworkInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class IpConfigPayload {
  @Field(() => String, { nullable: false })
  description: string
}

@InputType()
class UpdateHostNetworkInterfacePayload extends IpConfigPayload {
  @Field(() => String)
  interfaceUuid: string
}

@InputType()
export class UpdateHostNetworkInterfaceInput {
  @Field(() => [UpdateHostNetworkInterfacePayload])
  payload: UpdateHostNetworkInterfacePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostNetworkInterfaceService extends ActionService {
  @Inject() updateHostNetworkAction: UpdateHostNetworkInterfaceAction

  @Mutation(() => ActionResult)
  updateHostNetworkInterface(@Args('input') input: UpdateHostNetworkInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostNetworkInterface',
      async (payload: UpdateHostNetworkInterfacePayload, taskId: string) => {
        await this.updateHostNetworkAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload?.interfaceUuid
        }
      }
    )
    return { actionId }
  }
}
