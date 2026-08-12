import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact, uniq as _uniq } from 'lodash'

import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  PhysicalNetworkBondQueryType,
  QueryPhysicalNetworkBondArgs
} from './physical-network-bond.model'

@Injectable()
export class PhysicalNetworkBondService {
  @Inject() private readonly zqlService: ZQLService

  private serviceTypesDataloader
  private serviceTypesMap: any = {}

  constructor() {
    this.serviceTypesDataloader = new DataLoader(this._serviceTypes)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      'host.clusterUuid',
      'hostUuid',
      'physicalNetworkType'
    ])

    if (_extraConditionMap.zoneUuid) {
      specicalCondition.push({
        bondingUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkBonding',
              fields: ['uuid'],
              condition: {
                hostUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Host',
                      fields: ['uuid'],
                      condition: {
                        zoneUuid: _extraConditionMap.zoneUuid.value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap['host.clusterUuid']) {
      specicalCondition.push({
        bondingUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkBonding',
              fields: ['uuid'],
              condition: {
                hostUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Host',
                      fields: ['uuid'],
                      condition: {
                        clusterUuid: _extraConditionMap['host.clusterUuid'].value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap.hostUuid) {
      specicalCondition.push({
        bondingUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkBonding',
              fields: ['uuid'],
              condition: {
                hostUuid: _extraConditionMap.hostUuid.value
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap.physicalNetworkType) {
      const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, ['serviceType'])

      specicalCondition.push({
        serviceType: {
          [ZOp.in]: _uniq([
            ..._extraConditionMap.physicalNetworkType.values,
            ...(extraConditionMap?.serviceType?.values ?? [])
          ])
        }
      })
    }

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryPhysicalNetworkBondArgs) {
    const { type = PhysicalNetworkBondQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case PhysicalNetworkBondQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'HostNetworkBondingServiceRef',
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

  serviceTypes(fackerUuid, params) {
    this.serviceTypesMap[fackerUuid] = {
      ...params
    }

    return this.serviceTypesDataloader.load(fackerUuid)
  }

  _serviceTypes = async (fackerUuids: string[]) => {
    const conditions = fackerUuids.map(fackerUuid => this.serviceTypesMap[fackerUuid])

    const mulzqlObject = conditions.map(condition => ({
      tableName: 'HostNetworkBondingServiceRef.serviceType',
      condition
    }))

    const zql = ZQL.multStringify(mulzqlObject)
    const { results } = await this.zqlService.call(zql)
    return _compact(results).map((it: any) =>
      _compact(it?.inventories)
        .map((it: any) => it?.serviceType)
        .filter(Boolean)
    )
  }
}
