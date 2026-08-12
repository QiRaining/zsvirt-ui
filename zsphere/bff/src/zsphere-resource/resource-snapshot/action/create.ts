import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateVolumeSnapshotAction } from '@/api/zstack/CreateVolumeSnapshotAction'
import { CreateVolumeSnapshotGroupAction } from '@/api/zstack/CreateVolumeSnapshotGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
class CreateVolumeSnapshotPayload {
  @Field(() => String, { description: 'uuid', nullable: true })
  volumeUuid?: string

  @Field(() => String, { description: '快照名' })
  name: string

  @Field(() => String, { description: '描述', nullable: true })
  description?: string

  @Field(() => SnapshotType)
  type: SnapshotType

  @Field(() => Boolean, { nullable: true })
  withMemory?: boolean
}

@InputType()
export class CreateVolumeSnapshotInput {
  @Field(() => CreateVolumeSnapshotPayload)
  payload: CreateVolumeSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVolumeSnapshotService extends ActionService {
  @Inject() singleAction: CreateVolumeSnapshotAction
  @Inject() groupAction: CreateVolumeSnapshotGroupAction

  @Mutation(() => ActionResult)
  createVolumeSnapshot(@Args('input') input: CreateVolumeSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateVolumeSnapshotPayload, taskId: string) => {
      const { volumeUuid, name, description, withMemory } = payload
      let res: any = {}
      res = await this.groupAction.call(
        {
          rootVolumeUuid: volumeUuid,
          name,
          description,
          withMemory
        },
        {
          actionId,
          taskId
        }
      )

      return {
        id: res.inventory?.uuid,
        inventory: res.inventory
      }
    }

    this.actionHelper(input, 'VolumeSnapshot', actionFn)
    return { actionId }
  }
}
