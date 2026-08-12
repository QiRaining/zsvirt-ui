import { Injectable, Inject } from '@nestjs/common'

import { QueryParam, Op } from '@/api/zstack/base/query-base'
import { QuerySNSApplicationEndpointAction } from '@/api/zstack/QuerySNSApplicationEndpointAction'
import { ActionService } from '@/base/action-service'

import { QueryEndPointResp } from './zwatch-endpoint.model'

@Injectable()
export class EndPointService extends ActionService {
  @Inject()
  querySNSApplicationEndpointAction: QuerySNSApplicationEndpointAction

  async query(params: QueryParam): Promise<QueryEndPointResp> {
    const { conditions, ...data } = params
    const _conditions = conditions.concat([
      {
        key: 'name',
        op: Op.ne,
        value: 'created-by-SystemHTTPTopicAndEndpointCreator'
      }
    ])
    const { inventories, total } = await this.querySNSApplicationEndpointAction.call({
      ...data,
      conditions: _conditions
    })
    return {
      list: inventories,
      total
    }
  }
}
