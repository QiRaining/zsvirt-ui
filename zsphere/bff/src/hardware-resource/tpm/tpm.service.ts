import { Injectable } from '@nestjs/common'

import { Condition, Op } from '@/api/zstack/base/query-base'
import { QueryTpmAction } from '@/api/zstack/QueryTpmAction'
import { ActionService } from '@/base/action-service'

import type { QueryTpmArgs, TpmInventory } from './tpm.model'

@Injectable()
export class TpmService extends ActionService {
  constructor(private readonly queryTpmAction: QueryTpmAction) {
    super()
  }

  async query(args: QueryTpmArgs): Promise<{ list: TpmInventory[]; total: number }> {
    const conditions: Condition[] = []
    if (args.vmInstanceUuid) {
      conditions.push({
        key: 'vmInstanceUuid',
        value: args.vmInstanceUuid,
        op: Op.eq
      })
    }

    const result = await this.queryTpmAction.call({
      conditions,
      start: args.start,
      limit: args.limit,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    })

    return {
      list: (result.inventories ?? []) as TpmInventory[],
      total: result.total ?? 0
    }
  }
}
