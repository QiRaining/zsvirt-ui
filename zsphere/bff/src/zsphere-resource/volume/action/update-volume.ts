import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateVolumeAction } from '@/api/zstack/UpdateVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { UpdateVolumeInput } from '../model/volume.model'

@InputType()
export class UpdateVolumeActionInput {
  @Field(() => UpdateVolumeInput)
  payload: UpdateVolumeInput

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVolumeService extends ActionService {
  @Inject() updateVolumeAction: UpdateVolumeAction

  @Mutation(() => ActionResult)
  updateVolume(@Args('input') input: UpdateVolumeActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Volume', async (payload: UpdateVolumeInput, taskId: string) => {
      const { uuid, name, description } = payload

      const res = await this.updateVolumeAction.call(
        {
          uuid,
          name,
          description
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'name,description,lastOpDate',
        inventory: res.inventory
      }
    })
    return { actionId }
  }
}
