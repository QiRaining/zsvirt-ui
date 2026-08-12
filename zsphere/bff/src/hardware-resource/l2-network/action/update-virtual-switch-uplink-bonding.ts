import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateVirtualSwitchUplinkBondingsAction } from '@/api/zstack/UpdateVirtualSwitchUplinkBondingsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVirtualSwitchUplinkBondingsActionPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  bondingName?: string

  @Field(() => String, { nullable: true })
  mode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string
}

@InputType()
export class UpdateVirtualSwitchUplinkBondingsActionInput {
  @Field(() => UpdateVirtualSwitchUplinkBondingsActionPayload)
  payload: UpdateVirtualSwitchUplinkBondingsActionPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVirtualSwitchUplinkBondingsService extends ActionService {
  @Inject()
  updateVirtualSwitchUplinkBondingsAction: UpdateVirtualSwitchUplinkBondingsAction

  @Mutation(() => ActionResult)
  updateVirtualSwitchUplinkBondings(
    @Args('input') input: UpdateVirtualSwitchUplinkBondingsActionInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: UpdateVirtualSwitchUplinkBondingsActionPayload, taskId: string) => {
        await this.action(payload, { actionId, taskId })

        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }

  async action(
    payload: UpdateVirtualSwitchUplinkBondingsActionPayload,
    action: { actionId: string; taskId: string }
  ) {
    const { uuid, mode, xmitHashPolicy, bondingName } = payload

    const res = await this.updateVirtualSwitchUplinkBondingsAction.call(
      {
        uuid,
        mode,
        xmitHashPolicy,
        bondingName
      },
      action
    )

    return res
  }
}
