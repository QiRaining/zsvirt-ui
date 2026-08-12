import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { uniq as _uniq, reduce as _reduce, get as _get } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZoneService } from '@/hardware-resource/zone/zone.service'

@Injectable()
export class ZoneDataloader {
  @Inject() zoneService: ZoneService

  private zoneDataLoader

  private zoneMap: any = {}

  constructor() {
    this.zoneDataLoader = new DataLoader(this._query)
  }

  query(uuid, zoneUuid) {
    this.zoneMap[uuid] = {
      uuid,
      zoneUuid
    }
    return this.zoneDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const zoneUuids = uuids.map(uuid => this.zoneMap[uuid].zoneUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: _uniq(zoneUuids) }],
      start: 0,
      limit: 1000
    }
    const resp = await this.zoneService.getZoneList(params)

    const zoneMap = _reduce(
      resp.list,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid => _get(zoneMap, _get(this.zoneMap, [uuid, 'zoneUuid']), null))
  }
}
