import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { LocateHostNetworkInterfaceAction } from '@/api/zstack/LocateHostNetworkInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class LocateHostNetworkInterfacePayload {
  @Field(() => String)
  hostUuid: string

  @Field(() => String)
  networkInterfaceName: string
}

@InputType()
class LocateHostNetworkInterfaceInput {
  @Field(() => LocateHostNetworkInterfacePayload)
  payload: LocateHostNetworkInterfacePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 网卡点灯
 *
 */
export class LocateHostNetworkInterfaceService extends ActionService {
  @Inject() locateHostNetworkInterfaceAction: LocateHostNetworkInterfaceAction

  @Mutation(() => ActionResult)
  locateHostNetworkInterface(@Args('input') input: LocateHostNetworkInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PciDevice',
      async (payload: LocateHostNetworkInterfacePayload, taskId: string) => {
        await this.locateHostNetworkInterfaceAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.networkInterfaceName
        }
      }
    )
    return { actionId }
  }
}
