import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeHostNetworkInterfaceLldpModeAction } from '@/api/zstack/ChangeHostNetworkInterfaceLldpModeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class InterfaceLLDPModePayload {
  @Field(() => String)
  mode: string

  @Field(() => [String])
  interfaceUuids: string[]
}

@InputType()
export class UpdateHostNetworkInterfaceLLDPModeInput {
  @Field(() => InterfaceLLDPModePayload)
  payload: InterfaceLLDPModePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostNetworkInterfaceLldpModeService extends ActionService {
  @Inject() updateLLDPModeAction: ChangeHostNetworkInterfaceLldpModeAction

  @Mutation(() => ActionResult)
  updateLLDPMode(@Args('input') input: UpdateHostNetworkInterfaceLLDPModeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostNetworkInterface',
      async (payload: InterfaceLLDPModePayload, taskId: string) => {
        await this.updateLLDPModeAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload?.interfaceUuids?.join(',')
        }
      }
    )
    return { actionId }
  }
}
