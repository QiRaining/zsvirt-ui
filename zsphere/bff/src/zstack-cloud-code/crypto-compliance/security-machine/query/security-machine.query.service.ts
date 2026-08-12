import { Inject, Injectable } from '@nestjs/common'
import { compact as _compact } from 'lodash'

import { Condition as ICondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QuerySecurityMachineAction } from '@/api/zstack/QuerySecurityMachineAction'
import { SetSecurityMachineKeyAction } from '@/api/zstack/SetSecurityMachineKeyAction'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { CheckSyncInput } from '../../secret-resource-pool/secret-resource-pool.model'
import { QuerySecurityMachineArgs, SecurityMachineQueryType } from '../security-machine.model'

@Injectable()
export class SecurityMachineQueryService {
  @Inject() private zqlService: ZQLService
  @Inject() private querySecurityMachineAction: QuerySecurityMachineAction
  @Inject() private checkSyncAction: SetSecurityMachineKeyAction

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(param: QuerySecurityMachineArgs) {
    const { type = SecurityMachineQueryType.Normal } = param
    let _extrazqlConditions

    switch (type) {
      case SecurityMachineQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(param.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'SecurityMachine',
      condition: _zqlCondition,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = ZQL.stringify(zqlObject)
    const secretResourcePoolResp = await this.zqlService.call(zql)

    return {
      list: secretResourcePoolResp.results[0].inventories,
      total: secretResourcePoolResp.results[0].total
    }
  }

  async querySecurityMachineList(zoneUuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'zoneUuid',
          op: Op.eq,
          value: zoneUuid
        }
      ]
    }

    const { inventories } = await this.querySecurityMachineAction.call(queryArgs)
    return { list: inventories, total: inventories?.length }
  }

  async securityMachine(uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.get(queryArgs)
    return result.list[0]
  }

  async asyncSecurityMachineCount() {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'SecurityMachine',
      condition: {
        status: 'Unsynced'
      }
    })
    const { results } = await this.zqlService.call(zql)
    return {
      unsyncedTotal: results[0]?.total ?? 0
    }
  }

  async unsyncedSecurityMachineList(input: CheckSyncInput) {
    const { inventories } = await this.checkSyncAction.call(input)
    return inventories
  }
}
