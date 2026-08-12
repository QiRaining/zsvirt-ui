import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL from '@/common/zql/index'

import {
  CBDPrimaryStoragePoolQueryType,
  QuerCBDPrimaryStoragePoolyArgs,
  CBDPrimaryStoragePool
} from '../cbd-primary-storage-pool.model'

@Injectable()
export class QueryCBDPrimaryStoragePoolService {
  @Inject() zqlService: ZQLService
  async queryList(params: QuerCBDPrimaryStoragePoolyArgs) {
    const { type = CBDPrimaryStoragePoolQueryType.Normal } = params
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(params.conditions, [
      '__PrimaryStorageUuid__'
    ])

    const ps = await this.getPrimaryStorage(_extraConditionMap.__PrimaryStorageUuid__?.value)

    if (!ps) {
      return {
        list: [],
        total: 0
      }
    }

    try {
      const config = ps.config
      const addonInfo = ps.addonInfo
      const hasAddedPools = _.get(config, 'logicalPoolName')
        ? [_.get(config, 'logicalPoolName')] // 先兼容后端单池的数据结构
        : _.get(config, 'logicalPoolNames', [])
      const wholeStoragePools = _.get(addonInfo, 'logicalPoolInfos', []) as CBDPrimaryStoragePool[]
      const wholePoolMap = _.reduce(
        wholeStoragePools,
        (result, pool) => {
          result[pool.logicalPoolName] = pool
          return result
        },
        {}
      )
      let pools: string[] = [] // pool名称数组

      // 获取当前主存储已添加的存储池
      if (type === CBDPrimaryStoragePoolQueryType.Normal) {
        pools = hasAddedPools
      } else if (type === CBDPrimaryStoragePoolQueryType.PsAttachablePool) {
        pools = _.differenceBy(
          wholeStoragePools.map(pool => pool.logicalPoolName),
          hasAddedPools
        )
      }

      return {
        list: pools.map(poolName => ({
          logicalPoolName: poolName,
          replicaNum: _.get(wholePoolMap[poolName], ['redundanceAndPlaceMentPolicy', 'replicaNum']),
          primaryStorageUuid: ps?.uuid,
          ..._.pick(wholePoolMap[poolName], ['capacity', 'usedSize', 'createTime'])
        })),
        total: hasAddedPools.length
      }
    } catch {
      /* empty */
    }

    return {
      list: [],
      total: 0
    }
  }

  async getPrimaryStorage(psUuid: string) {
    if (!psUuid) {
      return null
    }

    const zqlObject = {
      tableName: 'PrimaryStorage',
      condition: {
        uuid: psUuid
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return _.get(results, ['0', 'inventories', '0'])
  }
}
