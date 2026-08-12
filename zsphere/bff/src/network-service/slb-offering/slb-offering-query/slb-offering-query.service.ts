import { Inject, Injectable } from '@nestjs/common'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'

import { SlbOfferingQueryType } from '../slb-offering.model'

@Injectable()
export class SlbOfferingQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = SlbOfferingQueryType.NORMAL, conditions = [] } = params
    let _shareTypeConditions

    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(conditions, ['shareType'])
    if (conditionMap.shareType) {
      _shareTypeConditions = QueryConditionTranslator.generateShareTypeZqlConditon(
        conditionMap.shareType.values,
        'InstanceOfferingVO'
      )
    }

    const _zqlCondition = QueryConditionTranslator.translate(conditions)
    let _resultResp = null

    switch (type) {
      case SlbOfferingQueryType.NORMAL:
        break
    }

    const zqlCondition = _shareTypeConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _shareTypeConditions
          )
        }
      : _zqlCondition

    _resultResp = await this.getSlbOfferingList(params, zqlCondition)

    return _resultResp
  }

  async getSlbOfferingList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'SlbOffering',
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
    const slbOfferings = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: slbOfferings,
      total: total
    }
  }
}
