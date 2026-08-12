import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { CreateDataVolumeFromVolumeBackupAction } from '@/api/zstack/CreateDataVolumeFromVolumeBackupAction'

import { BackupProvisionType } from '../../backup-data.model'

@Injectable()
export class CreateDataVolumeFromVolumeBackupService {
  @Inject()
  private createDataVolumeFromVolumeBackupAction: CreateDataVolumeFromVolumeBackupAction

  async formatParam(_param, backupData) {
    const { backupUuid, ...param } = _.cloneDeep(_param)

    const { uuid } = backupData

    const _backupUuid = backupUuid || uuid

    const {
      systemTags = [],
      name,
      description,
      primaryStorageUuid,
      vmInstanceUuid,
      virtioSCSI,
      thinProvision
    } = param

    if (virtioSCSI) {
      systemTags.push('capability::virtio-scsi')
    }
    if (thinProvision === BackupProvisionType.ThinProvision) {
      systemTags.push('volumeProvisioningStrategy::ThinProvisioning')
    } else if (thinProvision === BackupProvisionType.ThickProvision) {
      systemTags.push('volumeProvisioningStrategy::ThickProvisioning')
    }

    return {
      name,
      description,
      backupUuid: _backupUuid,
      vmInstanceUuid,
      primaryStorageUuid,
      systemTags
    }
  }

  async call(payload, backupData, taskAndActionId) {
    const param = await this.formatParam(payload, backupData)
    return await this.createDataVolumeFromVolumeBackupAction.call(param, taskAndActionId)
  }
}
