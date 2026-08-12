import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'

@Injectable()
export class AccountDataloader {
  @Inject() queryAccountAction: QueryAccountAction

  private dataloader

  private sourceMap: any = {}

  constructor() {
    this.dataloader = new DataLoader(this._query)
  }

  query(uuid, accountUuid) {
    this.sourceMap[uuid] = {
      uuid,
      accountUuid
    }
    return this.dataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const accountUuids = uuids.map(uuid => this.sourceMap[uuid].accountUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: accountUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.queryAccountAction.call(params)
    const list = resp?.inventories ?? []
    return uuids.map(uuid => {
      const target = list.find(target => target.uuid === this.sourceMap[uuid]?.accountUuid)
      if (target) {
        return target
      } else {
        return null
      }
    })
  }
}
