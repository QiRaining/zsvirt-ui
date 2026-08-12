import { Injectable, Inject } from '@nestjs/common'

import { AddSdnControllerAction } from '@/api/zstack/AddSdnControllerAction'
import { Op, QueryParam as IQueryParam } from '@/api/zstack/base/query-base'
import { QuerySdnControllerAction } from '@/api/zstack/QuerySdnControllerAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { RemoveSdnControllerAction } from '@/api/zstack/RemoveSdnControllerAction'
import { UpdateSdnControllerAction } from '@/api/zstack/UpdateSdnControllerAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'

@Injectable()
export class SdnControllerService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() addSdnControllerAction: AddSdnControllerAction
  @Inject() querySdnControllerAction: QuerySdnControllerAction
  @Inject() updateSdnControllerAction: UpdateSdnControllerAction
  @Inject() removeSdnControllerAction: RemoveSdnControllerAction

  async sdnControllerList(params: QueryAction) {
    const { inventories = [], total = 0 } = await this.querySdnControllerAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async getVdsUuid(uuid: string) {
    const params: IQueryParam = {
      conditions: [
        {
          key: 'resourceUuid',
          value: uuid
        },
        {
          key: 'tag',
          op: Op.like,
          value: 'vdsUuid'
        }
      ]
    }
    const resp = await this.querySystemTagAction.call(params)
    return resp?.inventories?.[0]?.tag.split('::')?.[1] || ''
  }
}
