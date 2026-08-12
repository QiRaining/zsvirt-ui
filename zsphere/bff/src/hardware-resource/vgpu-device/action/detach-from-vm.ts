import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { DetachMdevDeviceFromVmService } from '@/hardware-resource/mdev-device/action/detach-from-vm'
import { DetachPciDeviceFromVMService } from '@/hardware-resource/pci-device/action/detach-from-vm'
import { VGpuType } from '@/hardware-resource/vgpu-device/vgpu-device.model'

@InputType()
export class DetachVGpuFromVmInstancePayload {
  @Field(() => String)
  vGpuDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => VGpuType)
  type: VGpuType
}

@InputType()
export class DetachVGpuFromVmInstanceInput {
  @Field(() => [DetachVGpuFromVmInstancePayload])
  payload: DetachVGpuFromVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachVGpuFromVmInstanceService extends ActionService {
  @Inject() detachPciDeviceFromVmService: DetachPciDeviceFromVMService
  @Inject() detachMdevDeviceFromVmService: DetachMdevDeviceFromVmService

  @Mutation(() => ActionResult)
  detachVGpuFromVmInstance(@Args('input') input: DetachVGpuFromVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VGpuDevice',
      async (payload: DetachVGpuFromVmInstancePayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: DetachVGpuFromVmInstancePayload, taskId: string, actionId) {
    const { vmInstanceUuid, vGpuDeviceUuid, type } = payload
    const service =
      type === VGpuType.MdevDevice
        ? this.detachMdevDeviceFromVmService
        : this.detachPciDeviceFromVmService
    const _actionFn = service.action(actionId)
    const param: any = {
      [type === VGpuType.MdevDevice ? 'mdevDeviceUuid' : 'pciDeviceUuid']: vGpuDeviceUuid,
      vmInstanceUuid
    }
    await _actionFn(param, taskId)
    return {
      id: vGpuDeviceUuid
    }
  }
}
