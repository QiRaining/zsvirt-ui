import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'

@Injectable()
export class ResourceQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const nameKey =
      params?.extraConditions?.filter(it => it.key === 'nameKey')?.[0]?.value ?? 'name'
    const zqlObject = {
      tableName: params.type,
      fields: ['uuid', nameKey],
      condition: QueryConditionTranslator.translate(params?.conditions),
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
    const resources = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list:
        nameKey === 'name'
          ? resources
          : resources?.map(resource => ({
              ...resource,
              name: resource?.[nameKey]
            })),
      total: total
    }
  }

  async countList(params: IQueryAction) {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: params.type,
      condition: QueryConditionTranslator.translate(params?.conditions),
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const total = results?.[0]?.total ?? 0

    return {
      total: total
    }
  }
}
