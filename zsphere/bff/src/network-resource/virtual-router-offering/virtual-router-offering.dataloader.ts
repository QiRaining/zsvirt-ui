import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

import { VirtualRouterOffering } from './virtual-router-offering.model'
import { VirtualRouterOfferingService } from './virtual-router-offering.service'

@Injectable()
export class VirtualRouterOfferingDataloader {
  @Inject() virtualRouterOfferingService: VirtualRouterOfferingService

  private virtualRouterOfferingDataloader: DataLoader<string, VirtualRouterOffering>

  private params: IQueryAction = {}
  private virtualRouterOfferingMap: any = {}

  constructor() {
    this.virtualRouterOfferingDataloader = new DataLoader(this._query)
  }

  query(uuid, virtualRouterOfferingUuid, params: IQueryAction = {}) {
    this.params = params

    this.virtualRouterOfferingMap[uuid] = {
      uuid,
      virtualRouterOfferingUuid
    }

    return this.virtualRouterOfferingDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const virtualRouterOfferingUuids = uuids.map(
      uuid => this.virtualRouterOfferingMap[uuid].virtualRouterOfferingUuid
    )

    const { conditions = [], ...rest } = this.params

    const params: IQueryAction = {
      conditions: [{ key: 'uuid', op: Op.in, values: virtualRouterOfferingUuids }, ...conditions],
      start: 0,
      limit: 1000,
      ...rest
    }

    const { list } = await this.virtualRouterOfferingService.queryList(params)

    return uuids.map(
      uuid =>
        list.find(
          virtualRouterOffering =>
            virtualRouterOffering.uuid ===
            this.virtualRouterOfferingMap[uuid].virtualRouterOfferingUuid
        ) ?? null
    )
  }
}
