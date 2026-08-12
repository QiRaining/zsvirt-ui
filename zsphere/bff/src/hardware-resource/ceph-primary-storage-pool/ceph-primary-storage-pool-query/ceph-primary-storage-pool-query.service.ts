import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  QueryAction as IQueryAction,
  Condition as ICondition
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'

@Injectable()
export class CephPrimaryStoragePoolQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = 'NORMAL' } = params
    let _resultResp = null
    let finalConditions: ICondition[] = []
    switch (type) {
      case 'NORMAL':
        finalConditions = []
        break
    }

    _resultResp = await this.getCephPoolList({
      ...params,
      conditions: params.conditions.concat(finalConditions)
    })

    return _resultResp
  }

  async getCephPoolList(param: IQueryAction) {
    const zqlCondition = await this.buildZqlCondition(param.conditions)
    const zqlObject = {
      tableName: 'CephPrimaryStoragePool',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const images = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: images,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[]) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid'
    ])

    const specicalCondition = []

    // 根据zoneUuid搜索pool
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid: string | string[] =
        _extraConditionMap['zoneUuid']?.value || _extraConditionMap['zoneUuid']?.values

      specicalCondition.push({
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'CephPrimaryStorage',
              fields: ['uuid'],
              condition: {
                zoneUuid: {
                  [ZOp.in]: _.flatten([zoneUuid])
                }
              }
            }
          }
        }
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition)
    )

    return zqlCondition
  }
}
