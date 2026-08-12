import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'

import { PreconfigurationTemplateQueryService } from './query/query-preconfiguration-template'

@Injectable()
export class PreconfigurationTemplateDataloader {
  @Inject()
  preconfigurationTemplateQueryService: PreconfigurationTemplateQueryService

  private dataloader

  private sourceMap: any = {}

  constructor() {
    this.dataloader = new DataLoader(this._query)
  }

  query(uuid, preconfigurationTemplateUuid) {
    this.sourceMap[uuid] = {
      uuid,
      preconfigurationTemplateUuid
    }
    return this.dataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const preconfigurationTemplateUuids = uuids.map(
      uuid => this.sourceMap[uuid].preconfigurationTemplateUuid
    )
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: preconfigurationTemplateUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.preconfigurationTemplateQueryService.queryList(params)
    const list = resp.list
    return uuids.map(uuid => {
      const target = list.find(
        target => target.uuid === this.sourceMap[uuid].preconfigurationTemplateUuid
      )
      if (target) {
        return target
      } else {
        return null
      }
    })
  }
}
