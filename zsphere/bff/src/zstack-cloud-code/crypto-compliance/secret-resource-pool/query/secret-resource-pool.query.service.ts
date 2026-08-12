import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact, reduce as _reduce } from 'lodash'

import { Condition as ICondition, Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QuerySecretResourcePoolAction } from '@/api/zstack/QuerySecretResourcePoolAction'
import { SetSecurityMachineKeyAction } from '@/api/zstack/SetSecurityMachineKeyAction'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { PlatformCryptoCmplService } from '../../platform-crypto-cmpl/platform-crypto-cmpl.service'
import { SecurityMachineType } from '../../security-machine/security-machine.model'
import {
  CheckSyncInput,
  QuerySecretResourcePoolArgs,
  SecretResourcePoolQueryType
} from '../secret-resource-pool.model'

@Injectable()
export class SecretResourcePoolQueryService {
  @Inject() private zqlService: ZQLService
  @Inject() private platformCryptoCmplService: PlatformCryptoCmplService
  @Inject()
  private querySecretResourcePoolAction: QuerySecretResourcePoolAction
  @Inject() private checkSyncAction: SetSecurityMachineKeyAction

  private getSecurityMachineDataloader

  constructor() {
    this.getSecurityMachineDataloader = new DataLoader(this._getSecurityMachine)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QuerySecretResourcePoolArgs) {
    const { type = SecretResourcePoolQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case SecretResourcePoolQueryType.Normal:
        _extrazqlConditions = undefined
        break
      case SecretResourcePoolQueryType.GetSrpCandidateSecyMach:
        _extrazqlConditions = this.getSrpCandidateSecyMach(params)
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

  async querySecretResourcePoolList(zoneUuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'zoneUuid',
          op: Op.eq,
          value: zoneUuid
        },
        {
          key: 'type',
          op: Op.notIn,
          values: [SecurityMachineType.CloudSecurityResourceService]
        }
      ]
    }
    const { inventories } = await this.querySecretResourcePoolAction.call(queryArgs)
    return { list: inventories, total: inventories?.length }
  }

  async secretResourcePool(uuid: string) {
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

  private _getSecurityMachine = async (secretResourcePoolUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'SecurityMachine',
      condition: {
        secretResourcePoolUuid: {
          [ZOp.in]: secretResourcePoolUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const securityMachineMap = _reduce(
      inventories,
      (obj, securityMachine) => {
        if (!obj[securityMachine.secretResourcePoolUuid]) {
          obj[securityMachine.secretResourcePoolUuid] = [securityMachine]
        } else {
          obj[securityMachine.secretResourcePoolUuid].push(securityMachine)
        }
        return obj
      },
      {}
    )

    return secretResourcePoolUuids.map(uuid => securityMachineMap[uuid] ?? [])
  }

  getSecurityMachine(secretResourcePoolUuid: string) {
    return this.getSecurityMachineDataloader.load(secretResourcePoolUuid)
  }

  getSrpCandidateSecyMach(params: QuerySecretResourcePoolArgs) {
    const { extraConditions } = params
    const conditionMap = conditionsToObject(extraConditions)

    const extraCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SecurityMachine',
            fields: 'secretResourcePoolUuid',
            condition: conditionMap
          }
        }
      }
    }

    return extraCondition
  }

  isEnableCryptoCmpl(secretResourcePoolUuid: string) {
    return this.platformCryptoCmplService.isEnableCryptoCmpl(secretResourcePoolUuid)
  }

  async checkSync(checkSyncInput: CheckSyncInput) {
    const { inventories } = await this.checkSyncAction.call(checkSyncInput)
    return inventories
  }
}
