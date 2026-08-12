import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { Condition, extractAndRemoveExtraCondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  DiscoverExternalPrimaryStorageAction,
  DiscoverExternalPrimaryStorageActionParam
} from '@/api/zstack/DiscoverExternalPrimaryStorageAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL from '@/common/zql/index'

import { PrimaryStorage } from '../../primary-storage/primary-storage.model'

@Injectable()
export class QueryExternalPrimaryStoragePoolService {
  @Inject() zqlService: ZQLService
  @Inject()
  discoverExternalPrimaryStorageAction: DiscoverExternalPrimaryStorageAction

  async query(params: QueryAction) {
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(params.conditions, [
      '__primaryStorageUuid__',
      '__deviceInfo__',
      '__isGetAddedPools__',
      '__isGetAvailablePools__',
      '__uuids__' // 已经选择的池子的 name
    ])

    const targetPrimaryStorage = await this.getPrimaryStorage(_extraConditionMap)

    // 拿到指定外部主存储下 所有的/已经添加的 存储池，需要做 分页/搜索过滤/排序 处理
    // 默认是拿所有的，在 addonInfo.pools 里
    if (targetPrimaryStorage) {
      let pools = targetPrimaryStorage.addonInfo.pools.map(pool => ({
        ...pool,
        primaryStorageUuid: targetPrimaryStorage.uuid
      }))
      // 获取已经添加的池子
      if (_extraConditionMap.__isGetAddedPools__) {
        pools = targetPrimaryStorage.config?.pools
          .map(item => {
            return {
              ...pools.find(pool => pool.name === item.name),
              ...item
            }
          })
          .filter(item => !!item)
      }

      // 获取过滤掉已经添加的池子 === 即 可用池子
      if (_extraConditionMap.__isGetAvailablePools__) {
        pools = pools.filter(
          pool => !targetPrimaryStorage.config?.pools.find(item => item.name === pool.name)
        )
      }

      // 过滤掉已经选择的池子
      if (_extraConditionMap.__uuids__) {
        pools = pools.filter(
          pool => !_extraConditionMap.__uuids__.values.find(uuid => uuid === pool.name)
        )
      }

      const { start = 0, limit = 10, sortBy = 'createDate', sortDirection = 'desc' } = params

      // 2.1 搜索过滤, 目前只实现了 op = like/eq， 不考虑 notIn 等情况
      pools = _.filter(pools, pool => {
        return _conditions.every(condition => {
          switch (condition.op) {
            case Op.like:
              return pool[condition.key].includes(condition.value)
            case Op.eq:
              return pool[condition.key] === condition.value
            default:
              return true
          }
        })
      })

      // 2.2 排序
      pools = _.orderBy(
        pools,
        [
          pool => {
            if (sortBy === 'usedCapacity') {
              return _.floor(
                (1 - Number(pool.availableCapacity) / Number(pool.totalCapacity)) * 100,
                2
              )
            }

            return pool[sortBy]
          }
        ],
        [sortDirection]
      )

      // 2.3 分页
      const pages = _.chunk(pools, limit)
      const currentPage = pages[start] || []

      return {
        total: pools.length,
        list: currentPage
      }
    }

    return {
      total: 0,
      list: []
    }
  }

  async getPrimaryStorage(params: {
    __primaryStorageUuid__?: Condition
    __deviceInfo__?: Condition
  }) {
    if (params.__primaryStorageUuid__) {
      return await this.getExtPrimaryStorageByUuid(params.__primaryStorageUuid__.value)
    }

    if (params.__deviceInfo__) {
      return await this.getExtPrimaryStorageByDeviceInfo(params.__deviceInfo__.value)
    }
  }

  async getExtPrimaryStorageByUuid(uuid: string): Promise<PrimaryStorage | null> {
    const zqlObj = {
      tableName: 'PrimaryStorage',
      condition: {
        uuid
      }
    }
    const zql = ZQL.stringify(zqlObj)

    const { results = [] } = await this.zqlService.call(zql)

    return results[0]?.inventories?.[0]
  }

  async getExtPrimaryStorageByDeviceInfo(params: string): Promise<PrimaryStorage | null> {
    const _params = JSON.parse(params) as DiscoverExternalPrimaryStorageActionParam
    const result = await this.discoverExternalPrimaryStorageAction.call(_params)

    return result.inventory as PrimaryStorage
  }
}
