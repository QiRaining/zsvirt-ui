import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'

@Injectable()
export class VmSpecQueryService {
  @Inject() private zqlService: ZQLService

  async query(params: QueryAction) {
    const { conditions = [] } = params
    const baseConditions = [{ vmInstanceUuid: { [ZOp.is]: null } }]
    const zqlCondition = QueryConditionTranslator.translate(conditions, baseConditions)
    const zql = ZQL.stringify({
      tableName: 'VmCustomSpecification',
      condition: zqlCondition,
      orderBy: params.sortBy,
      returnWith: { total: true },
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start
    })
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const total = resp?.results?.[0]?.total ?? 0
    return { list, total }
  }
}
