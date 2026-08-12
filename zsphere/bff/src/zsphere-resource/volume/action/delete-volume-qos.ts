import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVolumeQosAction } from '@/api/zstack/DeleteVolumeQosAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { VolumeQosMode } from '../model/volume.model'

@InputType()
export class DeleteVolumeQosPayload {
  @Field(() => String)
  uuid: string

  @Field(() => VolumeQosMode, { defaultValue: VolumeQosMode.overwrite })
  mode: VolumeQosMode
}

@InputType()
export class DeleteVolumeQosInput {
  @Field(() => [DeleteVolumeQosPayload])
  payload: DeleteVolumeQosPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVolumeQosService extends ActionService {
  @Inject() deleteVolumeQosAction: DeleteVolumeQosAction

  @Mutation(() => ActionResult)
  deleteVolumeQos(@Args('input') input: DeleteVolumeQosInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Volume', async (payload: DeleteVolumeQosPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: DeleteVolumeQosPayload, taskId: string, actionId: string) {
    const { uuid, mode } = payload
    await this.deleteVolumeQosAction.call({ uuid, mode }, { actionId, taskId })
    return {
      id: payload.uuid,
      fields: `bandwidth { volumeBandwidth,volumeBandwidthRead,volumeBandwidthWrite,iopsTotal,iopsRead,iopsWrite }`,
      inventory: {
        bandwidth: {
          volumeBandwidth: -1,
          volumeBandwidthRead: -1,
          volumeBandwidthWrite: -1,
          iopsTotal: -1,
          iopsRead: -1,
          iopsWrite: -1
        }
      }
    }
  }
}
