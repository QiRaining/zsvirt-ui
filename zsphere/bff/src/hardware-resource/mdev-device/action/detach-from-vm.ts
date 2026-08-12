import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachMdevDeviceFromVmAction } from '@/api/zstack/DetachMdevDeviceFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachMdevDeviceFromVMPayload {
  @Field(() => String)
  mdevDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
class DetachMdevDeviceFromVMInput {
  @Field(() => DetachMdevDeviceFromVMPayload)
  payload: DetachMdevDeviceFromVMPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachMdevDeviceFromVmService extends ActionService {
  @Inject() detachMdevDeviceFromVmAction: DetachMdevDeviceFromVmAction

  @Mutation(() => ActionResult)
  detachMdevDeviceFromVm(@Args('input') input: DetachMdevDeviceFromVMInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VGpuDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: DetachMdevDeviceFromVMPayload, taskId: string) => {
      const { vmInstanceUuid, mdevDeviceUuid } = payload
      await this.detachMdevDeviceFromVmAction.call(
        {
          vmInstanceUuid,
          mdevDeviceUuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.mdevDeviceUuid
      }
    }
  }
}
