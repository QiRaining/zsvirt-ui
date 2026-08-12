import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachDataVolumeFromVmAction,
  DetachDataVolumeFromVmResult
} from '@/api/zstack/DetachDataVolumeFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachDataVolumeFromVmPayload {
  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  uuid: string
}

@InputType()
export class DetachDataVolumeFromVmInput {
  @Field(() => [DetachDataVolumeFromVmPayload])
  payload: DetachDataVolumeFromVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachDataVolumeFromVmService extends ActionService {
  @Inject() detachDataVolumeFromVmAction: DetachDataVolumeFromVmAction

  @Mutation(() => ActionResult)
  detachDataVolumeFromVm(@Args('input') input: DetachDataVolumeFromVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: DetachDataVolumeFromVmPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      },
      {
        listenerType: 'DetachDataVolumeFromVm'
      }
    )
    return { actionId }
  }

  async actionFn(payload: DetachDataVolumeFromVmPayload, taskId: string, actionId: string) {
    const { vmUuid, uuid } = payload
    const result: DetachDataVolumeFromVmResult = await this.detachDataVolumeFromVmAction.call(
      { vmUuid, uuid },
      { actionId, taskId }
    )
    return {
      id: uuid,
      fields: 'vmInstanceUuid',
      inventory: { vmInstanceUuid: null }
    }
  }
}
