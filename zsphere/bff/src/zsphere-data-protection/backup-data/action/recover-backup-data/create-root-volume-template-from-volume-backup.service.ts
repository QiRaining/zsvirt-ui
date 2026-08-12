import { Inject, Injectable } from '@nestjs/common'
import { cloneDeep, find, includes, isArray, keys } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateRootVolumeTemplateFromVolumeBackupAction } from '@/api/zstack/CreateRootVolumeTemplateFromVolumeBackupAction'
import ZQL, { ZOp } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { arrayToMap } from '../../backup-data.service'

@Injectable()
export class CreateRootVolumeTemplateFromVolumeBackupService {
  @Inject()
  private createRootVolumeTemplateFromVolumeBackupAction: CreateRootVolumeTemplateFromVolumeBackupAction
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

  async formatParam(backupData, _param) {
    // const param = task.input
    const param = cloneDeep(_param)
    const { name, backupStorageRefs, metadata } = backupData

    const { vmSystemTags, platform } = JSON.parse(metadata)

    if (isArray(vmSystemTags)) {
      const shouldSetQ35 = vmSystemTags.some(
        tag => includes(tag, 'vmMachineType::q35') || includes(tag, 'bootMode::UEFI')
      )
      if (shouldSetQ35) {
        param.systemTags.push('vmMachineType::q35')
      }
      const cleanTraffic = find(vmSystemTags, tag => includes(tag, 'cleanTraffic'))
      if (cleanTraffic) {
        param.systemTags.push(cleanTraffic)
      }
    }
    const backupStorageUuid = await this.getLocalBackupStorage(param, backupStorageRefs)
    // const event = self.createEvent('backupData.action.new', name)

    return backupStorageUuid
  }

  async call(payload, backupData, taskAndActionId) {
    const { name } = payload

    const { uuid: backupUuid, metadata } = backupData
    const _metadata = JSON.parse(metadata)
    const { platform } = _metadata

    const backupStorageUuid = await this.formatParam(backupData, payload)

    return await this.createRootVolumeTemplateFromVolumeBackupAction.call(
      {
        backupUuid,
        name,
        backupStorageUuid,
        platform
      },
      taskAndActionId
    )
  }
}
