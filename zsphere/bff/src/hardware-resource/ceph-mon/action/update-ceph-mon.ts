import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  UpdateCephBackupStorageMonAction,
  UpdateCephBackupStorageMonResult
} from '@/api/zstack/UpdateCephBackupStorageMonAction'
import {
  UpdateCephPrimaryStorageMonAction,
  UpdateCephPrimaryStorageMonResult
} from '@/api/zstack/UpdateCephPrimaryStorageMonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CephMonType } from '../ceph-mon.model'

@InputType()
class UpdateCephMonPayload {
  @Field(() => String)
  monUuid: string

  @Field(() => String, { nullable: true })
  sshUsername?: string

  @Field(() => String, { nullable: true })
  sshPassword?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => Int, { nullable: true })
  monPort?: number

  @Field(() => CephMonType)
  type: CephMonType
}

@InputType()
class UpdateCephMonInput {
  @Field(() => UpdateCephMonPayload)
  payload: UpdateCephMonPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateCephMonService extends ActionService {
  @Inject()
  updateCephBackupStorageMonAction: UpdateCephBackupStorageMonAction
  @Inject()
  updateCephPrimaryStorageMonAction: UpdateCephPrimaryStorageMonAction

  @Mutation(() => ActionResult)
  updateCephMon(@Args('input') input: UpdateCephMonInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'CephMon', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UpdateCephMonPayload, taskId: string) => {
      let result
      const { type, ...params } = payload
      if (type === CephMonType.BackupStorage) {
        result = (await this.updateCephBackupStorageMonAction.call(params, {
          actionId,
          taskId
        })) as UpdateCephBackupStorageMonResult
      } else {
        result = (await this.updateCephPrimaryStorageMonAction.call(params, {
          actionId,
          taskId
        })) as UpdateCephPrimaryStorageMonResult
      }
      const monItem = result?.inventory?.mons.find(cv => cv.monUuid === payload.monUuid) || {}
      return {
        id: payload.monUuid,
        fields: 'sshUsername, sshPassword, sshPort, monPort',
        inventory: monItem
      }
    }
  }
}
