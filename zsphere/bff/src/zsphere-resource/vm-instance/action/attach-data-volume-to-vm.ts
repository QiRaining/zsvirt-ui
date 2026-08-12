import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AttachDataVolumeToVmAction,
  AttachDataVolumeToVmResult
} from '@/api/zstack/AttachDataVolumeToVmAction'
import { SetVmBootVolumeAction, SetVmBootVolumeResult } from '@/api/zstack/SetVmBootVolumeAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachDataVolumeToVmPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  volumeUuid: string

  @Field(() => Boolean, { nullable: true })
  isEnableVm?: boolean

  @Field(() => Boolean, { nullable: true })
  isRootVolume?: boolean
}

@InputType()
class AttachDataVolumeToVmInput {
  @Field(() => [AttachDataVolumeToVmPayload])
  payload: AttachDataVolumeToVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachDataVolumeToVmService extends ActionService {
  @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction
  @Inject() startVmInstanceAction: StartVmInstanceAction
  @Inject() setVmBootVolumeAction: SetVmBootVolumeAction

  @Mutation(() => ActionResult)
  attachDataVolumeToVm(@Args('input') input: AttachDataVolumeToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: AttachDataVolumeToVmPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      },
      {
        listenerType: 'AttachDataVolumeToVm'
      }
    )
    return { actionId }
  }

  async actionFn(payload: AttachDataVolumeToVmPayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, volumeUuid, isRootVolume = false, isEnableVm = false } = payload
    let result: AttachDataVolumeToVmResult | SetVmBootVolumeResult
    if (isRootVolume) {
      result = await this.setVmBootVolumeAction.call(
        { vmInstanceUuid, volumeUuid },
        { actionId, taskId }
      )
    } else {
      result = await this.attachDataVolumeToVmAction.call(
        { vmInstanceUuid, volumeUuid },
        { actionId, taskId }
      )
    }

    if (isEnableVm) {
      await this.startVmInstanceAction.call({ uuid: vmInstanceUuid }, { actionId, taskId })
    }
    return {
      id: payload.volumeUuid,
      fields: 'vmInstanceUuid',
      inventory: { ...result.inventory, vmInstanceUuid }
    }
  }
}
