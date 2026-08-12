import { Injectable, Inject } from '@nestjs/common'

import { QueryAccessControlRuleAction } from '@/api/zstack/QueryAccessControlRuleAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'

import { IpBlackWhiteListQueryResp } from './ip-blackwhite-list.model'

@Injectable()
export class IpBlackWhiteListService extends ActionService {
  @Inject() queryAccessControlRule: QueryAccessControlRuleAction

  async query(params: QueryAction): Promise<IpBlackWhiteListQueryResp> {
    const { inventories, total } = await this.queryAccessControlRule.call(params)
    return {
      list: inventories,
      total
    }
  }
}
