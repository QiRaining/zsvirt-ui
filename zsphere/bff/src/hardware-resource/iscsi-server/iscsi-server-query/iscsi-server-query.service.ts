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

import {
  IscsiServerQueryType,
  IscsiServerRelateSummary,
  IscsiServerRelateSummaryArgs
} from '../iscsi-server.model'

@Injectable()
export class IscsiServerQueryService {
  @Inject() zqlService: ZQLService

  private iscsiServerZoneDataLoader
  private iscsiServerLunInforDataLoader
  private iscsiServerAddressDataLoader

  private iscsiServerClusterMap = {}
  private iscsiServerLunInfortMap = {}

  constructor() {
    this.iscsiServerZoneDataLoader = new DataLoader(this._getZones)
    this.iscsiServerLunInforDataLoader = new DataLoader(this._getLunDeviceUsageInfo)
    this.iscsiServerAddressDataLoader = new DataLoader(this._getIscsiServerAddress)
  }

  async queryList(params: IQueryAction) {
    const { type = IscsiServerQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case IscsiServerQueryType.NORMAL:
        break

      case IscsiServerQueryType.GET_CLUSTER_ATTACHABLE_ISCSI_SERVER:
        _extrazqlConditions = await this.getClusterAttachableISCSIServer(params.extraConditions)
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getIscsiServerList(params, zqlCondition)

    return _resultResp
  }

  async getIscsiServerList(param: IQueryAction, zqlCondition: any) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'IscsiServer',
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
    const iscsiServers = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: iscsiServers,
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
              tableName: 'IscsiServer',
              fields: ['uuid'],
              condition: {
                'iscsiCluster.clusterUuid': {
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
        'iscsiTarget.iscsiLun.wwid': {
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
                  tableName: 'IscsiServerClusterRef',
                  fields: ['iscsiServerUuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'IscsiServerClusterRef',
                  fields: ['iscsiServerUuid'],
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

  getLunDeviceUsageInfo(uuid, iscsiServer) {
    const iscsiTargets = _.get(iscsiServer, 'iscsiTargets', [])
    let totalLunNum = 0
    let vmUsedLunNum = 0

    _.forEach(iscsiTargets || [], iscsiTarget => {
      const iscsiLuns = _.get(iscsiTarget, 'iscsiLuns', [])

      _.forEach(iscsiLuns || [], iscsiLun => {
        totalLunNum += 1

        if (iscsiLun?.scsiLunVmInstanceRefs && iscsiLun?.scsiLunVmInstanceRefs?.length > 0) {
          vmUsedLunNum += 1
        }
      })
    })

    this.iscsiServerLunInfortMap[uuid] = {
      totalLunNum: totalLunNum,
      usedLunNum: vmUsedLunNum,
      unusedLunNum: 0
    }

    return this.iscsiServerLunInforDataLoader.load(uuid)
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
                      tableName: 'IscsiLun',
                      fields: ['wwid'],
                      condition: {
                        iscsiTargetUuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'IscsiTarget',
                              fields: ['uuid'],
                              condition: {
                                iscsiServerUuid: uuid
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
      const iscsiServerUuid = it?.name
      const sharedBlockUsedLunNum = _.get(it, 'total', 0)

      const totalLunNum = _.get(this.iscsiServerLunInfortMap, [iscsiServerUuid, 'totalLunNum'], 0)
      const vmUsedLunNum = _.get(this.iscsiServerLunInfortMap, [iscsiServerUuid, 'usedLunNum'], 0)
      const usedLunNum = vmUsedLunNum + sharedBlockUsedLunNum

      const unusedLunNum = usedLunNum >= totalLunNum ? 0 : totalLunNum - usedLunNum

      _.set(this.iscsiServerLunInfortMap, iscsiServerUuid, {
        totalLunNum: totalLunNum,
        usedLunNum: usedLunNum,
        unusedLunNum
      })
    })

    return uuids.map(uuid => _.get(this.iscsiServerLunInfortMap, uuid))
  }

  getZones(uuid, iscsiServer) {
    this.iscsiServerClusterMap[uuid] = _.map(
      _.get(iscsiServer, 'iscsiClusterRefs', []),
      it => it?.clusterUuid
    )

    return this.iscsiServerZoneDataLoader.load(uuid)
  }

  _getZones = async (uuids: string[]) => {
    const iscsiServerUuids = _.uniq(uuids)
    const zoneZql = [
      {
        tableName: 'Zone',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Cluster',
                fields: ['zoneUuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'IscsiServerClusterRef',
                        fields: ['clusterUuid'],
                        condition: {
                          iscsiServerUuid: {
                            [ZOp.in]: iscsiServerUuids
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
        tableName: 'Cluster',
        fields: ['uuid', 'zoneUuid'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'IscsiServerClusterRef',
                fields: ['clusterUuid'],
                condition: {
                  iscsiServerUuid: {
                    [ZOp.in]: iscsiServerUuids
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
    const clusterList = _.get(results, ['1', 'inventories'])

    const zoneMap = _.reduce(
      zoneList,
      (obj, zone) => {
        _.set(obj, zone.uuid, zone)

        return obj
      },
      {}
    )

    const clusterZoneMap = _.reduce(
      clusterList,
      (obj, cluster) => {
        _.set(obj, cluster.uuid, _.get(zoneMap, cluster.zoneUuid))

        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.uniqBy(
        _.compact(
          _.map(_.get(this.iscsiServerClusterMap, uuid, []), clusterUuid =>
            _.get(clusterZoneMap, clusterUuid, null)
          )
        ),
        { uuid }
      )
    )
  }

  async getClusterAttachableISCSIServer(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['clusterUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      clusterUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'IscsiServerClusterRef',
            fields: 'iscsiServerUuid',
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

  async getIscsiServerRelateResourceCount(
    params: IscsiServerRelateSummaryArgs
  ): Promise<IscsiServerRelateSummary> {
    const { uuids, clusterUuids = [], wwids = [] } = params
    let primaryStorageResults
    if (wwids?.length > 0) {
      const primaryStorageZql = {
        action: ZQLAction.COUNT,
        tableName: 'PrimaryStorage',
        condition: {
          attachedClusterUuids: {
            [ZOp.in]: clusterUuids
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                action: ZQLAction.QUERY,
                tableName: 'SharedBlockGroupPrimaryStorage',
                fields: ['uuid'],
                condition: {
                  'sharedBlocks.diskUuid': {
                    [ZOp.in]: wwids
                  }
                }
              }
            }
          }
        }
      }
      const { results } = await this.zqlService.call(ZQL.stringify(primaryStorageZql))
      primaryStorageResults = results
    }

    const VmInstanceCondition = {
      [ZOp.or]: [
        {
          'rootVolume.primaryStorageUuid': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'SharedBlockGroupPrimaryStorage',
                fields: ['uuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SharedBlock',
                        fields: ['sharedBlockGroupUuid'],
                        condition: {
                          diskUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'ScsiLun',
                                fields: ['wwid'],
                                condition: {
                                  uuid: {
                                    [ZOp.in]: {
                                      [ZOp.query]: {
                                        tableName: 'IscsiLun',
                                        fields: ['uuid'],
                                        condition: {
                                          iscsiTargetUuid: {
                                            [ZOp.in]: {
                                              [ZOp.query]: {
                                                tableName: 'IscsiTarget',
                                                fields: ['uuid'],
                                                condition: {
                                                  iscsiServerUuid: {
                                                    [ZOp.in]: _.uniq(uuids)
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
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ScsiLunVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  scsiLunUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'IscsiLun',
                        fields: ['uuid'],
                        condition: {
                          iscsiTargetUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'IscsiTarget',
                                fields: ['uuid'],
                                condition: {
                                  iscsiServerUuid: {
                                    [ZOp.in]: _.uniq(uuids)
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
      ],
      type: 'UserVm'
    }

    if (clusterUuids?.length > 0) {
      _.assign(VmInstanceCondition, {
        clusterUuid: {
          [ZOp.in]: clusterUuids
        }
      })
    }

    const vmCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'VmInstance',
      condition: VmInstanceCondition
    }

    const vmZql = ZQL.stringify(vmCountZql)
    const { results: vmResults } = await this.zqlService.call(vmZql)

    const volumeCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'Volume',
      condition: {
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SharedBlock',
                      fields: ['sharedBlockGroupUuid'],
                      condition: {
                        diskUuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'ScsiLun',
                              fields: ['wwid'],
                              condition: {
                                uuid: {
                                  [ZOp.in]: {
                                    [ZOp.query]: {
                                      tableName: 'IscsiLun',
                                      fields: ['uuid'],
                                      condition: {
                                        iscsiTargetUuid: {
                                          [ZOp.in]: {
                                            [ZOp.query]: {
                                              tableName: 'IscsiTarget',
                                              fields: ['uuid'],
                                              condition: {
                                                iscsiServerUuid: {
                                                  [ZOp.in]: _.uniq(uuids)
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
                    }
                  }
                },
                ...(clusterUuids?.length > 0
                  ? {
                      'cluster.uuid': {
                        [ZOp.in]: clusterUuids
                      }
                    }
                  : {})
              }
            }
          }
        },
        type: 'Data'
      }
    }

    const volumeZql = ZQL.stringify(volumeCountZql)
    const { results: volumeResults } = await this.zqlService.call(volumeZql)

    return {
      vmInstanceCount: _.get(vmResults, ['0', 'total'], 0),
      volumeCount: _.get(volumeResults, ['0', 'total'], 0),
      primaryStorageCount: _.get(primaryStorageResults, ['0', 'total'], 0)
    }
  }

  async queryIscsiTargetList(param: IQueryAction) {
    const zqlCondition = QueryConditionTranslator.translate(param.conditions)
    const { results } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'IscsiTarget',
        condition: zqlCondition,
        orderBy: param.sortBy,
        orderDirection: param.sortDirection,
        limit: param.limit,
        offset: param.start,
        returnWith: {
          total: true
        }
      })
    )
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return { list, total }
  }

  getIscsiServerAddress(uuid: string) {
    return this.iscsiServerAddressDataLoader.load(uuid)
  }

  _getIscsiServerAddress = async (uuids: string[]) => {
    const uniqUuids = new Set(uuids)
    const { results } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'IscsiServer',
        condition: {
          'iscsiTarget.uuid': {
            [ZOp.in]: [...uniqUuids]
          }
        }
      })
    )
    const list = results?.[0]?.inventories ?? []
    const map = new Map()
    list.forEach(server => {
      const addr = `${server.ip}:${server.port}`
      server.iscsiTargets?.forEach(target => {
        if (uniqUuids.has(target.uuid)) {
          map.set(target.uuid, addr)
        }
      })
    })
    return uuids.map(uuid => map.get(uuid))
  }
}
