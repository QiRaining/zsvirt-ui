import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'

import { EndpointQueryService } from './query/query.service'

@Injectable()
export class EndpointDataloader {
  @Inject() endpointQueryService: EndpointQueryService

  private EndpointDataloader

  private endpointMap: any = {}

  constructor() {
    this.EndpointDataloader = new DataLoader(this._query)
  }

  query(uuid, actions) {
    this.endpointMap[uuid] = {
      uuid,
      actions
    }
    return this.EndpointDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const actionsList = uuids.map(uuid => this.endpointMap[uuid].actions)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: actionsList }],
      start: 0,
      limit: 1000
    }
    const resp = await this.endpointQueryService.queryList(params)
    const endpoints = resp.list
    return uuids.map(uuid => {
      const endpoint = endpoints.find(
        endpoint => endpoint.uuid === this.endpointMap[uuid].endpointUuid
      )
      if (endpoint) {
        return endpoint
      } else {
        return null
      }
    })
  }
}
