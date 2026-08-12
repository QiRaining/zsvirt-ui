import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

import { QueryL2NetworkArgs } from './l2.network.model'
import { L2NetworkService } from './l2.network.service'

@Injectable()
export class L2NetworkDataloader {
  @Inject() queryL2NetworkService: L2NetworkService

  private l2NetworkDataloader

  private l2NetworkMap: any = {}
  private params: IQueryAction = {}

  constructor() {
    this.l2NetworkDataloader = new DataLoader(this._query)
  }

  query(uuid, l2NetworkUuid, params: IQueryAction = {}) {
    this.l2NetworkMap[uuid] = {
      uuid,
      l2NetworkUuid
    }
    this.params = params
    return this.l2NetworkDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const l2NetworkUuids = uuids.map(uuid => this.l2NetworkMap[uuid].l2NetworkUuid)

    const { conditions: _conditions = [], ..._params } = this.params
    const conditions = _conditions.concat([{ key: 'uuid', op: Op.in, values: l2NetworkUuids }])

    const params = {
      ..._params,
      conditions
    }

    const resp = await this.queryL2NetworkService.query(params as QueryL2NetworkArgs)
    const netowrkList = resp.list
    return uuids.map(uuid => {
      const l2Network = netowrkList.find(_l2 => _l2.uuid === this.l2NetworkMap[uuid].l2NetworkUuid)
      if (l2Network) {
        return l2Network
      } else {
        return null
      }
    })
  }
}
