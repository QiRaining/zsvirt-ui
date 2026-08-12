import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { sumBy as _sumBy, compact as _compact, uniq as _uniq, pick as _pick } from 'lodash'

import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetInterfaceServiceTypeStatisticAction } from '@/api/zstack/GetInterfaceServiceTypeStatisticAction'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  InterfaceServiceQueryType,
  PhysicalNetworkInterfaceQueryType,
  QueryInterfaceServiceArgs,
  QueryPhysicalNetworkInterfaceArgs
} from './physical-network-interface.model'

@Injectable()
export class PhysicalNetworkInterfaceService {
  @Inject() private readonly zqlService: ZQLService
  @Inject()
  private readonly getInterfaceServiceTypeStatisticAction: GetInterfaceServiceTypeStatisticAction

  private serviceTypesDataloader
  private serviceTypesMap: any = {}

  constructor() {
    this.serviceTypesDataloader = new DataLoader(this._serviceTypes)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      'bondingUuid',
      'host.clusterUuid',
      'hostUuid',
      'physicalNetworkType'
    ])

    if (_extraConditionMap.zoneUuid) {
      specicalCondition.push({
        interfaceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterface',
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

    if (_extraConditionMap.bondingUuid) {
      specicalCondition.push({
        interfaceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterface',
              fields: ['uuid'],
              condition: {
                bondingUuid: {
                  [ZOp.is]: _extraConditionMap.bondingUuid.value
                }
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap['host.clusterUuid']) {
      specicalCondition.push({
        interfaceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterface',
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
        interfaceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterface',
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

  async get(params: QueryPhysicalNetworkInterfaceArgs) {
    const { type = PhysicalNetworkInterfaceQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case PhysicalNetworkInterfaceQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'HostNetworkInterfaceServiceRef',
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

  private _serviceTypes = async (fackerUuids: string[]) => {
    const conditions = fackerUuids.map(fackerUuid => this.serviceTypesMap[fackerUuid])

    const mulzqlObject = conditions.map(condition => ({
      tableName: 'HostNetworkInterfaceServiceRef',
      fields: ['serviceType'],
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

  private buildGetInterfaceServiceParams(
    conditions: ICondition[],
    extrazqlConditions: ZqlObject['condition']
  ) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      'interfaceType',
      'vlanId',
      'clusterUuid',
      'host.clusterUuid',
      'hostUuid',
      'physicalNetworkType',
      'serviceType'
    ])

    const params: any = {}

    if (_extraConditionMap['zoneUuid']) {
      params.zoneUuid = _extraConditionMap['zoneUuid'].value
    }

    if (_extraConditionMap['interfaceType']) {
      params.interfaceType = _extraConditionMap['interfaceType'].value
    }

    if (_extraConditionMap['vlanId']) {
      params.vlanId = _extraConditionMap['vlanId'].value
    }

    if (_extraConditionMap['host.clusterUuid']) {
      params.clusterUuid = _extraConditionMap['host.clusterUuid'].value
    }

    if (_extraConditionMap['hostUuid']) {
      params.hostUuid = _extraConditionMap['hostUuid'].value
    }

    if (_extraConditionMap['clusterUuid']) {
      params.clusterUuid = _extraConditionMap['clusterUuid'].value
    }

    if (_extraConditionMap['physicalNetworkType'] || _extraConditionMap['serviceType']) {
      params.serviceType = _uniq([
        ..._compact(_extraConditionMap['physicalNetworkType']?.values),
        ..._compact(_extraConditionMap['serviceType']?.values)
      ])
    }

    return params
  }

  async getInterfaceService(params: QueryInterfaceServiceArgs) {
    const { type = InterfaceServiceQueryType } = params
    let _extrazqlConditions

    switch (type) {
      case InterfaceServiceQueryType.Normal:
        _extrazqlConditions = undefined
        break
    }

    const bulidParams = this.buildGetInterfaceServiceParams(params.conditions, _extrazqlConditions)

    const _params: any = {
      replyWithCount: true,
      sortBy: 'VlanId',
      sortDirection: 'asc',
      ...bulidParams
    }

    if (params.limit) {
      _params.limit = params.limit
    }

    if (params.start) {
      _params.start = params.start
    }

    if (params.sortBy === 'vlanId') {
      _params.sortBy = 'VlanId'
      _params.sortDirection = params.sortDirection
    }

    const result = await this.getInterfaceServiceTypeStatisticAction.call(_params)

    return {
      list: _compact(result.serviceTypeStatistics),
      total: result.total ?? 0
    }
  }
}
