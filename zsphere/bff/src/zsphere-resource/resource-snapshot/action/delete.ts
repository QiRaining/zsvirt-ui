import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { BatchDeleteVolumeSnapshotAction } from '@/api/zstack/BatchDeleteVolumeSnapshotAction'
import { DeleteVolumeSnapshotGroupAction } from '@/api/zstack/DeleteVolumeSnapshotGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
class DeleteVolumeSnapshotPayload {
  @Field(() => [String])
  uuids: string[]

  @Field(() => SnapshotType)
  type: SnapshotType
}

@InputType()
export class DeleteVolumeSnapshotInput {
  @Field(() => DeleteVolumeSnapshotPayload)
  payload: DeleteVolumeSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVolumeSnapshotService extends ActionService {
  @Inject() groupAction: DeleteVolumeSnapshotGroupAction
  @Inject() batchAction: BatchDeleteVolumeSnapshotAction

  @Mutation(() => ActionResult)
  deleteVolumeSnapshot(@Args('input') input: DeleteVolumeSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteVolumeSnapshotPayload, taskId: string) => {
      const { uuids, type } = payload
      let res: any = {}
      if (type == SnapshotType.Group) {
        res = await this.groupAction.call(
          {
            uuid: uuids[0]
          },
          {
            actionId,
            taskId
          }
        )
      } else {
        res = await this.batchAction.call(
          {
            uuids
          },
          {
            actionId,
            taskId
          }
        )
      }
      // 批量操作，如果有失败，需要手动抛错，后端接口外层会返回成功不会抛错
      const errors = _.reduce(
        _.get(res, 'results', []),
        (arr, result) => {
          if (!result.success) {
            arr.push(result)
          }
          return arr
        },
        []
      )

      if (errors?.length > 0) {
        throw new Error(JSON.stringify(errors))
      }

      return {
        id: uuids?.[0],
        inventory: {
          actionType: 'delete'
        }
      }
    }

    this.actionHelper(input, 'VolumeSnapshot', actionFn)
    return { actionId }
  }
}
