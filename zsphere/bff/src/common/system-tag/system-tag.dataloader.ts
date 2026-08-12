import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

import { PlainObject } from '../zql/zqlBuilder'

interface Info {
  key?: string
  splitIndex?: number
}

@Injectable()
export class SystemTagDataloader {
  @Inject() zqlService: ZQLService

  private systemTagDataloader

  private condition = {}
  private info?: Info

  constructor() {
    this.systemTagDataloader = new DataLoader(this._query)
  }

  query(resourceUuid, { info, condition = {} }: { info?: Info; condition?: PlainObject } = {}) {
    this.condition = condition
    this.info = info
    return this.systemTagDataloader.load(resourceUuid)
  }

  _query = async (resourceUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceUuid: {
          [ZOp.in]: resourceUuids
        },
        ...this.condition
      }
    })

    const resp = await this.zqlService.call(zql)
    const systemTagList = resp.results?.[0]?.inventories
    return resourceUuids.map(uuid => {
      const systemTag = systemTagList.find(_tag => _tag.resourceUuid === uuid)
      if (systemTag) {
        const returnObj = {}
        const _key = this.info?.key ?? systemTag.tag?.split('::')?.[0]
        returnObj[_key] = systemTag.tag?.split('::')?.[this.info?.splitIndex ?? 1]
        return returnObj
      } else {
        return null
      }
    })
  }
}
