import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'

import { SlbOfferingQueryService } from './slb-offering-query/slb-offering-query.service'

@Injectable()
export class SlbOfferingDataloader {
  @Inject() slbOfferingQueryService: SlbOfferingQueryService

  private slbOfferingDataloader

  constructor() {
    this.slbOfferingDataloader = new DataLoader(this._query)
  }

  query(slbOfferingUuid) {
    return this.slbOfferingDataloader.load(slbOfferingUuid)
  }

  _query = async (uuids: string[]) => {
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.slbOfferingQueryService.queryList(params)
    const slbOfferings = _reduce(
      _get(resp, 'list', []),
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      return _get(slbOfferings, uuid, null)
    })
  }
}
