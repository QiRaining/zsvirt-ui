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

import { GuestVmScriptQueryType } from '../script-library.model'

@Injectable()
export class QueryGuestVmScriptService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = GuestVmScriptQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case GuestVmScriptQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getGuestVmScriptList(params, zqlCondition)

    return _resultResp
  }

  async getGuestVmScriptList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY

    const zqlObject = {
      action,
      tableName: 'GuestVmScript',
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
    const guestVmScripts = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: guestVmScripts,
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
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'GuestVmScriptVO')
      )
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(_.concat(specicalCondition, extrazqlConditions))
    )

    return zqlCondition
  }
}
