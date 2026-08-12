import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'

import { QueryPrimaryStorageArgs } from './primary-storage.model'

@Injectable()
export class PrimaryStorageDataloader {
  @Inject() primaryStorageQueryService: PrimaryStorageQueryService

  private dataLoader
  private primaryStorageMap: any = {}

  constructor() {
    this.dataLoader = new DataLoader(this._query)
  }
  query(uuid, primaryStorageUuid) {
    this.primaryStorageMap[uuid] = {
      uuid: uuid,
      primaryStorageUuid: primaryStorageUuid
    }

    return this.dataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const primaryStorageUuids = uuids.map(uuid => this.primaryStorageMap[uuid].primaryStorageUuid)
    const params: QueryPrimaryStorageArgs = {
      conditions: [{ key: 'uuid', op: Op.in, values: primaryStorageUuids }],
      start: 0,
      limit: 1000
    }
    const vmResp = await this.primaryStorageQueryService.query(params)
    const primaryStorageList = vmResp.list
    return uuids.map(uuid => {
      const primaryStorage = primaryStorageList.find(
        primaryStorage => primaryStorage.uuid === this.primaryStorageMap[uuid].primaryStorageUuid
      )
      if (primaryStorage) {
        return primaryStorage
      } else {
        return null
      }
    })
  }
}
