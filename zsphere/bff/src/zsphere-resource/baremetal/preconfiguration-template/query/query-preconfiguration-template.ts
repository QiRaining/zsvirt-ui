import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { PreconfigurationTemplateQueryType } from '../preconfiguration-template.model'

@Injectable()
export class PreconfigurationTemplateQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = PreconfigurationTemplateQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case PreconfigurationTemplateQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getPreconfigurationTemplateList(params, zqlCondition)

    return _resultResp
  }

  async getPreconfigurationTemplateList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'PreconfigurationTemplate',
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
    const preconfigurationTemplates = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: preconfigurationTemplates,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'PreconfigurationTemplateVO')
      )
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }
}
