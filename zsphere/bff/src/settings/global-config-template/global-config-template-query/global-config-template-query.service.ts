import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'

import { QueryGlobalConfigTemplateArgs } from '../global-config-template.model'

@Injectable()
export class GlobalConfigTemplateQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: QueryGlobalConfigTemplateArgs) {
    const zqlCondition = await this.buildZqlCondition(params.conditions)

    const zqlObject = {
      tableName: 'GlobalConfigTemplate',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const globalConfigTemplates = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: globalConfigTemplates,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[]) {
    const zqlCondition = QueryConditionTranslator.translate(conditions)
    return zqlCondition
  }
}
