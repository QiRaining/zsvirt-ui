import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { SyncDatabaseBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncDatabaseBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SyncDatabaseBackupToLocalPayload {
  @Field(() => String)
  uuid?: string

  @Field(() => String, { description: '源镜像服务器 UUID', nullable: true })
  srcBackupStorageUuid?: string

  @Field(() => String, { description: '目标镜像服务器 UUID', nullable: true })
  dstBackupStorageUuid?: string
}

@InputType()
class SyncDatabaseBackupToLocalInput {
  @Field(() => [SyncDatabaseBackupToLocalPayload])
  payload: SyncDatabaseBackupToLocalPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncDatabaseBackupToLocalService extends ActionService {
  @Inject() zqlService: ZQLService

  @Inject()
  syncDatabaseBackupFromImageStoreBackupStorageAction: SyncDatabaseBackupFromImageStoreBackupStorageAction

  @Mutation(() => ActionResult)
  async syncDatabaseBackupToLocal(@Args('input') input: SyncDatabaseBackupToLocalInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BackupData',
      async (payload: SyncDatabaseBackupToLocalPayload, taskId: string) => {
        const { uuid, srcBackupStorageUuid, dstBackupStorageUuid } = payload

        const result = await this.syncDatabaseBackupFromImageStoreBackupStorageAction.call(
          {
            uuid,
            srcBackupStorageUuid,
            dstBackupStorageUuid
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
