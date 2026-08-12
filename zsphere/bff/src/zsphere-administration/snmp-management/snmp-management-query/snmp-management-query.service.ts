import { Injectable, Inject } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QuerySnmpAgentAction } from '@/api/zstack/QuerySnmpAgentAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'

@Injectable()
export class SnmpManagementService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() querySnmpAgentAction: QuerySnmpAgentAction

  async getSnmpTrapReceiverList(params: QueryAction) {
    const { conditions } = params
    const zqlObject = {
      tableName: 'SNSSnmpPlatform',
      condition: QueryConditionTranslator.translate(conditions),
      // orderBy: params.sortBy,
      // orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0
    return {
      list: inventories,
      total: total
    }
  }

  async getSnmpAgentConfigInfo() {
    const { inventories } = await this.querySnmpAgentAction.call({})
    return { result: inventories?.[0] }
  }
}
