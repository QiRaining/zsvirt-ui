import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { SyncDatabaseBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncDatabaseBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { getRemoteBackupStorage } from './scan-db'

@InputType()
export class SyncDatabaseBackupToRemotePayload {
  @Field(() => String)
  uuid?: string

  @Field(() => String, { description: '源镜像服务器 UUID' })
  srcBackupStorageUuid: string
}

@InputType()
class SyncDatabaseBackupToRemoteInput {
  @Field(() => [SyncDatabaseBackupToRemotePayload])
  payload: SyncDatabaseBackupToRemotePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncDatabaseBackupToRemoteService extends ActionService {
  @Inject() zqlService: ZQLService

  @Inject()
  syncDatabaseBackupFromImageStoreBackupStorageAction: SyncDatabaseBackupFromImageStoreBackupStorageAction

  private dstBackupStorageUuid: string
  @Mutation(() => ActionResult)
  async syncDatabaseBackupToRemote(@Args('input') input: SyncDatabaseBackupToRemoteInput) {
    const actionId = input.action.actionId
    const remoteBackupStorages = await getRemoteBackupStorage.bind(this)()

    const remoteBackupStorageUuids = remoteBackupStorages.map(({ uuid }) => uuid)
    this.dstBackupStorageUuid = remoteBackupStorageUuids?.[0]

    this.actionHelper(
      input,
      'BackupData',
      async (payload: SyncDatabaseBackupToRemotePayload, taskId: string) => {
        const { uuid, srcBackupStorageUuid } = payload

        const result = await this.syncDatabaseBackupFromImageStoreBackupStorageAction.call(
          {
            uuid,
            srcBackupStorageUuid,
            dstBackupStorageUuid: this.dstBackupStorageUuid
          },
          {
            actionId,
            taskId
          }
        )
        return {
          id: actionId,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}

export interface SyncBackupFromImageStoreBackupStorageActionParam {
  uuid: string
  srcBackupStorageUuid: string
  dstBackupStorageUuid: string
}

export interface SyncVmBackupFromImageStoreBackupStorageActionParam {
  groupUuid: string
  srcBackupStorageUuid: string
  dstBackupStorageUuid: string
}
