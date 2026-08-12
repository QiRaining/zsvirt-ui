import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdatePciDeviceAction, UpdatePciDeviceResult } from '@/api/zstack/UpdatePciDeviceAction'
import { ActionService } from '@/base/action-service'
import { PciDeviceState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { PciDevicePassThroughState } from '../pci-device.model'

@InputType()
class UpdatePciDevicePayload {
  @Field(() => String)
  uuid: string

  @Field(() => PciDeviceState, { nullable: true })
  state?: PciDeviceState

  @Field(() => PciDevicePassThroughState, { nullable: true })
  passThroughState?: PciDevicePassThroughState
}

@InputType()
class UpdatePciDeviceInput {
  @Field(() => [UpdatePciDevicePayload])
  payload: UpdatePciDevicePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 更新pci设备状态 - 启用、停用
 * 更新的pci设备包括：GPU设备、vGPU设备、其他设备
 *
 */
export class UpdatePciDeviceService extends ActionService {
  @Inject() updatePciDeviceAction: UpdatePciDeviceAction

  @Mutation(() => ActionResult)
  updatePciDevice(@Args('input') input: UpdatePciDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PciDevice',
      async (payload: UpdatePciDevicePayload, taskId: string) => {
        const result: UpdatePciDeviceResult = await this.updatePciDeviceAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
