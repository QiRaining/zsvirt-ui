import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachUsbDeviceFromVmAction } from '@/api/zstack/DetachUsbDeviceFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachUsbDeviceToVmPayload {
  @Field(() => String)
  usbDeviceUuid: string
}

@InputType()
class DetachUsbDeviceToVmInput {
  @Field(() => [DetachUsbDeviceToVmPayload])
  payload: DetachUsbDeviceToVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachUsbDeviceToVmService extends ActionService {
  @Inject() detach: DetachUsbDeviceFromVmAction

  @Mutation(() => ActionResult)
  detachUsbDeviceToVm(@Args('input') input: DetachUsbDeviceToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'UsbDevice',
      async (payload: DetachUsbDeviceToVmPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: DetachUsbDeviceToVmPayload, taskId: string, actionId: string) {
    const { usbDeviceUuid } = payload
    await this.detach.call({ usbDeviceUuid }, { actionId, taskId })
    return {
      id: payload.usbDeviceUuid
    }
  }
}
