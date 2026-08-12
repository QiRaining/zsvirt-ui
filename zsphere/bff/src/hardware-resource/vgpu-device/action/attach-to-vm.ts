import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { AttachMdevDeviceToVmService } from '@/hardware-resource/mdev-device/action/attach-to-vm'
import { AttachPciDeviceToVmService } from '@/hardware-resource/pci-device/action/attach-to-vm'
import { VGpuType } from '@/hardware-resource/vgpu-device/vgpu-device.model'

@InputType()
export class AttachVGpuToVmInstancePayload {
  @Field(() => String)
  vGpuDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => VGpuType)
  type: VGpuType
}

@InputType()
export class AttachVGpuToVmInstanceInput {
  @Field(() => [AttachVGpuToVmInstancePayload])
  payload: AttachVGpuToVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachVGpuToVmInstanceService extends ActionService {
  @Inject() attachPciDeviceToVmService: AttachPciDeviceToVmService
  @Inject() attachMdevDeviceToVmService: AttachMdevDeviceToVmService

  @Mutation(() => ActionResult)
  attachVGpuToVmInstance(@Args('input') input: AttachVGpuToVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VGpuDevice',
      async (payload: AttachVGpuToVmInstancePayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: AttachVGpuToVmInstancePayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, vGpuDeviceUuid, type } = payload
    const service =
      type === VGpuType.MdevDevice
        ? this.attachMdevDeviceToVmService
        : this.attachPciDeviceToVmService
    const actionFn = service.action(actionId)
    const param: any = {
      [type === VGpuType.MdevDevice ? 'mdevDeviceUuid' : 'pciDeviceUuid']: vGpuDeviceUuid,
      vmInstanceUuid
    }
    const result = await actionFn(param, taskId)
    return {
      id: vGpuDeviceUuid
    }
  }
}
