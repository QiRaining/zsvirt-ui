import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmBootVolumeAction, SetVmBootVolumeResult } from '@/api/zstack/SetVmBootVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmBootVolumePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  volumeUuid: string
}

@InputType()
export class SetVmBootVolumeInput {
  @Field(() => [SetVmBootVolumePayload])
  payload: SetVmBootVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmBootVolumeService extends ActionService {
  @Inject() setVmBootVolumeAction: SetVmBootVolumeAction

  @Mutation(() => ActionResult)
  setVmBootVolume(@Args('input') input: SetVmBootVolumeInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmBootVolumePayload, taskId: string) => {
        const { vmInstanceUuid, volumeUuid } = payload

        const result: SetVmBootVolumeResult = await this.setVmBootVolumeAction.call(
          { vmInstanceUuid, volumeUuid },
          { actionId, taskId }
        )

        return {
          id: vmInstanceUuid,
          fields: 'rootVolumeUuid',
          inventory: { ...result.inventory, rootVolumeUuid: volumeUuid }
        }
      }
    )

    return { actionId }
  }
}
