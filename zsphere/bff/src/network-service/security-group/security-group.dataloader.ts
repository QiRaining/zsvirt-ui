import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { QueryParam, Op } from '@/api/zstack/base/query-base'
import { QuerySecurityGroupAction } from '@/api/zstack/QuerySecurityGroupAction'

@Injectable()
export class SecurityGroupDataloader {
  @Inject() action: QuerySecurityGroupAction

  private resolvedDataLoder

  private resolvedMap: any = {}

  constructor() {
    this.resolvedDataLoder = new DataLoader(this._query)
  }

  query(uuid: string, securityGroupUuid: string) {
    this.resolvedMap[uuid] = {
      uuid,
      securityGroupUuid
    }
    return this.resolvedDataLoder.load(uuid)
  }

  _query = async (uuidList: string[]) => {
    const values = uuidList.map(uuid => this.resolvedMap[uuid].securityGroupUuid)
    const params: QueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values }]
    }
    const resp = await this.action.call(params)
    return uuidList.map(uuid => {
      const result = resp.inventories.find(
        item => item.uuid === this.resolvedMap[uuid].securityGroupUuid
      )
      return result ?? null
    })
  }
}
