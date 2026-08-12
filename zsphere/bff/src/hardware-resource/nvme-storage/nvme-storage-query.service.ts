import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class NvmeTargetQueryService {
  @Inject() zqlService: ZQLService

  private nvmeTargetLunInforDataLoader
  private nvmeTargetZoneDataLoader
  private nvmeTargetTransportDataLoader

  private nvmeTargetLunInfortMap = {}
  private nvmeTargetHostMap = {}

  constructor() {
    this.nvmeTargetLunInforDataLoader = new DataLoader(this._getLunDeviceUsageInfo)
    this.nvmeTargetZoneDataLoader = new DataLoader(this._getZones)
    this.nvmeTargetTransportDataLoader = new DataLoader(this._getTransport)
  }

  async queryList(params: IQueryAction) {
    const { type = 'NORMAL' } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case 'NORMAL':
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getNvmeTargetList(params, zqlCondition)

    return _resultResp
  }

  async getNvmeTargetList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'NvmeTarget',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const nvmeTargets = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: nvmeTargets,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__ZoneUuids__',
      '__ClusterUuids__'
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'NvmeTargetVO')
      )
    }

    if (_extraConditionMap['__ClusterUuids__']) {
      const clusterUuids = _.compact(
        _.flatten([
          _extraConditionMap['__ClusterUuids__']?.value ||
            _extraConditionMap['__ClusterUuids__']?.values
        ])
      )

      specicalCondition.push({
        'nvmeLun.uuid': {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'NvmeLunHostRef',
              fields: ['nvmeLunUuid'],
              condition: {
                hostUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Host',
                      fields: ['uuid'],
                      condition: {
                        clusterUuid: {
                          [ZOp.in]: clusterUuids
                        }
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

    if (_extraConditionMap['__ZoneUuids__']) {
      const zoneUuids = _.compact(
        _.flatten([
          _extraConditionMap['__ZoneUuids__']?.value || _extraConditionMap['__ZoneUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.or]: [
          {
            'nvmeLun.uuid': {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'NvmeLunHostRef',
                  fields: ['nvmeLunUuid'],
                  condition: {
                    hostUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'Host',
                          fields: ['uuid'],
                          condition: {
                            zoneUuid: {
                              [ZOp.in]: zoneUuids
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'NvmeLun',
                  fields: ['nvmeTargetUuid']
                }
              }
            }
          }
        ]
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getLunDeviceUsageInfo(uuid, nvmeTarget) {
    this.nvmeTargetLunInfortMap[uuid] = {
      totalLunNum: _.get(nvmeTarget, ['nvmeLuns', 'length'], 0) || 0,
      usedLunNum: 0,
      unusedLunNum: 0
    }

    return this.nvmeTargetLunInforDataLoader.load(uuid)
  }

  _getLunDeviceUsageInfo = async (uuids: string[]) => {
    const uuidList = _.chunk(_.uniq(uuids), 50)
    let resultList = []

    await Promise.allSettled(
      _.map(uuidList, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.COUNT,
              tableName: 'SharedBlock',
              condition: {
                diskUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'NvmeLun',
                      fields: ['wwid'],
                      condition: {
                        nvmeTargetUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results = [] } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    _.forEach(resultList, it => {
      const nvmeTargetUuid = it?.name
      const usedLunNum = _.get(it, 'total', 0)
      const totalLunNum = _.get(this.nvmeTargetLunInfortMap, [nvmeTargetUuid, 'totalLunNum'], 0)
      const unusedLunNum = usedLunNum >= totalLunNum ? 0 : totalLunNum - usedLunNum

      _.set(this.nvmeTargetLunInfortMap, nvmeTargetUuid, {
        usedLunNum,
        totalLunNum,
        unusedLunNum
      })
    })

    return uuids.map(uuid => _.get(this.nvmeTargetLunInfortMap, uuid))
  }

  getZones(uuid, nvmeTarget) {
    const nvmeLuns = _.get(nvmeTarget, 'nvmeLuns', [])
    const hostUuids = []

    for (const nvmeLun of nvmeLuns) {
      const nvmeLunHostRefs = _.get(nvmeLun, 'nvmeLunHostRefs', [])

      for (const nvmeLunHostRef of nvmeLunHostRefs) {
        hostUuids.push(nvmeLunHostRef?.hostUuid)
      }
    }

    this.nvmeTargetHostMap[uuid] = _.cloneDeep(hostUuids)

    return this.nvmeTargetZoneDataLoader.load(uuid)
  }

  _getZones = async (uuids: string[]) => {
    const nvmeTargetUuids = _.uniq(uuids)

    const zoneZql = [
      {
        tableName: 'Zone',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Host',
                fields: ['zoneUuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'nvmeLunHostRef',
                        fields: ['hostUuid'],
                        condition: {
                          nvmeLunUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'NvmeLun',
                                fields: ['uuid'],
                                condition: {
                                  nvmeTargetUuid: {
                                    [ZOp.in]: nvmeTargetUuids
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        tableName: 'Host',
        fields: ['uuid', 'zoneUuid'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'nvmeLunHostRef',
                fields: ['hostUuid'],
                condition: {
                  nvmeLunUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'NvmeLun',
                        fields: ['uuid'],
                        condition: {
                          nvmeTargetUuid: {
                            [ZOp.in]: nvmeTargetUuids
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]

    const zql = ZQL.multStringify(zoneZql)
    const { results } = await this.zqlService.call(zql)

    const zoneList = _.get(results, ['0', 'inventories'])
    const hostList = _.get(results, ['1', 'inventories'])

    const zoneMap = _.reduce(
      zoneList,
      (obj, zone) => {
        _.set(obj, zone.uuid, zone)

        return obj
      },
      {}
    )

    const hostZoneMap = _.reduce(
      hostList,
      (obj, host) => {
        _.set(obj, host.uuid, _.get(zoneMap, host.zoneUuid))

        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.uniqBy(
        _.compact(
          _.map(_.get(this.nvmeTargetHostMap, uuid, []), hostUuid =>
            _.get(hostZoneMap, hostUuid, null)
          )
        ),
        { uuid }
      )
    )
  }

  getTransport(uuid: string) {
    return this.nvmeTargetTransportDataLoader.load(uuid)
  }

  _getTransport = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'NvmeServer',
      fields: ['uuid', 'transport'],
      condition: {
        uuid: {
          [ZOp.in]: _.compact(_.uniq(uuids))
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    const map = new Map(list.map(item => [item.uuid, item.transport]))
    return uuids.map(uuid => map.get(uuid))
  }
}
