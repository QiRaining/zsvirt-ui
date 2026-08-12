import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryThirdpartyPlatformAction } from '@/api/zstack/QueryThirdpartyPlatformAction'

@Injectable()
export class ThirdpartyPlatformDataloader {
  @Inject() queryThirdpartyPlatformAction: QueryThirdpartyPlatformAction

  private queryThirdpartyPlatformDataLoader

  private thirdpartyPlatformMap: any = {}

  constructor() {
    this.queryThirdpartyPlatformDataLoader = new DataLoader(this._query)
  }

  query(uuid, platformUuid) {
    this.thirdpartyPlatformMap[uuid] = {
      uuid,
      platformUuid
    }
    return this.queryThirdpartyPlatformDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const platformUuids = uuids.map(uuid => this.thirdpartyPlatformMap[uuid].platformUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: platformUuids }],
      start: 0,
      limit: 1000
    }
    const { inventories = [] } = await this.queryThirdpartyPlatformAction.call(params)
    return uuids.map(uuid => {
      const platform = inventories.find(
        platform => platform.uuid === this.thirdpartyPlatformMap[uuid].platformUuid
      )
      if (platform) {
        return platform
      } else {
        return null
      }
    })
  }
}
