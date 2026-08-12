import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UngenerateSriovPciDevicesAction } from '@/api/zstack/UngenerateSriovPciDevicesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UnGenerateSriovPciDevicePayload {
  @Field(() => String)
  pciDeviceUuid: string
}

@InputType()
class UnGenerateSriovPciDeviceInput {
  @Field(() => UnGenerateSriovPciDevicePayload)
  payload: UnGenerateSriovPciDevicePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 虚拟化还原支持SR-IOV的PCI设备(UngenerateSriovPciDevices)
 *
 */
export class UnGenerateSriovPciDeviceService extends ActionService {
  @Inject() unGenerateSriovPciDevicesAction: UngenerateSriovPciDevicesAction

  @Mutation(() => ActionResult)
  unGenerateSriovPciDevice(@Args('input') input: UnGenerateSriovPciDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UnGenerateSriovPciDevicePayload, taskId: string) => {
      const { pciDeviceUuid } = payload
      await this.unGenerateSriovPciDevicesAction.call(
        {
          pciDeviceUuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.pciDeviceUuid
      }
    }
  }
}
