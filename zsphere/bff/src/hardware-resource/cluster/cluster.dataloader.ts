import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { ClusterService } from '@/hardware-resource/cluster/cluster.service'

@Injectable()
export class ClusterDataloader {
  @Inject() clusterService: ClusterService

  private clusterDataLoader

  private clusterMap: any = {}

  constructor() {
    this.clusterDataLoader = new DataLoader(this._query)
  }

  query(uuid, clusterUuid) {
    this.clusterMap[uuid] = {
      uuid,
      clusterUuid
    }
    return this.clusterDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const clusterUuids = uuids.map(uuid => this.clusterMap[uuid].clusterUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: clusterUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.clusterService.clusterList(params)
    const clusters = resp.list
    return uuids.map(uuid => {
      const cluster = clusters.find(cluster => cluster.uuid === this.clusterMap[uuid].clusterUuid)
      if (cluster) {
        return cluster
      } else {
        return null
      }
    })
  }
}
