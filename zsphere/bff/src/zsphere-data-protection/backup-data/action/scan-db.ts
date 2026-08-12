import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { SyncDatabaseBackupAction } from '@/api/zstack/SyncDatabaseBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
@InputType()
class ScanDatabaseBackupInput {
  @Field(() => String, { nullable: true })
  uuid: string
}

@InputType()
class ScanDatabaseBackupActionInput {
  @Field(() => [ScanDatabaseBackupInput])
  payload: ScanDatabaseBackupInput[]

  @Field(() => ActionInput)
  action: ActionInput
}

export async function getLocalBackupStorage() {
  const zqlObj: ZqlObject = {
    tableName: 'backupstorage',
    condition: {
      type: 'ImageStoreBackupStorage',
      __systemTag__: {
        [ZOp.in]: ['onlybackup', 'allowbackup']
      }
    }
  }

  const {
    results: [{ inventories }]
  } = await this.zqlService.call(ZQL.stringify(zqlObj))

  return inventories
}

export async function getRemoteBackupStorage() {
  const zqlObj: ZqlObject = {
    tableName: 'backupstorage',
    condition: {
      type: 'ImageStoreBackupStorage',
      __systemTag__: {
        [ZOp.in]: ['aliyun', 'remotebackup']
      }
    }
  }

  const {
    results: [{ inventories }]
  } = await this.zqlService.call(ZQL.stringify(zqlObj))

  return inventories
}

// .map(({ localBackupStorage }) => localBackupStorage)
export class ScanDatabaseBackupService extends ActionService {
  @Inject() syncDatabaseBackupAction: SyncDatabaseBackupAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  async scanDatabaseBackups(@Args('input') _input: ScanDatabaseBackupActionInput) {
    const actionId = _input.action.actionId
    const { payload } = _input
    let backupStorageUuids: string[]
    let input = _input
    if (!payload?.length) {
      const localBackupStorages = await getLocalBackupStorage.bind(this)()
      backupStorageUuids = localBackupStorages.map(({ uuid }) => uuid)
      input = {
        ..._input,
        payload: backupStorageUuids.map(uuid => ({ uuid }))
      }
    }
    this.actionHelper(
      input,
      'BackupDatabase',
      async (payload: ScanDatabaseBackupInput, taskId: string) => {
        const { uuid } = payload

        await this.syncDatabaseBackupAction.call(
          {
            imageStoreUuid: uuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
