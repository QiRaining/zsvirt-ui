import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'

@Injectable()
export class HostDataloader {
  @Inject() apiQueryHostService: QueryHostAction

  private hostDataLoader

  private hostMap: any = {}

  constructor() {
    this.hostDataLoader = new DataLoader(this._query)
  }

  query(uuid, hostUuid) {
    this.hostMap[uuid] = {
      uuid,
      hostUuid
    }
    return this.hostDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const hostUuids = uuids.map(uuid => this.hostMap[uuid].hostUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: hostUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryHostService.call(params)
    const hosts = resp.inventories
    return uuids.map(uuid => {
      const host = hosts.find(host => host.uuid === this.hostMap[uuid].hostUuid)
      if (host) {
        return host
      } else {
        return null
      }
    })
  }
}
