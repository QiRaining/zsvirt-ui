import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { QueryParam, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'

@Injectable()
export class SeDeviceService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() queryHostAction: QueryHostAction

  async query(param) {
    const { conditions } = param

    const zqlCondition = QueryConditionTranslator.translate(conditions)

    const zqlObject = {
      tableName: 'MdevDevice',
      condition: zqlCondition,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = ZQL.stringify(zqlObject)
    const usbResp = await this.zqlService.call(zql)
    return {
      list: usbResp.results[0].inventories,
      total: usbResp.results[0].total
    }
  }

  async queryHost(uuid: string): Promise<string> {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.queryHostAction.call(params)
    return inventories?.[0]
  }
}
