import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachPciDeviceFromVmAction } from '@/api/zstack/DetachPciDeviceFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachPciDeviceFromVMPayload {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
class DetachPciDeviceFromVMInput {
  @Field(() => [DetachPciDeviceFromVMPayload])
  payload: DetachPciDeviceFromVMPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachPciDeviceFromVMService extends ActionService {
  @Inject() detachPciDeviceFromVmAction: DetachPciDeviceFromVmAction

  @Mutation(() => ActionResult)
  detachPciDeviceFromVm(@Args('input') input: DetachPciDeviceFromVMInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PciDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: DetachPciDeviceFromVMPayload, taskId: string) => {
      return this.detachFromVmFn(payload, taskId, actionId)
    }
  }

  async detachFromVmFn(payload: DetachPciDeviceFromVMPayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, pciDeviceUuid } = payload
    await this.detachPciDeviceFromVmAction.call(
      {
        vmInstanceUuid,
        pciDeviceUuid
      },
      { actionId, taskId }
    )
    return {
      id: payload.pciDeviceUuid
    }
  }
}
