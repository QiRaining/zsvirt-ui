import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'

import { QueryTemplateConfigArgs } from '../template-config.model'

@Injectable()
export class TemplateConfigQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: QueryTemplateConfigArgs) {
    const zqlCondition = await this.buildZqlCondition(params.conditions)

    const zqlObject = {
      tableName: 'TemplateConfig',
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
    const templateConfigs = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: templateConfigs,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[]) {
    const zqlCondition = QueryConditionTranslator.translate(conditions)
    return zqlCondition
  }
}
