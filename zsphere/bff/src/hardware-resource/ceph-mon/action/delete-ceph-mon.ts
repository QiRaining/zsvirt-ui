import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveMonFromCephBackupStorageAction } from '@/api/zstack/RemoveMonFromCephBackupStorageAction'
import { RemoveMonFromCephPrimaryStorageAction } from '@/api/zstack/RemoveMonFromCephPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CephMonType } from '../ceph-mon.model'

@InputType()
class DeleteCephMonPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  monHostnames: string[]

  @Field(() => CephMonType)
  type: CephMonType
}

@InputType()
class DeleteCephMonListInput {
  @Field(() => [DeleteCephMonPayload])
  payload: DeleteCephMonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteCephMonService extends ActionService {
  @Inject()
  removeMonFromCephBackupStorageAction: RemoveMonFromCephBackupStorageAction
  @Inject()
  removeMonFromCephPrimaryStorageAction: RemoveMonFromCephPrimaryStorageAction

  @Mutation(() => ActionResult)
  deleteCephMonList(@Args('input') input: DeleteCephMonListInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'CephMon', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: DeleteCephMonPayload, taskId: string) => {
      const { type, ...params } = payload
      if (type === CephMonType.BackupStorage) {
        await this.removeMonFromCephBackupStorageAction.call(params, {
          actionId,
          taskId
        })
      } else {
        await this.removeMonFromCephPrimaryStorageAction.call(params, {
          actionId,
          taskId
        })
      }
      return {
        id: actionId
      }
    }
  }
}
