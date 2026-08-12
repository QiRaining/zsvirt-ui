import { Inject, Injectable } from '@nestjs/common'
import { compact as _compact } from 'lodash'

import { Condition as ICondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { PlatformCryptoCmplService } from '../../platform-crypto-cmpl/platform-crypto-cmpl.service'
import { SecurityMachineType } from '../../security-machine/security-machine.model'
import { QuerySecretServerArgs, SecretServerQueryType } from '../secret-server.model'

@Injectable()
export class SecretServerQueryService {
  @Inject() private readonly zqlService: ZQLService
  @Inject() private platformCryptoCmplService: PlatformCryptoCmplService

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QuerySecretServerArgs) {
    const { type = SecretServerQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case SecretServerQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'SecretResourcePool',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    return {
      list: resp.results[0].inventories ?? [],
      total: resp.results[0].total ?? 0
    }
  }

  async secretServer(uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        },
        {
          key: 'type',
          op: Op.eq,
          value: SecurityMachineType.CloudSecurityResourceService
        }
      ]
    }
    const result = await this.get(queryArgs)
    return result.list[0]
  }

  async secretServerCount() {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'SecretResourcePool',
      condition: {
        type: SecurityMachineType.CloudSecurityResourceService
      }
    })

    const { results } = await this.zqlService.call(zql)

    return results[0]?.total ?? 0
  }

  isEnableCryptoCmpl(secretResourcePoolUuid: string) {
    return this.platformCryptoCmplService.isEnableCryptoCmpl(secretResourcePoolUuid)
  }
}
