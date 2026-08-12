import { Injectable, Inject } from '@nestjs/common'
import { concat as _concat, get as _get, compact as _compact } from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class SNSFeiShuAtPersonQueryService {
  @Inject() zqlService: ZQLService

  async queryList(param: IQueryAction) {
    let _resultResp = null
    const zqlCondition = this.buildZqlCondition(param.conditions, [])

    _resultResp = await this.getSNSFeiShuAtPersons(param, zqlCondition)

    return _resultResp
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [])

    const specicalCondition = []

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getSNSFeiShuAtPersons(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'SNSFeiShuAtPerson',
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
    const atPersons = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: atPersons,
      total: total
    }
  }
}
