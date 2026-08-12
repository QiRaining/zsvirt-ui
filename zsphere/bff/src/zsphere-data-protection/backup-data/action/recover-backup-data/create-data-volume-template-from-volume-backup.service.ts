import { Inject, Injectable } from '@nestjs/common'
import { includes, keys } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateDataVolumeTemplateFromVolumeBackupAction } from '@/api/zstack/CreateDataVolumeTemplateFromVolumeBackupAction'
import ZQL, { ZOp } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { arrayToMap } from '../../backup-data.service'

@Injectable()
export class CreateDataVolumeTemplateFromVolumeBackupService {
  @Inject()
  private createDataVolumeTemplateFromVolumeBackupAction: CreateDataVolumeTemplateFromVolumeBackupAction
  @Inject() zqlService: ZQLService

  async getLocalBackupStorage(payload, backupStorageRefs) {
    const { zoneUuid } = payload

    const zqlLocalObj: ZqlObject = {
      tableName: 'backupstorage',
      condition: {
        'zone.uuid': zoneUuid,
        type: 'ImageStoreBackupStorage',
        __systemTag__: {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        }
      }
    }
    const {
      results: [{ inventories: localBackupStorageList = [] }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    // return localBackupStorage
    const localBackupStorage = arrayToMap(localBackupStorageList)

    const localBackupStorageUuids = keys(localBackupStorage)
    const isLocal = bs => includes(localBackupStorageUuids, bs.backupStorageUuid)
    const localBackupStorageRefs = backupStorageRefs.filter(isLocal)
    const isLegalLocalBackupStorage = bs => {
      const { status, state } = localBackupStorage[bs.backupStorageUuid] as any
      return status === 'Connected' && state === 'Enabled'
    }
    const res = localBackupStorageRefs.filter(isLegalLocalBackupStorage)
    return res.length > 0 ? res[0].backupStorageUuid : localBackupStorageRefs[0].backupStorageUuid
  }

  async call(payload, backupData, taskAndActionId) {
    const { name } = payload

    const { backupStorageRefs, uuid: backupUuid } = backupData

    const backupStorageUuid = await this.getLocalBackupStorage(payload, backupStorageRefs)

    return await this.createDataVolumeTemplateFromVolumeBackupAction.call(
      {
        backupUuid,
        name,
        backupStorageUuid
      },
      taskAndActionId
    )
  }
}
