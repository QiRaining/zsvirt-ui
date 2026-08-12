import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

import { QueryL3NetworkService } from './query/query.service'

@Injectable()
export class L3NetworkDataloader {
  @Inject() queryL3NetworkService: QueryL3NetworkService

  private l3NetworkDataloader

  private l3NetworkMap: any = {}
  private params: IQueryAction = {}

  constructor() {
    this.l3NetworkDataloader = new DataLoader(this._query)
  }

  query(uuid, l3NetworkUuid, params: IQueryAction = {}) {
    this.l3NetworkMap[uuid] = {
      uuid,
      l3NetworkUuid
    }
    this.params = params
    return this.l3NetworkDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const l3NetworkUuids = uuids.map(uuid => this.l3NetworkMap[uuid].l3NetworkUuid)

    const { conditions: _conditions = [], ..._params } = this.params
    const conditions = _conditions.concat([{ key: 'uuid', op: Op.in, values: l3NetworkUuids }])

    const params = {
      conditions,
      start: 0,
      limit: 1000,
      ..._params
    }

    const resp = await this.queryL3NetworkService.query(params)
    const netowrkList = resp.list
    return uuids.map(uuid => {
      const l3Network = netowrkList.find(_l3 => _l3.uuid === this.l3NetworkMap[uuid].l3NetworkUuid)
      if (l3Network) {
        return l3Network
      } else {
        return null
      }
    })
  }
}
