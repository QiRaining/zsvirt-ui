import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { ResizeDataVolumeAction, ResizeDataVolumeResult } from '@/api/zstack/ResizeDataVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ResizeDataVolumePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Float)
  size: number
}

@InputType()
export class ResizeDataVolumeInput {
  @Field(() => [ResizeDataVolumePayload])
  payload: ResizeDataVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ResizeDataVolumeService extends ActionService {
  @Inject() resizeDataVolumeAction: ResizeDataVolumeAction

  @Mutation(() => ActionResult)
  resizeDataVolume(@Args('input') input: ResizeDataVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Volume', async (payload: ResizeDataVolumePayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: ResizeDataVolumePayload, taskId: string, actionId: string) {
    const { uuid, size } = payload
    const result: ResizeDataVolumeResult = await this.resizeDataVolumeAction.call(
      { uuid, size },
      { actionId, taskId }
    )
    return {
      id: payload.uuid,
      fields: 'size',
      inventory: result.inventory
    }
  }
}
