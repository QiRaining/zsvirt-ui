import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateVolumeSnapshotAction } from '@/api/zstack/UpdateVolumeSnapshotAction'
import { UpdateVolumeSnapshotGroupAction } from '@/api/zstack/UpdateVolumeSnapshotGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
export class UpdateVolumeSnapshotPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SnapshotType)
  type: SnapshotType
}

@InputType()
class UpdateVolumeSnapshotInput {
  @Field(() => UpdateVolumeSnapshotPayload)
  payload: UpdateVolumeSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVolumeSnapshotService extends ActionService {
  @Inject() singleAction: UpdateVolumeSnapshotAction
  @Inject() groupAction: UpdateVolumeSnapshotGroupAction

  @Mutation(() => ActionResult)
  updateVolumeSnapshot(@Args('input') input: UpdateVolumeSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateVolumeSnapshotPayload, taskId: string) => {
      const { type, uuid, name, description } = payload
      const action = type === SnapshotType.Single ? this.singleAction : this.groupAction
      const { inventory } = await action.call(
        {
          uuid,
          name,
          description
        },
        {
          actionId,
          taskId
        }
      )
      return {
        id: payload.uuid,
        fields: 'name,description,lastOpDate',
        inventory
      }
    }

    this.actionHelper(
      input,
      input.payload.type === SnapshotType.Single ? 'VolumeSnapshot' : 'VolumeSnapshotGroup',
      actionFn
    )
    return { actionId }
  }
}
