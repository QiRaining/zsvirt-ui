import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  chunk as _chunk,
  map as _map,
  compact as _compact,
  get as _get,
  reduce as _reduce,
  flatten as _flatten
} from 'lodash'

import { Condition as ICondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { PlainObject, ZqlObject } from '@/common/zql/zqlBuilder'

import {
  HostKernelInterfaceQueryType,
  QueryHostKernelInterfaceArgs
} from '../host-kernel-interface.model'

@Injectable()
export class HostKernelInterfaceQueryService {
  @Inject() private zqlService: ZQLService
  @Inject() private systemTagDataloader: SystemTagDataloader

  private isForStorageKernelLoader

  constructor() {
    this.isForStorageKernelLoader = new DataLoader(this._isForStorageKernel)
  }

  private buildZqlCondition(conditions: ICondition[], extraZqlConditions: ZqlObject['condition']) {
    const specialCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specialCondition.concat(extraZqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryHostKernelInterfaceArgs) {
    const { type = HostKernelInterfaceQueryType.Normal } = params
    let _extraZqlConditions: PlainObject

    switch (type) {
      case HostKernelInterfaceQueryType.Normal:
        _extraZqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extraZqlConditions)

    const zqlObject = {
      tableName: 'HostKernelInterface',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    return {
      list: resp.results[0].inventories ?? [],
      total: resp.results[0].total ?? 0
    }
  }

  async getIsDefault(uuid: string) {
    const condition = {
      resourceType: 'HostKernelInterfaceVO',
      tag: 'zskernel::default'
    }
    const tag = await this.systemTagDataloader.query(uuid, { condition })
    return !!tag
  }

  async isForStorageKernel({ resourceType, uuid }) {
    return await this.isForStorageKernelLoader.load({ resourceType, uuid })
  }

  _isForStorageKernel = async (keys: { resourceType: string; uuid: string }[]) => {
    const conditionKeyMap = {
      l3Network: 'portGroup.uuid',
      l2Network: 'portGroup.vSwitchUuid'
    }

    const chunkedKeys = _chunk(keys, 50)

    const resultsFromAllChunks = await Promise.all(
      _map(chunkedKeys, async _keys => {
        const zql = ZQL.multStringify(
          _map(_keys, key => {
            const { resourceType, uuid } = key

            const dynamicConditionKey = conditionKeyMap[resourceType]

            return {
              action: ZQLAction.COUNT,
              tableName: 'hostKernelInterface',
              condition: {
                [dynamicConditionKey]: uuid
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        return results
      })
    )

    const flatResultList = _flatten(resultsFromAllChunks)

    const resultMap = _reduce(
      flatResultList,
      (obj, item) => {
        const exists = _get(item, 'total', 0) > 0
        obj[item.name] = exists
        return obj
      },
      {}
    )

    return keys.map(key => _get(resultMap, key.uuid, false))
  }
}
