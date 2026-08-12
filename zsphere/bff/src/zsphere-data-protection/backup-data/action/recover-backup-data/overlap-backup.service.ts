import { Inject, Injectable } from '@nestjs/common'
import { includes, keys } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RevertVmFromVmBackupAction } from '@/api/zstack/RevertVmFromVmBackupAction'
import { RevertVolumeFromVolumeBackupAction } from '@/api/zstack/RevertVolumeFromVolumeBackupAction'
import ZQL, { ZOp } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { arrayToMap } from '../../backup-data.service'

@Injectable()
export class OverlapBackupService {
  @Inject()
  private revertVolumeFromVolumeBackupAction: RevertVolumeFromVolumeBackupAction
  @Inject() private revertVmFromVmBackupAction: RevertVmFromVmBackupAction
  @Inject() zqlService: ZQLService

  async getLocalBackupStorage(param, backupStorageRefs) {
    const { zoneUuid } = param

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
  async formatParam(param, backupData) {
    const { backupStorageRefs } = backupData
    const backupStorageUuid = await this.getLocalBackupStorage(param, backupStorageRefs)

    return backupStorageUuid
  }

  async call(payload, backupData, taskAndActionId) {
    const backupStorageUuid = await this.formatParam(payload, backupData)
    const { withVolume: whole } = payload
    const { groupUuid, type, uuid } = backupData

    if (type === 'Root' && groupUuid && whole) {
      return await this.revertVmFromVmBackupAction.call(
        {
          groupUuid,
          backupStorageUuid
        },
        taskAndActionId
      )
    }
    return await this.revertVolumeFromVolumeBackupAction.call(
      {
        uuid,
        backupStorageUuid
      },
      taskAndActionId
    )
  }
}
