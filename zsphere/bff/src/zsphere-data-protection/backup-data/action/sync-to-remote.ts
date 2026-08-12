import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  SyncBackupFromImageStoreBackupStorageAction,
  SyncBackupFromImageStoreBackupStorageResult
} from '@/api/zstack/SyncBackupFromImageStoreBackupStorageAction'
import { SyncDatabaseBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncDatabaseBackupFromImageStoreBackupStorageAction'
import {
  SyncVmBackupFromImageStoreBackupStorageAction,
  SyncVmBackupFromImageStoreBackupStorageResult
} from '@/api/zstack/SyncVmBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { getRemoteBackupStorage } from './scan-db'

@InputType()
export class SyncBackupFromImageStoreBackupStoragePayload {
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
}

@InputType()
class SyncBackupDataToRemoteInput {
  @Field(() => [SyncBackupFromImageStoreBackupStoragePayload])
  payload: SyncBackupFromImageStoreBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncBackupFromImageStoreBackupStorageService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  syncBackupFromImageStoreBackupStorageAction: SyncBackupFromImageStoreBackupStorageAction
  @Inject()
  syncVmBackupFromImageStoreBackupStorageAction: SyncVmBackupFromImageStoreBackupStorageAction
  @Inject()
  syncDatabaseBackupFromImageStoreBackupStorageAction: SyncDatabaseBackupFromImageStoreBackupStorageAction

  @Mutation(() => ActionResult)
  async syncBackupToRemote(@Args('input') input: SyncBackupDataToRemoteInput) {
    const actionId = input.action.actionId
    const remoteBackupStorages = await getRemoteBackupStorage.bind(this)()

    const remoteBackupStorageUuids = remoteBackupStorages.map(({ uuid }) => uuid)

    this.actionHelper(input, 'BackupData', this.action(actionId, remoteBackupStorageUuids?.[0]))
    return { actionId }
  }

  action(actionId, remoteBsUuid = '') {
    return async (payload: SyncBackupFromImageStoreBackupStoragePayload, taskId: string) => {
      const { type, uuid, groupUuid, srcBackupStorageUuid } = payload
      let result

      if (type === 'Root' && groupUuid) {
        const param: SyncVmBackupFromImageStoreBackupStorageActionParam = {
          groupUuid: groupUuid,
          srcBackupStorageUuid: srcBackupStorageUuid,
          dstBackupStorageUuid: remoteBsUuid
        }
        result = (await this.syncVmBackupFromImageStoreBackupStorageAction.call(param, {
          actionId,
          taskId
        })) as SyncBackupFromImageStoreBackupStorageResult
      } else {
        const param: SyncBackupFromImageStoreBackupStorageActionParam = {
          uuid: uuid,
          srcBackupStorageUuid: srcBackupStorageUuid,
          dstBackupStorageUuid: remoteBsUuid
        }
        result = (await this.syncBackupFromImageStoreBackupStorageAction.call(param, {
          actionId,
          taskId
        })) as SyncVmBackupFromImageStoreBackupStorageResult
      }
      return {
        id: actionId,
        inventory: result.inventory
      }
    }
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
