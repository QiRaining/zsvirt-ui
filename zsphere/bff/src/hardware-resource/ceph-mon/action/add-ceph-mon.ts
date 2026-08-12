import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddMonToCephBackupStorageAction,
  AddMonToCephBackupStorageResult
} from '@/api/zstack/AddMonToCephBackupStorageAction'
import {
  AddMonToCephPrimaryStorageAction,
  AddMonToCephPrimaryStorageResult
} from '@/api/zstack/AddMonToCephPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CephMonType } from '../ceph-mon.model'

@InputType()
class AddCephMonPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  monUrls: string[]

  @Field(() => CephMonType)
  type: CephMonType
}

@InputType()
class AddCephMonInput {
  @Field(() => AddCephMonPayload)
  payload: AddCephMonPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddCephMonService extends ActionService {
  @Inject() addMonToCephBackupStorageAction: AddMonToCephBackupStorageAction
  @Inject() addMonToCephPrimaryStorageAction: AddMonToCephPrimaryStorageAction

  @Mutation(() => ActionResult)
  addCephMon(@Args('input') input: AddCephMonInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'CephMon', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: AddCephMonPayload, taskId: string) => {
      let result
      const { type, ...params } = payload
      if (type === CephMonType.BackupStorage) {
        result = (await this.addMonToCephBackupStorageAction.call(params, {
          actionId,
          taskId
        })) as AddMonToCephBackupStorageResult
      } else {
        result = (await this.addMonToCephPrimaryStorageAction.call(params, {
          actionId,
          taskId
        })) as AddMonToCephPrimaryStorageResult
      }
      return {
        id: actionId,
        inventory: result.inventory
      }
    }
  }
}
