import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact, reduce as _reduce } from 'lodash'

import { Condition as ICondition, Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { UplinkGroupQueryType, QueryUplinkGroupArgs } from '../uplink-group.model'

@Injectable()
export class UplinkGroupQueryService {
  @Inject() private zqlService: ZQLService

  // private xxxDataloader

  constructor() {
    // this.xxxDataloader = new DataLoader(this._xxx)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryUplinkGroupArgs) {
    const { type = UplinkGroupQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case UplinkGroupQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'UplinkGroup',
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
}
