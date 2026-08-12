import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { BaremetalInstanceQueryService } from '@/zsphere-resource/baremetal/baremetal-instance/query/baremetal-instance-query.service'

@Injectable()
export class BaremetalInstanceDataloader {
  @Inject() baremetalInstanceQueryService: BaremetalInstanceQueryService

  private dataloader

  private sourceMap: any = {}

  constructor() {
    this.dataloader = new DataLoader(this._query)
  }

  query(uuid, baremetalInstanceUuid) {
    this.sourceMap[uuid] = {
      uuid,
      baremetalInstanceUuid
    }
    return this.dataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const baremetalInstanceUuids = uuids.map(uuid => this.sourceMap[uuid].baremetalInstanceUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: baremetalInstanceUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.baremetalInstanceQueryService.query(params)
    const list = resp.list
    return uuids.map(uuid => {
      const target = list.find(target => target.uuid === this.sourceMap[uuid].baremetalInstanceUuid)
      if (target) {
        return target
      } else {
        return null
      }
    })
  }
}
