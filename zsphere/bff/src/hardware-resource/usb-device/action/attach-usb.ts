import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AttachUsbDeviceToVmAction,
  AttachUsbDeviceToVmResult
} from '@/api/zstack/AttachUsbDeviceToVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachUsbDeviceToVmPayload {
  @Field(() => String)
  usbDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  attachType?: string
}

@InputType()
class AttachUsbDeviceToVmInput {
  @Field(() => [AttachUsbDeviceToVmPayload])
  payload: AttachUsbDeviceToVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachUsbDeviceToVmService extends ActionService {
  @Inject() attach: AttachUsbDeviceToVmAction

  @Mutation(() => ActionResult)
  attachUsbDeviceToVm(@Args('input') input: AttachUsbDeviceToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'UsbDevice',
      async (payload: AttachUsbDeviceToVmPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: AttachUsbDeviceToVmPayload, taskId: string, actionId: string) {
    const { usbDeviceUuid, vmInstanceUuid, attachType } = payload
    await this.attach.call({ usbDeviceUuid, vmInstanceUuid, attachType }, { actionId, taskId })
    return {
      id: payload.usbDeviceUuid
    }
  }
}
