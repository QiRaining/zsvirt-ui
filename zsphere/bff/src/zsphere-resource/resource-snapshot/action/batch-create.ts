import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateVolumeSnapshotAction } from '@/api/zstack/CreateVolumeSnapshotAction'
import { CreateVolumeSnapshotGroupAction } from '@/api/zstack/CreateVolumeSnapshotGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
class BatchCreateVolumeSnapshotPayload {
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
export class BatchCreateVolumeSnapshotInput {
  @Field(() => [BatchCreateVolumeSnapshotPayload])
  payload: BatchCreateVolumeSnapshotPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class BatchCreateVolumeSnapshotService extends ActionService {
  @Inject() singleAction: CreateVolumeSnapshotAction
  @Inject() groupAction: CreateVolumeSnapshotGroupAction

  @Mutation(() => ActionResult)
  batchCreateVolumeSnapshot(@Args('input') input: BatchCreateVolumeSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: BatchCreateVolumeSnapshotPayload, taskId: string) => {
      const { volumeUuid, type, name, description, withMemory } = payload
      let res: any = {}
      if (type === SnapshotType.Single) {
        res = await this.singleAction.call(
          {
            volumeUuid,
            name,
            description
          },
          {
            actionId,
            taskId
          }
        )
      } else {
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
      }

      return {
        id: res.inventory?.uuid,
        inventory: res.inventory
      }
    }

    this.actionHelper(input, 'VolumeSnapshot', actionFn)
    return { actionId }
  }
}
