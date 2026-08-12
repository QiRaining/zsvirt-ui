import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { SyncDatabaseBackupAction } from '@/api/zstack/SyncDatabaseBackupAction'
import { SyncVmBackupAction } from '@/api/zstack/SyncVmBackupAction'
import { SyncVolumeBackupAction } from '@/api/zstack/SyncVolumeBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

@InputType()
class ScanDataZSVBackupStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  currentZoneUuid: string

  @Field(() => String, { nullable: true })
  backupStorageType?: string
}

@InputType()
class ScanDataZSVBackupStorageInput {
  @Field(() => [ScanDataZSVBackupStoragePayload])
  payload: ScanDataZSVBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ScanDataZSVBackupStorageService extends ActionService {
  @Inject()
  dataBaseAction: SyncDatabaseBackupAction
  @Inject()
  VMAction: SyncVmBackupAction
  @Inject()
  VolumeAction: SyncVolumeBackupAction
  @Inject() ZQLService: ZQLService

  @Mutation(() => ActionResult)
  scanDataZSVBackupStorage(@Args('input') input: ScanDataZSVBackupStorageInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ScanDataZSVBackupStoragePayload, taskId: string) => {
      return await this.scanDataAction(payload, actionId, taskId)
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }

  async scanDataAction(payload: ScanDataZSVBackupStoragePayload, actionId: string, taskId: string) {
    const { uuid, currentZoneUuid, backupStorageType } = payload

    const task = []

    task.push(
      this.dataBaseAction.call(
        { imageStoreUuid: uuid },
        {
          actionId,
          taskId
        }
      )
    )
    task.push(
      this.VolumeAction.call(
        { imageStoreUuid: uuid },
        {
          actionId,
          taskId
        }
      )
    )
    task.push(
      this.VMAction.call(
        { imageStoreUuid: uuid },
        {
          actionId,
          taskId
        }
      )
    )

    await Promise.all(task)

    const zql = ZQL.multStringify([
      {
        action: ZQLAction.COUNT,
        tableName: 'volumebackup',
        condition: {
          [ZOp.and]: {
            status: 'Ready',
            type: 'Root',
            'backupStorage.uuid': uuid,
            'backupStorage.__systemTag__': {
              [ZOp.in]:
                backupStorageType === 'remotebackup'
                  ? ['remotebackup']
                  : ['onlybackup', 'allowbackup']
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'databasebackup',
        condition: {
          [ZOp.and]: {
            status: 'Ready',
            'backupStorage.uuid': uuid,
            'backupStorage.__systemTag__': {
              [ZOp.in]:
                backupStorageType === 'remotebackup'
                  ? ['remotebackup']
                  : ['onlybackup', 'allowbackup']
            }
          }
        }
      }
    ])
    const result = await this.ZQLService.call(zql)
    return {
      id: payload.uuid,
      inventory: result
    }
  }
}
