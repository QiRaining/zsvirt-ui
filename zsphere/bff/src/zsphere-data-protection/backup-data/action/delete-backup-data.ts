import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { DeleteDatabaseBackupAction } from '@/api/zstack/DeleteDatabaseBackupAction'
import { DeleteVmBackupAction } from '@/api/zstack/DeleteVmBackupAction'
import { DeleteVolumeBackupAction } from '@/api/zstack/DeleteVolumeBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { BackupResourceType } from '../backup-data.model'
import { getRemoteBackupStorage } from './scan-db'

@InputType()
export class DeleteBackupDataPayload {
  @Field(() => String, {
    description: '卷备份的UUID，和下面的groupUuid 2选1传过来',
    nullable: true
  })
  uuid?: string

  @Field(() => String, { description: '根云盘 UUID', nullable: true })
  groupUuid?: string

  @Field(() => [String], { description: '源镜像服务器 UUIDs', nullable: true })
  backupStorageUuids: string[]

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: '后端默认为 false ，前端需要使用这个参数让默认处理依赖关系。'
  })
  handleDependency?: boolean

  @Field(() => String, {
    description: '备份数据类型: Root | Data',
    nullable: true
  })
  type: string

  @Field(() => String, { description: '', nullable: true })
  bsUuid: string

  @Field(() => Boolean)
  remote: boolean

  @Field(() => Boolean)
  whole: boolean

  @Field(() => BackupResourceType, { nullable: true })
  backupType: BackupResourceType
}

@InputType()
class DeleteBackupDataListInput {
  @Field(() => [DeleteBackupDataPayload])
  payload: DeleteBackupDataPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBackupDataService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() deleteVmBackupAction: DeleteVmBackupAction
  @Inject() deleteVolumeBackupAction: DeleteVolumeBackupAction
  @Inject() deleteDatabaseBackupAction: DeleteDatabaseBackupAction

  @Mutation(() => ActionResult)
  async deleteBackupDataList(@Args('input') input: DeleteBackupDataListInput) {
    const actionId = input.action.actionId

    const remoteBackupStorages = await getRemoteBackupStorage.bind(this)()

    const remoteBackupStorageUuids = remoteBackupStorages.map(({ uuid }) => uuid)
    this.actionHelper(input, 'BackupData', this.action(actionId, remoteBackupStorageUuids), {
      listenerType: 'DeleteBackupData'
    })
    return { actionId }
  }

  action(actionId, remoteBackupStorageUuids: string[]) {
    return async (payload: DeleteBackupDataPayload, taskId: string) => {
      const {
        type,
        uuid,
        groupUuid,
        handleDependency,
        backupStorageUuids,
        bsUuid,
        remote,
        whole,
        backupType
      } = payload

      let param: any = {}
      let localBackupStorageUuids = []
      if (!remote && bsUuid) {
        param = {
          backupStorageUuids: bsUuid
        }
      }
      if (!remote && !bsUuid) {
        localBackupStorageUuids = _.difference(backupStorageUuids, remoteBackupStorageUuids)
        if (localBackupStorageUuids && localBackupStorageUuids.length > 0) {
          param = {
            backupStorageUuids: localBackupStorageUuids
          }
        }
      }

      if (backupType === BackupResourceType.Database) {
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
      }

      if (type === 'Root' && groupUuid && whole) {
        param = {
          groupUuid: groupUuid,
          handleDependency,
          ...param
        } as DeleteVmBackupActionParam
        await this.deleteVmBackupAction.call(param, {
          actionId,
          taskId
        })
      } else {
        param = {
          uuid: uuid,
          handleDependency,
          ...param
        } as DeleteVolumeBackupActionParam
        await this.deleteVolumeBackupAction.call(param, {
          actionId,
          taskId
        })
      }

      return {
        id: actionId
      }
    }
  }

  private async _queryRemoteBackupStorage() {
    const remoteBackupStorageZql = ZQL.stringify({
      tableName: 'backupstorage',
      condition: {
        type: 'ImageStoreBackupStorage',
        __systemTag__: {
          [ZOp.in]: ['aliyun', 'remotebackup']
        }
      },
      namedAs: 'remoteBackupStorage'
    })
    return this.zqlService.call(remoteBackupStorageZql)
  }
}

export interface DeleteVolumeBackupActionParam {
  uuid: string
  backupStorageUuids?: any[]
  handleDependency?: boolean
}

export interface DeleteVmBackupActionParam {
  groupUuid: string
  backupStorageUuids?: any[]
  handleDependency?: boolean
}
