import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { DeleteDatabaseBackupAction } from '@/api/zstack/DeleteDatabaseBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { getRemoteBackupStorage } from './scan-db'

@InputType()
export class DeleteDatabaseBackupDataPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  bsUuid: string

  @Field(() => [String], { nullable: true })
  backupStorageUuids: string[]

  @Field(() => Boolean, { nullable: true })
  remote: boolean
}

@InputType()
class DeleteDatabaseBackupDataListInput {
  @Field(() => [DeleteDatabaseBackupDataPayload])
  payload: DeleteDatabaseBackupDataPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteDatabaseBackupDataService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() deleteDatabaseBackupAction: DeleteDatabaseBackupAction

  @Mutation(() => ActionResult, { description: '删除备份数据库' })
  async deleteDatabaseBackupDataList(@Args('input') input: DeleteDatabaseBackupDataListInput) {
    const actionId = input.action.actionId

    const remoteBackupStorages = await getRemoteBackupStorage.bind(this)()

    const remoteBackupStorageUuids = remoteBackupStorages.map(({ uuid }) => uuid)
    this.actionHelper(input, 'BackupData', this.action(actionId, remoteBackupStorageUuids))
    return { actionId }
  }

  action(actionId, remoteBackupStorageUuids: string[]) {
    return async (payload: DeleteDatabaseBackupDataPayload, taskId: string) => {
      const { uuid, bsUuid, remote, backupStorageUuids } = payload

      let param: any = {}
      let localBackupStorageUuids = []
      if (!remote && bsUuid) {
        param = {
          backupStorageUuids: bsUuid
        }
      }

      if (!remote && !bsUuid) {
        localBackupStorageUuids = _.difference(backupStorageUuids, remoteBackupStorageUuids)
        param = {
          backupStorageUuids: localBackupStorageUuids
        }
      }

      await this.deleteDatabaseBackupAction.call(
        {
          ...param,
          uuid
        },
        {
          actionId,
          taskId
        }
      )

      return {
        id: actionId
      }
    }
  }
}
