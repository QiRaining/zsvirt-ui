import { Inject, Injectable } from '@nestjs/common'
import { cloneDeep, find, findIndex, includes, isArray } from 'lodash'

import { CreateVmFromVolumeBackupAction } from '@/api/zstack/CreateVmFromVolumeBackupAction'

@Injectable()
export class CreateVmFromVolumeBackupService {
  @Inject()
  private createVmFromVolumeBackupAction: CreateVmFromVolumeBackupAction

  async formatParam(_param, backupData) {
    const { backupUuid, ...param } = cloneDeep(_param)

    // const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    // const BackupDataTask = rootTask.children.find(
    //   task => task.service === GetBackupDataService.name
    // )
    // const backupData = get(BackupDataTask, 'result.inventories[0]')

    const { uuid, metadata } = backupData
    const _backupUuid = backupUuid || uuid

    const { vmSystemTags } = JSON.parse(metadata)
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
    const systemTags = param.systemTags
    if (systemTags && systemTags.length > 0) {
      const index = findIndex(systemTags, (tag: any) =>
        includes(tag, 'primaryStorageUuidForDataVolume')
      )
      if (index > -1) {
        param.primaryStorageUuidForDataVolume = systemTags[index].split('::')[1]
        systemTags.splice(index, 1)
        if (systemTags.length === 0) {
          delete param.systemTags
        }
      }
    }

    const {
      l3NetworkUuids,
      defaultL3NetworkUuid,
      instanceOfferingUuid,
      hostUuid,
      primaryStorageUuidForRootVolume,
      rootVolumeSystemTags,
      name,
      description
    } = param

    return {
      l3NetworkUuids,
      defaultL3NetworkUuid,
      instanceOfferingUuid,
      hostUuid,
      primaryStorageUuidForRootVolume,
      rootVolumeSystemTags,
      name,
      description,
      backupUuid: _backupUuid,
      systemTags
    }
  }

  async call(payload, backupData, taskAndActionId) {
    const param = await this.formatParam(payload, backupData)
    return await this.createVmFromVolumeBackupAction.call(param, taskAndActionId)
  }
}
