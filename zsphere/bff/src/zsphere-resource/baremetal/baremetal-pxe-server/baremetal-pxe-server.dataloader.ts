import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'

import { QueryBaremetalPxeServerService } from './query/baremetal-pxeservice-query.service'

@Injectable()
export class BaremetalPxeserviceDataloader {
  @Inject() baremetalPxeserviceQueryService: QueryBaremetalPxeServerService

  private dataloader

  private sourceMap: any = {}

  constructor() {
    this.dataloader = new DataLoader(this._query)
  }

  query(uuid, baremetalPxeserviceUuid) {
    this.sourceMap[uuid] = {
      uuid,
      baremetalPxeserviceUuid
    }
    return this.dataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const baremetalPxeserviceUuids = uuids.map(uuid => this.sourceMap[uuid].baremetalPxeserviceUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: baremetalPxeserviceUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.baremetalPxeserviceQueryService.query(params)
    const list = resp.list
    return uuids.map(uuid => {
      const target = list.find(
        target => target.uuid === this.sourceMap[uuid].baremetalPxeserviceUuid
      )
      if (target) {
        return target
      } else {
        return null
      }
    })
  }
}
