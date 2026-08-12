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

import { InstallPathRecycleQueryType } from '../trash.model'

@Injectable()
export class InstallPathRecycleQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = InstallPathRecycleQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case InstallPathRecycleQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getInstallPathRecycleList(params, zqlCondition)

    return _resultResp
  }

  async getInstallPathRecycleList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'InstallPathRecycle',
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
    const installPathList = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: installPathList,
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
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'InstallPathRecycleVO')
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
