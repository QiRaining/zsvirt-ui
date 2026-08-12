import { Inject, Injectable } from '@nestjs/common'
import { compact as _compact } from 'lodash'

import { Condition as ICondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  AccessControlRuleQueryType,
  QueryAccessControlRuleArgs
} from '../access-control-rule.model'

@Injectable()
export class AccessControlRuleQueryService {
  @Inject() private readonly zqlService: ZQLService

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryAccessControlRuleArgs) {
    const { type = AccessControlRuleQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case AccessControlRuleQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'AccessControlRule',
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

  async accessControlRule(uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.get(queryArgs)
    return result.list[0]
  }
}
