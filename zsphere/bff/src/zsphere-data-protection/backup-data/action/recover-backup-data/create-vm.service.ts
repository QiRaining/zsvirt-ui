import { Inject, Injectable } from '@nestjs/common'
import { find, includes, isArray, keys } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateVmInstanceAction } from '@/api/zstack/CreateVmInstanceAction'
import ZQL, { ZOp } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { arrayToMap } from '../../backup-data.service'

@Injectable()
export class CreateVmInstanceService {
  @Inject() private createVmInstanceAction: CreateVmInstanceAction
  @Inject() zqlService: ZQLService

  async getLocalBackupStorage(task, backupStorageRefs) {
    const { zoneUuid } = task.input

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

  async formatParam(backupData, payload) {
    const {
      systemTags,
      l3NetworkUuids,
      defaultL3NetworkUuid,
      instanceOfferingUuid,
      hostUuid,
      primaryStorageUuidForRootVolume,
      dataVolumeSystemTags,
      rootVolumeSystemTags,
      name,
      description
    } = payload
    const { metadata } = backupData
    const { vmSystemTags } = JSON.parse(metadata)

    if (isArray(vmSystemTags)) {
      const shouldSetQ35 = vmSystemTags.some(
        tag => includes(tag, 'vmMachineType::q35') || includes(tag, 'bootMode::UEFI')
      )
      if (shouldSetQ35) {
        systemTags.push('vmMachineType::q35')
      }
      const cleanTraffic = find(vmSystemTags, tag => includes(tag, 'cleanTraffic'))
      if (cleanTraffic) {
        systemTags.push(cleanTraffic)
      }
    }

    return {
      systemTags,
      l3NetworkUuids,
      defaultL3NetworkUuid,
      instanceOfferingUuid,
      hostUuid,
      primaryStorageUuidForRootVolume,
      dataVolumeSystemTags,
      rootVolumeSystemTags,
      name,
      description
    }
  }

  async call(payload, taskAndActionId, backupData, createRootVolumeTemplateFromVolumeBackupData) {
    const param = await this.formatParam(backupData, payload)

    const { uuid: imageUuid } = createRootVolumeTemplateFromVolumeBackupData

    return await this.createVmInstanceAction.call(
      {
        ...param,
        imageUuid
      },
      taskAndActionId
    )
  }
}
