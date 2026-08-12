import { Inject, Injectable } from '@nestjs/common'
import { cloneDeep, find, findIndex, includes, isArray } from 'lodash'

import { CreateVmFromVmBackupAction } from '@/api/zstack/CreateVmFromVmBackupAction'

@Injectable()
export class CreateVmFromVmBackupService {
  @Inject() private createVmFromVmBackupAction: CreateVmFromVmBackupAction

  async formatParam(_param, backupData) {
    const param = cloneDeep(_param)

    const { groupUuid, metadata } = backupData

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
      vmNicParams,
      zoneUuid,
      clusterUuid,
      hostUuid,
      primaryStorageUuidForRootVolume,
      rootVolumeSystemTags,
      name,
      description,
      cpuNum,
      memorySize,
      reservedMemorySize,
      strategy,

      primaryStorageUuidForDataVolume,
      dataVolumeSystemTags,
      diskAOs,
      resetTpm
    } = param

    return {
      l3NetworkUuids,
      defaultL3NetworkUuid,
      vmNicParams,
      hostUuid,
      primaryStorageUuidForRootVolume,
      dataVolumeSystemTags,
      rootVolumeSystemTags,
      name,
      description,
      primaryStorageUuidForDataVolume,
      groupUuid,
      systemTags,
      cpuNum,
      memorySize,
      reservedMemorySize,
      strategy,
      zoneUuid,
      clusterUuid,
      diskAOs,
      resetTpm
    }
  }

  async call(payload, backupData, taskAndActionId) {
    const param = await this.formatParam(payload, backupData)
    return await this.createVmFromVmBackupAction.call(param, taskAndActionId)
  }
}
