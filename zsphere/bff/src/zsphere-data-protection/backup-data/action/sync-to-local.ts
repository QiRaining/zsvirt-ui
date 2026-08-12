import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RecoverBackupFromImageStoreBackupStorageAction } from '@/api/zstack/RecoverBackupFromImageStoreBackupStorageAction'
import { RecoverVmBackupFromImageStoreBackupStorageAction } from '@/api/zstack/RecoverVmBackupFromImageStoreBackupStorageAction'
import { SyncDatabaseBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncDatabaseBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { BackupResourceType } from '../backup-data.model'
import { getRemoteBackupStorage } from './scan-db'

@InputType()
export class SyncBackupDataToLocalPayload {
  @Field(() => String, {
    description: '卷备份的UUID，和下面的groupUuid 2选1传过来',
    nullable: true
  })
  uuid?: string

  @Field(() => String, { description: '根云盘 UUID', nullable: true })
  groupUuid?: string

  @Field(() => String, { description: '源镜像服务器 UUID' })
  srcBackupStorageUuid: string

  @Field(() => String, {
    description: '备份数据类型: Root | Data',
    nullable: true
  })
  type?: string

  @Field(() => BackupResourceType, { nullable: true })
  backupType: BackupResourceType
}

@InputType()
class SyncBackupDataToLocalInput {
  @Field(() => [SyncBackupDataToLocalPayload])
  payload: SyncBackupDataToLocalPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncBackupDataToLocalService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  syncDatabaseBackupFromImageStoreBackupStorageAction: SyncDatabaseBackupFromImageStoreBackupStorageAction
  @Inject()
  recoverBackupFromImageStoreBackupStorageAction: RecoverBackupFromImageStoreBackupStorageAction
  @Inject()
  recoverVmBackupFromImageStoreBackupStorageAction: RecoverVmBackupFromImageStoreBackupStorageAction

  @Mutation(() => ActionResult)
  async syncBackupDataToLocal(@Args('input') input: SyncBackupDataToLocalInput) {
    const actionId = input.action.actionId
    const remoteBackupStorages = await getRemoteBackupStorage.bind(this)()

    const remoteBackupStorageUuids = remoteBackupStorages.map(({ uuid }) => uuid)

    this.actionHelper(input, 'BackupData', this.action(actionId, remoteBackupStorageUuids?.[0]))
    return { actionId }
  }

  action(actionId, remoteBsUuid = '') {
    return async (payload: SyncBackupDataToLocalPayload, taskId: string) => {
      const { type, uuid, groupUuid, srcBackupStorageUuid, backupType } = payload
      let result

      if (backupType === BackupResourceType.Database) {
        result = await this.syncDatabaseBackupFromImageStoreBackupStorageAction.call({
          uuid,
          srcBackupStorageUuid,
          dstBackupStorageUuid: remoteBsUuid
        })
      }
      if (type === 'Root' && groupUuid) {
        const param = {
          groupUuid: groupUuid,
          srcBackupStorageUuid: srcBackupStorageUuid,
          dstBackupStorageUuid: remoteBsUuid
        }
        result = await this.recoverVmBackupFromImageStoreBackupStorageAction.call(param, {
          actionId,
          taskId
        })
      } else {
        const param = {
          uuid: uuid,
          srcBackupStorageUuid: srcBackupStorageUuid,
          dstBackupStorageUuid: remoteBsUuid
        }
        result = await this.recoverBackupFromImageStoreBackupStorageAction.call(param, {
          actionId,
          taskId
        })
      }
      return {
        id: actionId,
        inventory: result.inventory
      }
    }
  }
}
