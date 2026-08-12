import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { DeleteDatabaseBackupAction } from '@/api/zstack/DeleteDatabaseBackupAction'
import { ExportDatabaseBackupFromBackupStorageAction } from '@/api/zstack/ExportDatabaseBackupFromBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@InputType()
export class ExportBackupDatabaseUrlPayload {
  @Field(() => String)
  uuid?: string

  @Field(() => String, { nullable: true })
  backupStorageUuid?: string
}

@InputType()
class ExportBackupDatabaseUrlListInput {
  @Field(() => ExportBackupDatabaseUrlPayload)
  payload: ExportBackupDatabaseUrlPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExportBackupDatabaseUrlService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() deleteDatabaseBackupAction: DeleteDatabaseBackupAction

  @Inject()
  exportDatabaseBackupFromBackupStorageAction: ExportDatabaseBackupFromBackupStorageAction

  @Mutation(() => ActionResult)
  async exportDatabaseBackupUrl(@Args('input') input: ExportBackupDatabaseUrlListInput) {
    const actionId = input.action.actionId

    const actionFn = async (
      { uuid: databaseBackupUuid, backupStorageUuid }: ExportBackupDatabaseUrlPayload,
      taskId: string
    ) => {
      const baseCondition = {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'databasebackupStorageRef',
            fields: ['backupStorageUuid'],
            condition: {
              databaseBackupUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'databasebackup',
                    fields: ['uuid'],
                    condition: {
                      uuid: databaseBackupUuid
                    }
                  }
                }
              }
            }
          }
        }
      }

      const queryDatabasebackupStorageRef = async (uuid: string) => {
        const zqlObj: ZqlObject = {
          tableName: 'databasebackupStorageRef',
          condition: {
            backupStorageUuid: uuid,
            databaseBackupUuid
          }
        }

        const {
          results: [{ inventories }]
        } = await this.zqlService.call(ZQL.stringify(zqlObj))

        return inventories?.[0]?.exportUrl
      }

      let _backupStorageUuid: string
      if (!backupStorageUuid) {
        // 同步到本地 本地备份服务器 uuid = _backupStorageUuid
        const zqlLocalObj: ZqlObject = {
          tableName: 'backupstorage',
          condition: {
            type: 'ImageStoreBackupStorage',
            __systemTag__: {
              [ZOp.in]: ['onlybackup', 'allowbackup']
            },
            uuid: baseCondition
          }
        }
        const {
          results: [{ inventories: localList }]
        } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))
        // if (localList?.length > 0) {
        //   const exportUrl = await queryDatabasebackupStorageRef(localList?.[0]?.uuid)
        //   if (exportUrl) return exportUrl
        // }
        _backupStorageUuid = localList?.[0]?.uuid
        if (!_backupStorageUuid) {
          // 同步到远端 远端备份服务器 uuid = _backupStorageUuid
          const zqlRemoteObj: ZqlObject = {
            tableName: 'backupstorage',
            condition: {
              type: 'ImageStoreBackupStorage',
              __systemTag__: {
                [ZOp.in]: ['aliyun', 'remotebackup']
              },
              uuid: baseCondition
            }
          }

          const {
            results: [{ inventories: remoteList }]
          } = await this.zqlService.call(ZQL.stringify(zqlRemoteObj))

          // if (remoteList?.length > 0 && remoteList?.[0]?.exportUrl) {
          //   const exportUrl = await queryDatabasebackupStorageRef(localList?.[0]?.uuid)
          //   if (exportUrl) return exportUrl
          // }

          _backupStorageUuid = remoteList?.[0]?.uuid
        }

        backupStorageUuid = _backupStorageUuid
      }

      const exportUrl = await queryDatabasebackupStorageRef(backupStorageUuid)
      if (exportUrl) {
        return {
          id: actionId,
          inventory: {
            url: exportUrl
          }
        }
      }

      const { databaseBackupUrl } = await this.exportDatabaseBackupFromBackupStorageAction.call(
        {
          backupStorageUuid,
          databaseBackupUuid
        },
        {
          actionId,
          taskId
        }
      )
      // return databaseBackupUrl
      return {
        id: actionId,
        inventory: {
          url: databaseBackupUrl
        }
      }
    }

    this.actionHelper(input, 'BackupData', actionFn)
    return { actionId }
  }
}
