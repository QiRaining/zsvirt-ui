import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachPciDeviceToVmAction } from '@/api/zstack/AttachPciDeviceToVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachPciDeviceToVMPayload {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
class AttachPciDeviceToVMInput {
  @Field(() => [AttachPciDeviceToVMPayload])
  payload: [AttachPciDeviceToVMPayload]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachPciDeviceToVmService extends ActionService {
  @Inject() attachPciDeviceToVmAction: AttachPciDeviceToVmAction

  @Mutation(() => ActionResult)
  attachPciDeviceToVm(@Args('input') input: AttachPciDeviceToVMInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: AttachPciDeviceToVMPayload, taskId: string) => {
      return this.attachPciDeviceToVmFn(payload, taskId, actionId)
    }
  }

  async attachPciDeviceToVmFn(
    payload: AttachPciDeviceToVMPayload,
    taskId: string,
    actionId: string
  ) {
    const { vmInstanceUuid, pciDeviceUuid } = payload
    await this.attachPciDeviceToVmAction.call(
      {
        vmInstanceUuid,
        pciDeviceUuid
      },
      { actionId, taskId }
    )
    return {
      id: payload.pciDeviceUuid,
      fields: '',
      inventory: null
    }
  }
}
