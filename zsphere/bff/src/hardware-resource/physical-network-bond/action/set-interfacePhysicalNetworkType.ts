import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, Int } from '@nestjs/graphql'
import { omit as _omit, isEmpty as _isEmpty } from 'lodash'

import { SetServiceTypeOnHostNetworkBondingAction } from '@/api/zstack/SetServiceTypeOnHostNetworkBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { PhysicalNetworkType } from '@/hardware-resource/physical-network/physical-network.model'

@InputType()
export class SetPhysicalNetworkBondPhysicalNetworkTypePayload {
  @Field(() => [String])
  bondingUuids: string[]

  @Field(() => [Int], { nullable: true, defaultValue: [] })
  vlanIds?: number[]

  @Field(() => [PhysicalNetworkType])
  serviceTypes: PhysicalNetworkType[]
}

@InputType()
export class SetPhysicalNetworkBondPhysicalNetworkTypeInput {
  @Field(() => [SetPhysicalNetworkBondPhysicalNetworkTypePayload])
  payload: SetPhysicalNetworkBondPhysicalNetworkTypePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetPhysicalNetworkBondPhysicalNetworkTypeService extends ActionService {
  @Inject()
  setServiceTypeOnHostNetworkBondingAction: SetServiceTypeOnHostNetworkBondingAction

  @Mutation(() => ActionResult)
  setPhysicalNetworkBondPhysicalNetworkType(
    @Args('input') input: SetPhysicalNetworkBondPhysicalNetworkTypeInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PhysicalNetworkBond',
      async (payload: SetPhysicalNetworkBondPhysicalNetworkTypePayload, taskId: string) => {
        if (_isEmpty(payload.serviceTypes)) {
          delete payload.serviceTypes
        }

        if (_isEmpty(payload.vlanIds)) {
          delete payload.vlanIds
        }

        await this.setServiceTypeOnHostNetworkBondingAction.call(payload, {
          actionId,
          taskId
        })

        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
