import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { ResizeRootVolumeAction, ResizeRootVolumeResult } from '@/api/zstack/ResizeRootVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ResizeRootVolumePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Float)
  size: number
}

@InputType()
class ResizeRootVolumeInput {
  @Field(() => [ResizeRootVolumePayload])
  payload: ResizeRootVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ResizeRootVolumeService extends ActionService {
  @Inject() resizeRootVolumeAction: ResizeRootVolumeAction

  @Mutation(() => ActionResult)
  resizeRootVolume(@Args('input') input: ResizeRootVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: ResizeRootVolumePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: ResizeRootVolumePayload, taskId: string, actionId: string) {
    const { uuid, size } = payload
    const result: ResizeRootVolumeResult = await this.resizeRootVolumeAction.call(
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
