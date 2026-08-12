import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachMdevDeviceToVmAction } from '@/api/zstack/AttachMdevDeviceToVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachMdevDeviceToVMPayload {
  @Field(() => String)
  mdevDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
class AttachMdevDeviceToVMInput {
  @Field(() => AttachMdevDeviceToVMPayload)
  payload: AttachMdevDeviceToVMPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachMdevDeviceToVmService extends ActionService {
  @Inject() attachMdevDeviceToVmAction: AttachMdevDeviceToVmAction

  @Mutation(() => ActionResult)
  attachMdevDeviceToVm(@Args('input') input: AttachMdevDeviceToVMInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VGpuDevice', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: AttachMdevDeviceToVMPayload, taskId: string) => {
      const { vmInstanceUuid, mdevDeviceUuid } = payload
      await this.attachMdevDeviceToVmAction.call(
        {
          vmInstanceUuid,
          mdevDeviceUuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.mdevDeviceUuid,
        fields: '',
        inventory: null
      }
    }
  }
}
