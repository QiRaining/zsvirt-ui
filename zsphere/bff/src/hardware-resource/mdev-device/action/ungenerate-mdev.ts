import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UngenerateMdevDevicesAction } from '@/api/zstack/UngenerateMdevDevicesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UnGenerateMdevDevicePayload {
  @Field(() => String)
  pciDeviceUuid: string
}

@InputType()
class UnGenerateMdevDeviceInput {
  @Field(() => UnGenerateMdevDevicePayload)
  payload: UnGenerateMdevDevicePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 虚拟化还原支持VFIO_MDEV的PCI设备(UngenerateMdevDevices)
 *
 */
export class UnGenerateMdevDeviceService extends ActionService {
  @Inject() unGenerateMdevDevicesAction: UngenerateMdevDevicesAction

  @Mutation(() => ActionResult)
  unGenerateMdevDevice(@Args('input') input: UnGenerateMdevDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UnGenerateMdevDevicePayload, taskId: string) => {
      const { pciDeviceUuid } = payload
      await this.unGenerateMdevDevicesAction.call(
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
