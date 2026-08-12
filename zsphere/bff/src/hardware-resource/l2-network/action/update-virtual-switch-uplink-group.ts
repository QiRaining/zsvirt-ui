import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { GetHostNetworkFactsAction } from '@/api/zstack/GetHostNetworkFactsAction'
import { UpdateVirtualSwitchUplinkGroupAction } from '@/api/zstack/UpdateVirtualSwitchUplinkGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import {
  UpdateVirtualSwitchUplinkBondingsActionPayload,
  UpdateVirtualSwitchUplinkBondingsService
} from './update-virtual-switch-uplink-bonding'

@InputType()
export class UpdateVirtualSwitchUplinkGroupActionPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  hostUuid: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  slaveUuids?: string[]

  @Field(() => [String], { nullable: true, defaultValue: [] })
  slaveNames?: string[]

  @Field(() => UpdateVirtualSwitchUplinkBondingsActionPayload, {
    nullable: true
  })
  updateVirtualSwitchUplinkBondingsActionPayload?: UpdateVirtualSwitchUplinkBondingsActionPayload
}

@InputType()
export class UpdateVirtualSwitchUplinkGroupActionInput {
  @Field(() => UpdateVirtualSwitchUplinkGroupActionPayload)
  payload: UpdateVirtualSwitchUplinkGroupActionPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVirtualSwitchUplinkGroupService extends ActionService {
  @Inject()
  updateVirtualSwitchUplinkBondingsService: UpdateVirtualSwitchUplinkBondingsService
  @Inject()
  updateVirtualSwitchUplinkGroupAction: UpdateVirtualSwitchUplinkGroupAction
  @Inject()
  getHostNetworkFactsAction: GetHostNetworkFactsAction

  @Mutation(() => ActionResult)
  updateVirtualSwitchUplinkGroup(@Args('input') input: UpdateVirtualSwitchUplinkGroupActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: UpdateVirtualSwitchUplinkGroupActionPayload, taskId: string) => {
        const { updateVirtualSwitchUplinkBondingsActionPayload, ...rest } = payload

        if (updateVirtualSwitchUplinkBondingsActionPayload) {
          await this.updateVirtualSwitchUplinkBondingsService.action(
            updateVirtualSwitchUplinkBondingsActionPayload,
            { actionId, taskId }
          )
        }

        await this.action(rest, { actionId, taskId })

        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }

  async action(
    payload: UpdateVirtualSwitchUplinkGroupActionPayload,
    action: {
      taskId: string
      actionId: string
    }
  ) {
    await this.updateVirtualSwitchUplinkGroupAction.call(payload, action)
    await this.getHostNetworkFactsAction.call({ hostUuid: payload.hostUuid }, action)
  }
}
