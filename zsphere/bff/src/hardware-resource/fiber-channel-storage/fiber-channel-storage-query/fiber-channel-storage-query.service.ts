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
export class FiberChannelStorageQueryService {
  @Inject() zqlService: ZQLService

  private fiberChannelStorageLunInforDataLoader
  private fiberChannelStorageZoneDataLoader

  private fiberChannelStorageLunInfortMap = {}
  private fiberChannelStorageHostMap = {}

  constructor() {
    this.fiberChannelStorageLunInforDataLoader = new DataLoader(this._getLunDeviceUsageInfo)
    this.fiberChannelStorageZoneDataLoader = new DataLoader(this._getZones)
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

    _resultResp = await this.getFiberChannelStorageList(params, zqlCondition)

    return _resultResp
  }

  async getFiberChannelStorageList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY

    const zqlObject = {
      action,
      tableName: 'FiberChannelStorage',
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
    const fiberChannelStorages = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: fiberChannelStorages,
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
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'FiberChannelStorageVO')
      )
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
            'fiberChannelLun.uuid': {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'ScsiLunHostRef',
                  fields: ['scsiLunUuid'],
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
                  tableName: 'FiberChannelLun',
                  fields: ['fiberChannelStorageUuid']
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__ClusterUuids__']) {
      const clusterUuids = _.compact(
        _.flatten([
          _extraConditionMap['__ClusterUuids__']?.value ||
            _extraConditionMap['__ClusterUuids__']?.values
        ])
      )

      specicalCondition.push({
        'fiberChannelLun.uuid': {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ScsiLunHostRef',
              fields: ['scsiLunUuid'],
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

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getLunDeviceUsageInfo(uuid, fiberChannelStorage) {
    const fiberChannelLuns = _.get(fiberChannelStorage, ['fiberChannelLuns'], [])
    let vmUsedLunNum = 0

    _.forEach(fiberChannelLuns || [], fiberChannelLun => {
      if (
        fiberChannelLun?.scsiLunVmInstanceRefs &&
        fiberChannelLun?.scsiLunVmInstanceRefs?.length > 0
      ) {
        vmUsedLunNum += 1
      }
    })

    this.fiberChannelStorageLunInfortMap[uuid] = {
      totalLunNum: _.get(fiberChannelLuns, 'length', 0) || 0,
      usedLunNum: vmUsedLunNum,
      unusedLunNum: 0
    }

    return this.fiberChannelStorageLunInforDataLoader.load(uuid)
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
                      tableName: 'FiberChannelLun',
                      fields: ['wwid'],
                      condition: {
                        fiberChannelStorageUuid: uuid
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
      const fiberChannelStorageUuid = it?.name
      const sharedBlockUsedLunNum = _.get(it, 'total', 0)

      const vmUsedLunNum = _.get(
        this.fiberChannelStorageLunInfortMap,
        [fiberChannelStorageUuid, 'usedLunNum'],
        0
      )
      const totalLunNum = _.get(
        this.fiberChannelStorageLunInfortMap,
        [fiberChannelStorageUuid, 'totalLunNum'],
        0
      )

      const usedLunNum = sharedBlockUsedLunNum + vmUsedLunNum
      const unusedLunNum = usedLunNum >= totalLunNum ? 0 : totalLunNum - usedLunNum

      _.set(this.fiberChannelStorageLunInfortMap, fiberChannelStorageUuid, {
        totalLunNum: totalLunNum,
        usedLunNum: usedLunNum,
        unusedLunNum
      })
    })

    return uuids.map(uuid => _.get(this.fiberChannelStorageLunInfortMap, uuid))
  }

  getZones(uuid, fiberChannelStorage) {
    const fiberChannelLuns = _.get(fiberChannelStorage, 'fiberChannelLuns', [])
    const hostUuids = []

    for (const fiberChannelLun of fiberChannelLuns) {
      const scsiLunHostRefs = _.get(fiberChannelLun, 'scsiLunHostRefs', [])

      for (const scsiLunHostRef of scsiLunHostRefs) {
        hostUuids.push(scsiLunHostRef?.hostUuid)
      }
    }

    this.fiberChannelStorageHostMap[uuid] = _.cloneDeep(hostUuids)

    return this.fiberChannelStorageZoneDataLoader.load(uuid)
  }

  _getZones = async (uuids: string[]) => {
    const fiberChannelStorageUuids = _.uniq(uuids)

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
                        tableName: 'scsiLunHostRef',
                        fields: ['hostUuid'],
                        condition: {
                          scsiLunUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'FiberChannelLun',
                                fields: ['uuid'],
                                condition: {
                                  fiberChannelStorageUuid: {
                                    [ZOp.in]: fiberChannelStorageUuids
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
                tableName: 'scsiLunHostRef',
                fields: ['hostUuid'],
                condition: {
                  scsiLunUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'FiberChannelLun',
                        fields: ['uuid'],
                        condition: {
                          fiberChannelStorageUuid: {
                            [ZOp.in]: fiberChannelStorageUuids
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
          _.map(_.get(this.fiberChannelStorageHostMap, uuid, []), hostUuid =>
            _.get(hostZoneMap, hostUuid, null)
          )
        ),
        { uuid }
      )
    )
  }
}
