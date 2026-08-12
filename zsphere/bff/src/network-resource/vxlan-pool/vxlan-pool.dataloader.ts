import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryL2VxlanNetworkPoolAction } from '@/api/zstack/QueryL2VxlanNetworkPoolAction'

import { VxlanPool, VxlanPoolQueryResp } from './vxlan-pool.model'
import { VxlanPoolService } from './vxlan-pool.service'

@Injectable()
export class VxlanPoolDataloader {
  @Inject() queryL2VxlanNetworkPoolAction: QueryL2VxlanNetworkPoolAction

  private vxlanPoolDataLoader
  //vtepCidr字段仅在vxlanPool详情页：集群列表展示
  private currentVxlanPoolUuid = ''

  constructor() {
    this.vxlanPoolDataLoader = new DataLoader(this._query)
  }

  query(uuid: string, vxlanPoolUuid: string) {
    this.currentVxlanPoolUuid = vxlanPoolUuid
    return this.vxlanPoolDataLoader.load(uuid)
  }

  private _query = async (uuids: string[]) => {
    const params = {
      conditions: [{ key: 'uuid', op: Op.eq, value: this.currentVxlanPoolUuid }]
    }
    const { inventories } = await this.queryL2VxlanNetworkPoolAction.call(params)
    const clusterCidrMap = inventories?.[0]?.attachedCidrs

    return uuids.map(uuid => {
      if (clusterCidrMap?.[uuid]) {
        return clusterCidrMap?.[uuid]
      } else {
        return null
      }
    })
  }
}
