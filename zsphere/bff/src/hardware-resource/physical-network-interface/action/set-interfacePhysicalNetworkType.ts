import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, Int } from '@nestjs/graphql'
import { omit as _omit, isEmpty as _isEmpty } from 'lodash'

import { SetServiceTypeOnHostNetworkInterfaceAction } from '@/api/zstack/SetServiceTypeOnHostNetworkInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { PhysicalNetworkType } from '@/hardware-resource/physical-network/physical-network.model'

@InputType()
export class SetPhysicalNetworkInterfacePhysicalNetworkTypePayload {
  @Field(() => [String])
  interfaceUuids: string[]

  @Field(() => [Int], { nullable: true, defaultValue: [] })
  vlanIds?: number[]

  @Field(() => [PhysicalNetworkType])
  serviceTypes: PhysicalNetworkType[]
}

@InputType()
export class SetPhysicalNetworkInterfacePhysicalNetworkTypeInput {
  @Field(() => [SetPhysicalNetworkInterfacePhysicalNetworkTypePayload])
  payload: SetPhysicalNetworkInterfacePhysicalNetworkTypePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetPhysicalNetworkInterfacePhysicalNetworkTypeService extends ActionService {
  @Inject()
  setServiceTypeOnHostNetworkInterfaceAction: SetServiceTypeOnHostNetworkInterfaceAction

  @Mutation(() => ActionResult)
  setPhysicalNetworkInterfacePhysicalNetworkType(
    @Args('input') input: SetPhysicalNetworkInterfacePhysicalNetworkTypeInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PhysicalNetworkInterface',
      async (payload: SetPhysicalNetworkInterfacePhysicalNetworkTypePayload, taskId: string) => {
        if (_isEmpty(payload.serviceTypes)) {
          delete payload.serviceTypes
        }

        if (_isEmpty(payload.vlanIds)) {
          delete payload.vlanIds
        }

        await this.setServiceTypeOnHostNetworkInterfaceAction.call(payload, {
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
