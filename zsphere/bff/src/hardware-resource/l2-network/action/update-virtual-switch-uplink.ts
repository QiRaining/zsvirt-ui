import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import {
  AttachL2NetworkToHostPayload,
  AttachL2NetworkToHostService
} from '@/hardware-resource/host/action/attach-to-vswitch'

import {
  UpdateVirtualSwitchUplinkBondingsActionPayload,
  UpdateVirtualSwitchUplinkBondingsService
} from './update-virtual-switch-uplink-bonding'

@InputType()
export class UpdateVirtualSwitchUplinkPayload {
  @Field(() => UpdateVirtualSwitchUplinkBondingsActionPayload, {
    nullable: true
  })
  updateVirtualSwitchUplinkBondingsActionPayload?: UpdateVirtualSwitchUplinkBondingsActionPayload

  @Field(() => AttachL2NetworkToHostPayload, { nullable: true })
  attachL2NetworkToHostPayload?: AttachL2NetworkToHostPayload
}

@InputType()
export class UpdateVirtualSwitchUplinkInput {
  @Field(() => UpdateVirtualSwitchUplinkPayload)
  payload: UpdateVirtualSwitchUplinkPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVirtualSwitchUplinkService extends ActionService {
  @Inject()
  updateVirtualSwitchUplinkBondingsService: UpdateVirtualSwitchUplinkBondingsService
  @Inject()
  attachL2NetworkToHostService: AttachL2NetworkToHostService

  @Mutation(() => ActionResult)
  updateVirtualSwitchUplink(@Args('input') input: UpdateVirtualSwitchUplinkInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: UpdateVirtualSwitchUplinkPayload, taskId: string) => {
        const action = { actionId, taskId }
        const { updateVirtualSwitchUplinkBondingsActionPayload, attachL2NetworkToHostPayload } =
          payload

        await this.updateVirtualSwitchUplinkBondingsService.action(
          updateVirtualSwitchUplinkBondingsActionPayload,
          action
        )

        await this.attachL2NetworkToHostService.action(attachL2NetworkToHostPayload, action)

        return { id: actionId }
      }
    )
    return { actionId }
  }
}
