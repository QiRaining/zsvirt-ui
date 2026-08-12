import { Inject, Injectable, Logger } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QueryThirdpartyPlatformAction } from '@/api/zstack/QueryThirdpartyPlatformAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL from '@/common/zql/index'

import { ThirdpartyPlatformQueryResp } from '../zwatch-thirdparty-platform.model'

@Injectable()
export class QueryThirdpartyPlatformService {
  @Inject() zqlService: ZQLService
  @Inject()
  queryThirdpartyPlatformAction: QueryThirdpartyPlatformAction
  @Inject()
  getResourceAccountAction: GetResourceAccountAction
  private logger: Logger

  private ownerDataLoader

  constructor() {
    this.ownerDataLoader = new DataLoader(this._getOwner)
    this.logger = new Logger(QueryThirdpartyPlatformService.name)
  }

  async query(params: QueryAction): Promise<ThirdpartyPlatformQueryResp> {
    const { inventories: list, total } = await this.queryThirdpartyPlatformAction.call(params)
    return {
      list,
      total: list?.length
    }
  }

  getOwner(uuid) {
    return this.ownerDataLoader.load(uuid)
  }

  _getOwner = async (resourceUuids = []) => {
    const { inventories: ownerMap } = await this.getResourceAccountAction.call({
      resourceUuids
    })
    return resourceUuids.map(uuid => {
      const owner = _get(ownerMap, uuid)
      if (owner) {
        return owner
      } else {
        return null
      }
    })
  }

  async queryZcexPlatformList(params: QueryAction): Promise<ThirdpartyPlatformQueryResp> {
    try {
      // 1. 获取并验证 zcexUuid
      const zcexUuid = params.conditions?.find(it => it.key === 'zcexUuid')?.value
      if (!zcexUuid) {
        return { list: [], total: 0 }
      }

      // 2. 查询告警关联关系
      const alertRefZql = ZQL.stringify({
        tableName: 'zceXThirdPartyPlatformAlertRef',
        condition: { zceXUuid: zcexUuid }
      })
      const { results: alertRefResults } = await this.zqlService.call(alertRefZql)
      const inventories = alertRefResults?.[0]?.inventories || []

      if (!inventories.length) {
        return { list: [], total: 0 }
      }

      // 3. 获取关联的第三方平台信息
      const platformUuids = inventories
        .filter(it => it.zceXUuid === zcexUuid)
        .map(it => it.thirdPartyPlatformUuid)
        .filter(Boolean)

      if (!platformUuids.length) {
        return { list: [], total: 0 }
      }

      const thirdPartyPlatformZql = ZQL.stringify({
        tableName: 'ThirdpartyPlatform',
        condition: {
          uuid: platformUuids?.[0]
        }
      })

      const { results } = await this.zqlService.call(thirdPartyPlatformZql)
      const platformList = results?.[0]?.inventories || []

      return {
        list: platformList,
        total: platformList.length
      }
    } catch (error) {
      this.logger.error('Failed to query zcex platform list:', error)
      throw error
    }
  }
}
