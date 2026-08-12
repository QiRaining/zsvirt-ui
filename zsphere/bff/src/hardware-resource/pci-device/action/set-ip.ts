import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetIpOnHostNetworkInterfaceAction } from '@/api/zstack/SetIpOnHostNetworkInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class IpConfigpayload {
  @Field(() => String, { nullable: true })
  ipAddress?: string

  @Field(() => String, { nullable: true })
  netmask?: string
}

@InputType()
class SetIpOnInterfacePayload extends IpConfigpayload {
  @Field(() => String)
  interfaceUuid: string
}

@InputType()
export class SetIpOnInterfaceInput {
  @Field(() => [SetIpOnInterfacePayload])
  payload: SetIpOnInterfacePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetIpOnHostNetworkInterfaceService extends ActionService {
  @Inject() setIpOnInterfaceAction: SetIpOnHostNetworkInterfaceAction

  @Mutation(() => ActionResult)
  setIpOnInterface(@Args('input') input: SetIpOnInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostNetworkInterface',
      async (payload: SetIpOnInterfacePayload, taskId: string) => {
        await this.setIpOnInterfaceAction.call(payload, {
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
