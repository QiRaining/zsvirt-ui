import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

import { VolumeQueryService } from './volume-query/volume-query.service'

@Injectable()
export class VolumeDataloader {
  @Inject() volumeQueryService: VolumeQueryService

  private VolumeDataloader
  private volumeMap: any = {}

  constructor() {
    this.VolumeDataloader = new DataLoader(this._query)
  }
  query(uuid, volumeUuid) {
    this.volumeMap[uuid] = {
      uuid,
      volumeUuid
    }
    return this.VolumeDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const volumeUuids = uuids.map(uuid => this.volumeMap[uuid].volumeUuid)
    const params: IQueryAction = {
      conditions: [{ key: 'uuid', op: Op.in, values: volumeUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.volumeQueryService.queryList(params)
    const volumes = resp.list
    return uuids.map(uuid => {
      const volume = volumes.find(item => item.uuid === this.volumeMap[uuid].volumeUuid)
      if (volume) {
        return volume
      } else {
        return null
      }
    })
  }
}
