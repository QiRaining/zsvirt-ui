import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { Zone } from '../zone/zone.model'
import { NvmeServer, NvmeServerQueryType } from './nvme-server.model'

@Injectable()
export class NvmeServerQueryService {
  @Inject() zqlService: ZQLService

  private nvmeServerLunInforDataLoader
  private zonesDataLoader: DataLoader<NvmeServer, Zone[], string>

  private nvmeServerLunInfortMap = {}

  constructor() {
    this.nvmeServerLunInforDataLoader = new DataLoader(this._getLunDeviceUsageInfo)
    this.zonesDataLoader = new DataLoader(this._getZones, {
      cacheKeyFn: nvmeServer => nvmeServer.uuid
    })
  }

  async queryList(params: IQueryAction) {
    const { type = NvmeServerQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case NvmeServerQueryType.NORMAL:
        break

      case NvmeServerQueryType.GET_CLUSTER_ATTACHABLE_NVME_SERVER:
        _extrazqlConditions = await this.getClusterAttachableNvmeServer(params.extraConditions)
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getNvmeServerList(params, zqlCondition)

    return _resultResp
  }

  async getNvmeServerList(param: IQueryAction, zqlCondition: any) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'NvmeServer',
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
    const nvmeServers = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: nvmeServers,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      '__SharedBlockUuids__',
      '__NotInClusterUuids__'
    ])

    const specicalCondition = []
    if (_extraConditionMap['__NotInClusterUuids__']) {
      const clusterUuids: string[] = _.uniq(
        _.compact(
          _.flatten([
            _extraConditionMap['__NotInClusterUuids__']?.value ||
              _extraConditionMap['__NotInClusterUuids__']?.values
          ])
        )
      )
      const clusterZqlCondition = {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'NvmeServer',
              fields: ['uuid'],
              condition: {
                'nvmeCluster.clusterUuid': {
                  [ZOp.has]: clusterUuids
                }
              }
            }
          }
        }
      }
      specicalCondition.push(clusterZqlCondition)
    }

    if (_extraConditionMap['__SharedBlockUuids__']) {
      const sharedBlockUuids: string[] = _.uniq(
        _.compact(
          _.flatten([
            _extraConditionMap['__SharedBlockUuids__']?.value ||
              _extraConditionMap['__SharedBlockUuids__']?.values
          ])
        )
      )

      const sharedBlockZqlCondition = {
        'nvmeTarget.nvmeLun.wwid': {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlock',
              fields: ['diskUuid'],
              condition: {
                sharedBlockGroupUuid: {
                  [ZOp.in]: sharedBlockUuids
                }
              }
            }
          }
        }
      }
      specicalCondition.push(sharedBlockZqlCondition)
    }
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid = _extraConditionMap['zoneUuid']?.value

      const zoneZqlCondition = {
        [ZOp.or]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'NvmeServerClusterRef',
                  fields: ['nvmeServerUuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'NvmeServerClusterRef',
                  fields: ['nvmeServerUuid'],
                  condition: {
                    clusterUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'Cluster',
                          fields: ['uuid'],
                          condition: {
                            zoneUuid: zoneUuid
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
      }
      specicalCondition.push(zoneZqlCondition)
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getClusterAttachableNvmeServer(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['clusterUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      clusterUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'NvmeServerClusterRef',
            fields: 'nvmeServerUuid',
            condition: {
              clusterUuid: {
                [ZOp.eq]: params?.clusterUuid
              }
            }
          }
        }
      }
    }

    return params?.clusterUuid ? zqlCondition : undefined
  }

  getLunDeviceUsageInfo(uuid, nvmeServer) {
    const nvmeTargets = _.get(nvmeServer, 'nvmeTargets', [])
    let totalLunNum = 0

    _.forEach(nvmeTargets || [], nvmeTarget => {
      const nvmeLuns = _.get(nvmeTarget, 'nvmeLuns', [])

      _.forEach(nvmeLuns || [], nvmeLun => {
        totalLunNum += 1
      })
    })

    this.nvmeServerLunInfortMap[uuid] = {
      totalLunNum: totalLunNum,
      usedLunNum: 0,
      unusedLunNum: 0
    }

    return this.nvmeServerLunInforDataLoader.load(uuid)
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
                        nvmeTargetUuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'NvmeTarget',
                              fields: ['uuid'],
                              condition: {
                                nvmeServerUuid: uuid
                              }
                            }
                          }
                        }
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
      const nvmeServerUuid = it?.name
      const sharedBlockUsedLunNum = _.get(it, 'total', 0)

      const totalLunNum = _.get(this.nvmeServerLunInfortMap, [nvmeServerUuid, 'totalLunNum'], 0)

      const usedLunNum = sharedBlockUsedLunNum

      const unusedLunNum = usedLunNum >= totalLunNum ? 0 : totalLunNum - usedLunNum

      _.set(this.nvmeServerLunInfortMap, nvmeServerUuid, {
        totalLunNum: totalLunNum,
        usedLunNum: usedLunNum,
        unusedLunNum
      })
    })

    return uuids.map(uuid => _.get(this.nvmeServerLunInfortMap, uuid))
  }

  async getZones(nvmeServer: NvmeServer) {
    return this.zonesDataLoader.load(nvmeServer)
  }

  _getZones = async (nvmeServers: NvmeServer[]) => {
    const allClusterUuids = _.uniq(
      _.flatten(
        nvmeServers.map(nvmeServer => nvmeServer.nvmeClusterRefs?.map(ref => ref.clusterUuid) ?? [])
      )
    )
    const { results } = await this.zqlService.call(
      ZQL.multStringify([
        {
          tableName: 'Zone',
          condition: {
            'cluster.uuid': {
              [ZOp.in]: allClusterUuids
            }
          }
        },
        {
          tableName: 'Cluster',
          fields: ['uuid', 'zoneUuid'],
          condition: {
            uuid: {
              [ZOp.in]: allClusterUuids
            }
          }
        }
      ])
    )
    const zoneList = _.get(results, ['0', 'inventories'], [])
    const clusterList = _.get(results, ['1', 'inventories'], [])
    const zoneMap = new Map(zoneList.map(zone => [zone.uuid, zone]))
    const clusterZoneMap = new Map<string, Zone>(
      clusterList.map(cluster => [cluster.uuid, zoneMap.get(cluster.zoneUuid)])
    )
    return nvmeServers.map(nvmeServer => {
      const zones =
        nvmeServer.nvmeClusterRefs?.map(ref => clusterZoneMap.get(ref.clusterUuid)) ?? []
      return _.uniqBy(_.compact(zones), 'uuid')
    })
  }
}
