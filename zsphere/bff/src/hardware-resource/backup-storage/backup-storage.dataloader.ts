import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

// import { get as _get, reduce as _reduce } from 'lodash'
import { Op } from '@/api/zstack/base/query-base'
import { BackupStorageService } from '@/hardware-resource/backup-storage/backup-storage.service'

@Injectable()
export class BackupStorageDataloader {
  @Inject() backupStorageService: BackupStorageService

  private backupStorageDataloader
  private backupStorageMap: any = {}

  constructor() {
    this.backupStorageDataloader = new DataLoader(this._query)
  }

  query(uuid, backupStorageUuid) {
    this.backupStorageMap[uuid] = {
      uuid,
      backupStorageUuid
    }
    return this.backupStorageDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const backupStorageUuids = uuids.map(uuid => this.backupStorageMap[uuid].backupStorageUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: backupStorageUuids }],
      start: 0,
      limit: 1000
    }
    const results = await this.backupStorageService.queryList(params)
    const backupStorages = results?.list

    return uuids.map(uuid => {
      const backupStorage = backupStorages.find(
        backupStorage => backupStorage.uuid === this.backupStorageMap[uuid].backupStorageUuid
      )
      if (backupStorage) {
        return backupStorage
      } else {
        return null
      }
    })
  }
}
