import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { GenerateMdevDevicesAction } from '@/api/zstack/GenerateMdevDevicesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class GenerateMdevDevicePayload {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  mdevSpecUuid: string
}

@InputType()
class GenerateMdevDeviceInput {
  @Field(() => GenerateMdevDevicePayload)
  payload: GenerateMdevDevicePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 虚拟化切分支持VFIO_MDEV的PCI设备(GenerateMdevDevices)
 *
 */
export class GenerateMdevDeviceService extends ActionService {
  @Inject() generateMdevDevicesAction: GenerateMdevDevicesAction

  @Mutation(() => ActionResult)
  generateMdevDevice(@Args('input') input: GenerateMdevDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: GenerateMdevDevicePayload, taskId: string) => {
      const { pciDeviceUuid, mdevSpecUuid } = payload
      await this.generateMdevDevicesAction.call(
        {
          pciDeviceUuid,
          mdevSpecUuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.pciDeviceUuid
      }
    }
  }
}
