import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

import { EipService } from './eip.service'

@Injectable()
export class EipDataloader {
  @Inject() eipService: EipService

  private eipDataloader

  private eipMap: any = {}
  private params: IQueryAction = {}

  constructor() {
    this.eipDataloader = new DataLoader(this._query)
  }

  query(uuid, eipUuid, params: IQueryAction = {}) {
    this.eipMap[uuid] = {
      uuid,
      eipUuid
    }
    this.params = params
    return this.eipDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const eipUuids = uuids.map(uuid => this.eipMap[uuid].eipUuid)

    const { conditions: _conditions = [], ..._params } = this.params
    const conditions = _conditions.concat([{ key: 'uuid', op: Op.in, values: eipUuids }])

    const params = {
      conditions,
      start: 0,
      limit: 1000,
      ..._params
    }

    const resp = await this.eipService.query(params)
    const list = resp.list
    return uuids.map(uuid => {
      const eip = list.find(item => item.uuid === this.eipMap[uuid].eipUuid)
      if (eip) {
        return eip
      } else {
        return null
      }
    })
  }
}
