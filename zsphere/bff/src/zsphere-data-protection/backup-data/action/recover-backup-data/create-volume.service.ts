import { Inject, Injectable } from '@nestjs/common'

import { Op } from '@/api/zstack/base/query-base'
import { CreateDataVolumeFromVolumeTemplateAction } from '@/api/zstack/CreateDataVolumeFromVolumeTemplateAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'

import { BackupProvisionType } from '../../backup-data.model'

@Injectable()
export class CreateBackupDataVolumeService {
  @Inject()
  private createDataVolumeFromVolumeTemplateAction: CreateDataVolumeFromVolumeTemplateAction
  @Inject() private queryPrimaryStorageAction: QueryPrimaryStorageAction

  async getPrimaryStorage(uuid: string) {
    const { inventories: [primaryStorage] = [] } = await this.queryPrimaryStorageAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    })
    return primaryStorage
  }
  getVolumeParam(param) {
    // const param = task.input

    const msg: any = {
      name: param.name,
      description: param.description
    }
    msg.systemTags = []
    if (param.virtioSCSI) {
      msg.systemTags.push('capability::virtio-scsi')
      // if (param.shareable) {
      //   msg.systemTags.push('ephemeral::shareable')
      // }
    }
    if (param.thinProvision === BackupProvisionType.ThinProvision) {
      msg.systemTags.push('volumeProvisioningStrategy::ThinProvisioning')
    } else if (param.thinProvision === BackupProvisionType.ThickProvision) {
      msg.systemTags.push('volumeProvisioningStrategy::ThickProvisioning')
    }
    // let ps
    if (param.primaryStorageUuid) {
      msg.primaryStorageUuid = param.primaryStorageUuid
      // ps = rootState.db.primarystorage[param.primaryStorageUuid]
      // ps = this.getPrimaryStorage(param.primaryStorageUuid)
    }
    // if (ps && ps.type === 'Ceph' && param.poolName) {
    //   msg.systemTags.push('ceph::pool::' + param.poolName)
    // }
    // create volume by volumeOffering
    // if (param.diskOfferingUuid) {
    //   msg.diskOfferingUuid = param.diskOfferingUuid
    //   if (ps && ps.type === 'LocalStorage') {
    //     msg.systemTags.push('localStorage::hostUuid::' + param.hostUuid + '')
    //   }
    // }
    // create volume by volumeImage
    if (param.hostUuid) {
      msg.hostUuid = param.hostUuid
    }

    return msg
  }

  async call(payload, createDataVolumeTemplateFromVolumeBackupData, taskAndActionId) {
    const { uuid: imageUuid } = createDataVolumeTemplateFromVolumeBackupData

    const param = this.getVolumeParam(payload)

    return await this.createDataVolumeFromVolumeTemplateAction.call(
      {
        ...param,
        imageUuid
      },
      taskAndActionId
    )
  }
}
