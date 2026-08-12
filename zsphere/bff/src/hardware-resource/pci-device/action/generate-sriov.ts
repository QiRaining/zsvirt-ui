import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { GenerateSriovPciDevicesAction } from '@/api/zstack/GenerateSriovPciDevicesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class GenerateSriovPciDevicePayload {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => Float)
  virtPartNum: number
}

@InputType()
class GenerateSriovPciDeviceInput {
  @Field(() => GenerateSriovPciDevicePayload)
  payload: GenerateSriovPciDevicePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 虚拟化切分支持SR-IOV的PCI设备(GenerateSriovPciDevices)
 *
 */
export class GenerateSriovPciDeviceService extends ActionService {
  @Inject() generateSriovPciDevicesAction: GenerateSriovPciDevicesAction

  @Mutation(() => ActionResult)
  generateSriovPciDevices(@Args('input') input: GenerateSriovPciDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: GenerateSriovPciDevicePayload, taskId: string) => {
      const { pciDeviceUuid, virtPartNum } = payload
      await this.generateSriovPciDevicesAction.call(
        {
          pciDeviceUuid,
          virtPartNum
        },
        { actionId, taskId }
      )
      return {
        id: payload.pciDeviceUuid
      }
    }
  }
}
