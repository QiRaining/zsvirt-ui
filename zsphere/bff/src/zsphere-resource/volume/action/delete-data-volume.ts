import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteDataVolumeAction, DeleteDataVolumeResult } from '@/api/zstack/DeleteDataVolumeAction'
import { ExpungeDataVolumeAction } from '@/api/zstack/ExpungeDataVolumeAction'
import { ActionService } from '@/base/action-service'
import { VolumeStatus } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteDataVolumePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  status?: VolumeStatus
}

@InputType()
export class DeleteDataVolumeInput {
  @Field(() => [DeleteDataVolumePayload])
  payload: DeleteDataVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteDataVolumeService extends ActionService {
  @Inject() deleteDataVolumeAction: DeleteDataVolumeAction
  @Inject() expungeDataVolumeAction: ExpungeDataVolumeAction

  @Mutation(() => ActionResult)
  deleteDataVolume(@Args('input') input: DeleteDataVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: DeleteDataVolumePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId),
      {
        listenerType: 'DeleteDataVolume'
      }
    )
    return { actionId }
  }

  async actionFn(payload: DeleteDataVolumePayload, taskId: string, actionId: string) {
    const { uuid } = payload
    const result: DeleteDataVolumeResult = await this.deleteDataVolumeAction.call(
      { uuid },
      { actionId, taskId }
    )
    if (payload?.status === VolumeStatus.NotInstantiated) {
      await this.expungeDataVolumeAction.call({ uuid }, { actionId, taskId })
    }
    return {
      id: payload.uuid,
      fields: 'status',
      ...result,
      inventory: { status: VolumeStatus.Deleted, uuid }
    }
  }
}
