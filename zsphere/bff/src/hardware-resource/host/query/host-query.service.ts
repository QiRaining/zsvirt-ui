import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  QueryParam as IQueryParam,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateHostKernelInterfacesAction } from '@/api/zstack/GetCandidateHostKernelInterfacesAction'
import {
  GetCandidateZonesClustersHostsForCreatingVmAction,
  GetCandidateZonesClustersHostsForCreatingVmActionParam
} from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import { GetCpuMemoryCapacityAction } from '@/api/zstack/GetCpuMemoryCapacityAction'
import { GetHostIommuStateAction } from '@/api/zstack/GetHostIommuStateAction'
import { GetHostIommuStatusAction } from '@/api/zstack/GetHostIommuStatusAction'
import { GetHostNUMATopologyAction } from '@/api/zstack/GetHostNUMATopologyAction'
import { GetLocalStorageHostDiskCapacityAction } from '@/api/zstack/GetLocalStorageHostDiskCapacityAction'
import { GetNodeRolesAction } from '@/api/zstack/GetNodeRolesAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryZoneAction } from '@/api/zstack/QueryZoneAction'
import { HostState, HostStatus } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'

import { HostQueryType, NodeType } from '../host.model'

@Injectable()
export class HostQueryService {
  @Inject()
  queryHostAction: QueryHostAction
  @Inject()
  queryClusterAction: QueryClusterAction
  @Inject()
  getResourceAccountAction: GetResourceAccountAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction
  @Inject()
  queryZoneAction: QueryZoneAction
  @Inject()
  queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject()
  getLocalStorageHostDiskCapacityAction: GetLocalStorageHostDiskCapacityAction
  @Inject()
  getHostIommuStateAction: GetHostIommuStateAction
  @Inject()
  getHostIommuStatusAction: GetHostIommuStatusAction
  @Inject()
  getCpuMemoryCapacityAction: GetCpuMemoryCapacityAction
  @Inject()
  querySystemTagAction: QuerySystemTagAction
  @Inject() getHostNUMATopologyAction: GetHostNUMATopologyAction
  @Inject() zqlService: ZQLService
  @Inject()
  getCandidateHostKernelInterfacesAction: GetCandidateHostKernelInterfacesAction
  @Inject() getNodeRolesAction: GetNodeRolesAction

  private clusterDataLoader
  private ownerDataLoader
  private zoneDataLoader
  private localStorageHostDiskCapacityDataLoader
  private hostIommuDataLoader
  private globalConifgDataLoader
  private systemInfoDataLoader
  private zwatchInfoDataLoader
  private relatedVmCountDataLoader
  private relatedVolumeCountDataLoader
  private getBondRelatedVSwitchDataloader
  private getExtraipsDataLoader
  private getConnectedTimeDataLoader
  private physicalNicListDataLoader
  private bondListDataLoader
  private hostCallBackIpDataLoader
  private hostNodeInfoDataLoader
  private hostQemuStateDataLoader
  private hostGroupDataLoader
  private hostUsageDataLoader
  private hostKernelInterfacesDataLoader

  private clusterMap: any = {}
  private zoneMap: any = {}
  private cpuMemoryCapacityMap: any = {}
  private localStorageHostDiskCapacityMap: any = {}

  constructor() {
    this.clusterDataLoader = new DataLoader(this._getCluster)
    this.ownerDataLoader = new DataLoader(this._getOwner)
    this.zoneDataLoader = new DataLoader(this._getZone)
    this.localStorageHostDiskCapacityDataLoader = new DataLoader(
      this._getLocalStorageHostDiskCapacity
    )
    this.hostIommuDataLoader = new DataLoader(this._getHostIommu)
    this.globalConifgDataLoader = new DataLoader(this._getGlobalConifg)
    this.systemInfoDataLoader = new DataLoader(this._getSystemInfo)
    this.zwatchInfoDataLoader = new DataLoader(this._getZWatchInfo)
    this.relatedVmCountDataLoader = new DataLoader(this._getRelatedVmCount)
    this.relatedVolumeCountDataLoader = new DataLoader(this._getRelatedVolumeCount)
    this.getBondRelatedVSwitchDataloader = new DataLoader(this._getBondRelatedVSwitch)
    this.getExtraipsDataLoader = new DataLoader(this._getExtraips)
    this.getConnectedTimeDataLoader = new DataLoader(this._getConnectedTime)
    this.physicalNicListDataLoader = new DataLoader(this._physicalNicList)
    this.hostCallBackIpDataLoader = new DataLoader(this._getCallBackIp)
    this.bondListDataLoader = new DataLoader(this._bondList)
    this.hostQemuStateDataLoader = new DataLoader(this._hostQemuStateDataLoader)
    this.hostGroupDataLoader = new DataLoader(this._hostGroupDataLoader)
    this.hostNodeInfoDataLoader = new DataLoader(this._getHostNodeInfo)
    this.hostUsageDataLoader = new DataLoader(this._getHostUsageList)
    this.hostKernelInterfacesDataLoader = new DataLoader(this._getKernelInterfaces)
  }

  async query(params, action: ZQLAction = ZQLAction.QUERY) {
    const { type = HostQueryType.Normal, conditions = [] } = params
    let _extrazqlConditions

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      '__SharedBlockUuid__',
      'average.cpu.usage',
      'memory.usage',
      '__tagUuid__',
      '__VirtualRouterOfferingAssociationArchitecture__',
      'qemuState',
      'l2NetworkUuid',
      'externalNetwork',
      'internalNetwork'
    ])

    switch (type) {
      // 普通查询
      case HostQueryType.Normal:
        break

      // 可创建云主机的host，物理机状态为（Enabled）
      case HostQueryType.CreateVmCandidate:
        _extrazqlConditions = await this.getHostForCreateVmCandidate(params)
        break

      // 可重启的host
      case HostQueryType.StartingVmCandidate:
        _extrazqlConditions = await this.getHostForStartFromVmCandidate(params)
        break

      // 热迁移获取可用物理机，云主机状态为（Running, Paused）
      case HostQueryType.GetVmMigrationCandidateHosts:
        _extrazqlConditions = await this.getVmMigrationCandidateHosts(params)
        break

      // 冷迁移获取可用物理机，云主机状态为（Stopped）
      case HostQueryType.LocalStorageGetVolumeMigratableHosts:
        _extrazqlConditions = await this.getLocalStorageGetVolumeMigratableHosts(params)
        break

      case HostQueryType.RecoverRootVolumeBackupCandidate:
        _extrazqlConditions = this.getRecoverRootVolumeBackupCandidate(params)
        break

      case HostQueryType.CreateV2vConversionHostCandidate:
        _extrazqlConditions = {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'V2VConversionHost',
                fields: ['hostUuid']
              }
            }
          }
        }
        break

      case HostQueryType.GetHostCandidatesForAddToHostGroup:
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Host',
                fields: ['uuid'],
                condition: {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'HostSchedulingRuleGroupRef',
                        fields: ['hostUuid']
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break

      case HostQueryType.GetHostByHostGroup:
        _extrazqlConditions = await this.getHostByHostGroup(params)
        break

      case HostQueryType.GetHostNotInVSwitch:
        _extrazqlConditions = await this.getHostNotInVSwitch(params)
        break
      // case HostQueryType.RecoverDataVolumeBackupCandidate:
      //   _resultResp = this.getRecoverDataVolumeBackupCandidate(clone)
      //   break

      // 推荐
      // case HostQueryType.Recommend:
      //   _extrazqlConditions = this.getRecommendHosts(params, _extraConditionMap)
      //   break

      case HostQueryType.GetHostCandidatesForVmMigration:
        const extraConditionsMap = conditionsToObject(params?.extraConditions)
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'GetHostCandidatesForVmMigration',
                output: 'inventories.uuid',
                condition: {
                  vmInstanceUuid: extraConditionsMap?.['vmInstanceUuid'],
                  dstPrimaryStorageUuid: extraConditionsMap?.['dstPrimaryStorageUuid']
                }
              }
            }
          }
        }
        break

      case HostQueryType.GetDisasterRecoveryStorageCandidates:
        _extrazqlConditions = {
          managementIp: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'ImageStoreBackupStorage',
                fields: ['hostname']
              }
            }
          }
        }
        break

      default:
        break
    }

    const specicalCondition = []

    if (_extraConditionMap['__tagUuid__']) {
      const tagQueryOp = _extraConditionMap['__tagUuid__'].op
      if (['in', 'notIn'].indexOf(tagQueryOp) !== -1) {
        const tagFilterUuids = _extraConditionMap['__tagUuid__'].values
        if (tagFilterUuids?.filter(t => t === '__null__')?.length === 0) {
          specicalCondition.push({
            __tagUuid__: {
              [ZOp[tagQueryOp]]: {
                [ZOp.query]: {
                  tableName: 'UserTag',
                  fields: ['tagPatternUuid'],
                  condition: {
                    tagPatternUuid: {
                      [ZOp.in]: tagFilterUuids
                    }
                  }
                }
              }
            }
          })
        } else {
          //Null和正常标签
          specicalCondition.push({
            [ZOp.or]: [
              {
                __tagUuid__: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid']
                    }
                  }
                }
              },
              {
                __tagUuid__: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid'],
                      condition: {
                        tagPatternUuid: {
                          [ZOp.in]: tagFilterUuids.filter(t => t !== '__null__')
                        }
                      }
                    }
                  }
                }
              }
            ]
          })
        }
      } else {
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
          }
        })
      }
    }

    if (_extraConditionMap['qemuState']) {
      const qemuState: string = _extraConditionMap['qemuState'].value

      const qemuStateZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'KvmHypervisorInfo',
              fields: ['uuid'],
              condition: {
                matchState: {
                  [ZOp.eq]: qemuState
                }
              }
            }
          }
        }
      }
      specicalCondition.push(qemuStateZqlCondition)
    }

    if (_extraConditionMap['__VirtualRouterOfferingAssociationArchitecture__']) {
      const virtualRouterOfferingUuids: string[] = _.compact(
        _.flatten([
          _extraConditionMap['__VirtualRouterOfferingAssociationArchitecture__']?.value ||
            _extraConditionMap['__VirtualRouterOfferingAssociationArchitecture__']?.values
        ])
      )

      const virtualRouterOfferingZqlCondition = {
        architecture: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Image',
              fields: ['architecture'],
              condition: {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'VirtualRouterOffering',
                      fields: ['imageUuid'],
                      condition: {
                        uuid: {
                          [ZOp.in]: virtualRouterOfferingUuids
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

      specicalCondition.push(virtualRouterOfferingZqlCondition)
    }

    if (_extraConditionMap['l2NetworkUuid']) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'L2NetworkHostRef',
              fields: ['hostUuid'],
              condition: {
                l2NetworkUuid: {
                  [ZOp.eq]: _extraConditionMap['l2NetworkUuid'].value
                }
              }
            }
          }
        }
      })
    }

    /**
     * @see
     */
    if (_extraConditionMap['__SharedBlockUuid__']?.value) {
      specicalCondition.push({
        clusterUuid: {
          [Op.in]: {
            [Op.query]: {
              tableName: 'PrimaryStorageClusterRef',
              fields: ['clusterUuid'],
              condition: {
                primaryStorageUuid: {
                  [Op.in]: {
                    [Op.query]: {
                      tableName: 'SharedBlock',
                      fields: ['sharedBlockGroupUuid'],
                      condition: {
                        uuid: {
                          [Op.eq]: _extraConditionMap['__SharedBlockUuid__'].value
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

    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'HostVO',
      conditions: _conditions
    })
    if (resourceAttributeZqlCondition) {
      specicalCondition.push(resourceAttributeZqlCondition)
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(_extrazqlConditions))
    )

    const zqlObject = {
      action,
      tableName: 'Host',
      condition: zqlCondition,
      orderBy: params?.sortBy,
      orderDirection: params?.sortDirection,
      limit: params?.limit,
      offset: params?.start,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data
    return { list, total }
  }

  async getHostForCreateVmCandidate(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const candidateParam: GetCandidateZonesClustersHostsForCreatingVmActionParam = {
      imageUuid: extraConditionsMap['imageUuid'],
      l3NetworkUuids: extraConditionsMap['l3NetworkUuids'],
      systemTags: []
    }

    const instanceOfferingUuid = extraConditionsMap['instanceOfferingUuid']
    if (instanceOfferingUuid) {
      candidateParam.instanceOfferingUuid = instanceOfferingUuid
    }

    const cpuNum = extraConditionsMap['cpuNum']
    if (cpuNum) {
      candidateParam.cpuNum = cpuNum
    }

    const memorySize = extraConditionsMap['memorySize']
    if (memorySize) {
      candidateParam.memorySize = memorySize
    }

    const clusterUuid = extraConditionsMap['clusterUuid']
    if (clusterUuid) {
      candidateParam.clusterUuid = clusterUuid
    }

    const rootDiskSize = extraConditionsMap['rootDiskSize']
    if (rootDiskSize) {
      candidateParam.rootDiskSize = rootDiskSize
    }

    const rootDiskOfferingUuid = extraConditionsMap['rootDiskOfferingUuid']
    if (rootDiskOfferingUuid) {
      candidateParam.rootDiskOfferingUuid = rootDiskOfferingUuid
    }

    const vmGroupUuid = extraConditionsMap['vmGroupUuid']
    if (vmGroupUuid) {
      candidateParam.systemTags.push(`vmSchedulingRuleGroupUuid::${vmGroupUuid}`)
    }

    const resp = await this.getCandidateZonesClustersHostsForCreatingVmAction.call(candidateParam)
    const hostUuidList = resp?.hosts.map(it => it.uuid)

    const primaryStorageUuid = extraConditionsMap['primaryStorageUuid']
    if (primaryStorageUuid) {
      return {
        'cluster.primaryStorage.uuid': primaryStorageUuid,
        uuid: {
          [ZOp.in]: hostUuidList
        },
        state: 'Enabled'
      }
    }

    return {
      uuid: {
        [ZOp.in]: hostUuidList
      },
      state: 'Enabled'
    }
  }

  async getHostForStartFromVmCandidate(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const vmInstanceUuid = extraConditionsMap['vmInstanceUuid']

    return vmInstanceUuid
      ? {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'GetVmStartingCandidateClustersHosts',
                output: 'hosts.uuid',
                condition: {
                  uuid: vmInstanceUuid
                }
              }
            }
          }
        }
      : undefined
  }

  // getRecoverDataVolumeBackupCandidate(params: QueryAction) {
  //   const { extraConditions } = params
  //   const vmUuid = (conditionsToObject(extraConditions) as any)?.vmUuid
  //   // const clusterUuid = (conditionsToObject(extraConditions) as any)?.clusterUuid
  //   return {
  //     uuid: {
  //       [ZOp.in]: {
  //         [ZOp.query]: {
  //           tableName: 'localStorageHostRef',
  //           fields: ['hostUuid'],
  //           condition: {
  //             uuid: {
  //               [ZOp.in]: {
  //                 [ZOp.query]: {
  //                   tableName: 'Volume',
  //                   fields: ['primaryStorageUuid'],
  //                   condition: {
  //                     uuid: {
  //                       [ZOp.in]: {
  //                         [ZOp.query]: {
  //                           tableName: 'vminstance',
  //                           fields: ['rootVolumeUuid'],
  //                           condition: {
  //                             uuid: vmUuid,
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             },
  //           }
  //         }
  //       }
  //     },
  //   }
  // }
  getRecoverRootVolumeBackupCandidate(params: QueryAction) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const primaryStorageUuid = extraConditionsMap['primaryStorageUuid']
    if (primaryStorageUuid) {
      return {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'host',
              fields: ['uuid'],
              condition: {
                'cluster.primaryStorage.uuid': primaryStorageUuid
              }
            }
          }
        }
      }
    }
  }

  async getVmMigrationCandidateHosts(params) {
    const { extraConditions = [] } = params
    const sortBy = _.cloneDeep(params?.sortBy)
    const extraConditionsMap = conditionsToObject(extraConditions)

    const vmInstanceUuid = extraConditionsMap['vmInstanceUuid']
    const filterType = extraConditionsMap['__filterType__']
    const metricName = sortBy === '__cpuUsage__' ? 'CPUAllIdleUtilization' : 'MemoryFreeInPercent'

    if (filterType === 'Recommend') {
      params.sortBy = 'createDate'
      const baseZql = {
        tableName: 'Host',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'GetVmMigrationCandidateHosts',
                output: 'inventories.uuid',
                condition: {
                  vmInstanceUuid
                }
              }
            }
          }
        },
        returnWith: {
          zwatch: [
            {
              metricName: `${metricName}`,
              offsetAheadOfCurrentTime: 10,
              functions: ['average(groupBy="HostUuid")', `top(num=${params?.topNumber})`]
            }
          ]
        }
      }

      try {
        const zql = ZQL.stringify(baseZql)
        const { results = [] } = await this.zqlService.call(zql)
        const { returnWith = {} } = results?.[0]
        const hostUuidList =
          returnWith?.zwatch?.map(it => it?.labels?.HostUuid)?.filter(Boolean) ?? []
        return {
          uuid: {
            [ZOp.in]: hostUuidList
          }
        }
      } catch (error) {
        return {
          uuid: {
            [ZOp.in]: []
          }
        }
      }
    }

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetVmMigrationCandidateHosts',
            output: 'inventories.uuid',
            condition: {
              vmInstanceUuid
            }
          }
        }
      }
    }
  }

  async getLocalStorageGetVolumeMigratableHosts(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const sortBy = _.cloneDeep(params?.sortBy)

    const volumeUuid = extraConditionsMap['volumeUuid']
    const filterType = extraConditionsMap['__filterType__']
    const metricName = sortBy === '__cpuUsage__' ? 'CPUAllIdleUtilization' : 'MemoryFreeInPercent'

    if (filterType === 'Recommend') {
      params.sortBy = 'createDate'
      const baseZql = {
        tableName: 'Host',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'LocalStorageGetVolumeMigratableHosts',
                output: 'inventories.uuid',
                condition: {
                  volumeUuid
                }
              }
            }
          }
        },
        returnWith: {
          zwatch: [
            {
              metricName: `${metricName}`,
              offsetAheadOfCurrentTime: 10,
              functions: ['average(groupBy="HostUuid")', `top(num=${params?.topNumber})`]
            }
          ]
        }
      }

      try {
        const zql = ZQL.stringify(baseZql)
        const { results = [] } = await this.zqlService.call(zql)
        const { returnWith = {} } = results?.[0]
        const hostUuidList = returnWith?.zwatch?.map(it => it?.labels?.HostUuid) ?? []
        return {
          uuid: {
            [ZOp.in]: hostUuidList
          }
        }
      } catch (error) {
        return {
          uuid: {
            [ZOp.in]: []
          }
        }
      }
    }

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'LocalStorageGetVolumeMigratableHosts',
            output: 'inventories.uuid',
            condition: {
              volumeUuid
            }
          }
        }
      }
    }
  }

  async getRecommendHosts(params, extraMap) {
    const { limit = 20 } = params
    const metricName =
      extraMap['average.cpu.usage']?.value ??
      extraMap['memory.usage']?.value ??
      'CPUAllIdleUtilization'
    const extraConditionsMap = conditionsToObject(params.extraConditions)
    const volumeUuid = extraConditionsMap['volumeUuid']

    const baseZql = {
      tableName: 'Host',
      condition: {
        uuid: {
          [ZOp.in]: `getapi(api='LocalStorageGetVolumeMigratableHosts',output='inventories.uuid',volumeUuid='${volumeUuid}')`
        }
      },
      returnWith: {
        zwatch: [
          {
            metricName: `${metricName}`,
            offsetAheadOfCurrentTime: 10,
            functions: ['average(groupBy="HostUuid")', `top(num=${limit})`]
          }
        ]
      }
    }

    try {
      const zql = ZQL.stringify(baseZql)
      const { results = [] } = await this.zqlService.call(zql)
      const { returnWith = {} } = results?.[0]
      const hostUuidList = returnWith?.zwatch?.map(it => it?.labels?.HostUuid)
      return {
        uuid: hostUuidList
      }
    } catch (error) {
      return {
        uuid: []
      }
    }
  }

  getHostByHostGroup(param) {
    const conditionsMap = conditionsToObject(param?.extraConditions)
    const hostGroupUuid = conditionsMap?.['hostGroupUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'HostSchedulingRuleGroupRef',
            fields: ['hostUuid'],
            condition: {
              hostGroupUuid: hostGroupUuid
            }
          }
        }
      }
    }
  }

  async getCurrentHostIommu(uuid) {
    const stateData = await this.getHostIommuStateAction.call({ uuid })
    const statusData = await this.getHostIommuStatusAction.call({ uuid })
    return { state: stateData?.state, status: statusData?.status }
  }

  getHostNotInVSwitch(param) {
    const conditionsMap = conditionsToObject(param?.extraConditions)
    const vswitchUuid = conditionsMap?.['vswitchUuid']
    return {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'l2networkhostref',
            fields: ['hostUuid'],
            condition: {
              l2NetworkUuid: vswitchUuid
            }
          }
        }
      }
    }
  }

  getCluster(uuid, clusterUuid) {
    this.clusterMap[uuid] = {
      uuid,
      clusterUuid
    }
    return this.clusterDataLoader.load(uuid)
  }

  _getCluster = async (uuids = []) => {
    const clusterUuidList = uuids.map(uuid => this.clusterMap[uuid].clusterUuid)
    const params: IQueryParam = {
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: clusterUuidList
        }
      ]
    }
    const resp = await this.queryClusterAction.call(params)
    const clusterList = resp.inventories
    return uuids.map(uuid => {
      const cluster = clusterList.find(
        cluster => cluster.uuid === this.clusterMap[uuid].clusterUuid
      )
      if (cluster) {
        return cluster
      } else {
        return null
      }
    })
  }

  getOwner(uuid) {
    return this.ownerDataLoader.load(uuid)
  }

  _getOwner = async (resourceUuids = []) => {
    const { inventories: ownerMap } = await this.getResourceAccountAction.call({
      resourceUuids
    })
    return resourceUuids.map(uuid => {
      const owner = _.get(ownerMap, uuid)
      if (owner) {
        return owner
      } else {
        return null
      }
    })
  }

  getZone(uuid, zoneUuid) {
    this.zoneMap[uuid] = {
      uuid,
      zoneUuid
    }
    return this.zoneDataLoader.load(uuid)
  }

  _getZone = async (uuids = []) => {
    const zoneUuidList = uuids.map(uuid => this.zoneMap[uuid].zoneUuid)
    const params: IQueryParam = {
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: zoneUuidList
        }
      ]
    }
    const resp = await this.queryZoneAction.call(params)
    const zoneList = resp.inventories
    return uuids.map(uuid => {
      const zone = zoneList.find(zone => zone.uuid === this.zoneMap[uuid].zoneUuid)
      if (zone) {
        return zone
      } else {
        return null
      }
    })
  }

  getLocalStorageHostDiskCapacity(uuid, primaryStorageUuid) {
    this.localStorageHostDiskCapacityMap[uuid] = {
      uuid,
      primaryStorageUuid
    }
    return this.localStorageHostDiskCapacityDataLoader.load(uuid)
  }

  _getLocalStorageHostDiskCapacity = async (uuids = []) => {
    const psUuids = []
    const collectWithoutPrimaryStorageHostUuidList = []
    for (const hostUuid of uuids) {
      const psUuid = _.get(this.localStorageHostDiskCapacityMap, [hostUuid, 'primaryStorageUuid'])

      if (!!psUuid) {
        psUuids.push(psUuid)
      } else {
        collectWithoutPrimaryStorageHostUuidList.push(hostUuid)
      }
    }

    const zqlObject = [
      {
        tableName: 'LocalStorageHostRef',
        condition: {
          hostUuid: {
            [ZOp.in]: _.difference(uuids, collectWithoutPrimaryStorageHostUuidList)
          },
          primaryStorageUuid: {
            [ZOp.in]: psUuids
          }
        }
      },
      {
        action: ZQLAction.SUM,
        tableName: 'LocalStorageHostRef',
        fields: [
          'availableCapacity',
          'availablePhysicalCapacity',
          'totalCapacity',
          'totalPhysicalCapacity'
        ],
        sumBy: 'hostUuid',
        condition: {
          hostUuid: {
            [ZOp.in]: collectWithoutPrimaryStorageHostUuidList
          }
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results = [] } = await this.zqlService.call(zql)

    const localHostPsMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, item) => {
        const primaryStorageUuid = item?.primaryStorageUuid
        const hostUuid = item?.hostUuid
        const _primaryStorageUuid = _.get(this.localStorageHostDiskCapacityMap, [
          hostUuid,
          'primaryStorageUuid'
        ])
        if (_.isEqual(_primaryStorageUuid, primaryStorageUuid)) {
          obj[hostUuid] = item
        }
        // else if (_.isUndefined(_primaryStorageUuid)) {

        //   if (!obj[hostUuid]) {
        //     obj[hostUuid] = item
        //   } else {
        //     obj[hostUuid] = {
        //       ...obj[hostUuid],
        //       availableCapacity: _.sumBy(
        //         [
        //           obj[hostUuid],
        //           item
        //         ],
        //         'availableCapacity'
        //       ),
        //       availablePhysicalCapacity: _.sumBy(
        //         [
        //           obj[hostUuid],
        //           item
        //         ],
        //         'availablePhysicalCapacity'
        //       ),
        //       totalCapacity: _.sumBy(
        //         [
        //           obj[hostUuid],
        //           item
        //         ],
        //         'totalCapacity'
        //       ),
        //       totalPhysicalCapacity: _.sumBy(
        //         [
        //           obj[hostUuid],
        //           item
        //         ],
        //         'totalPhysicalCapacity'
        //       )
        //     }
        //   }
        // }

        return obj
      },
      {}
    )

    const _localHostPsMap = _.reduce(
      _.get(results, ['1', 'inventories'], []),
      (obj, item) => {
        const [
          hostUuid,
          availableCapacity = 0,
          availablePhysicalCapacity = 0,
          totalCapacity = 0,
          totalPhysicalCapacity = 0
        ] = item

        obj[hostUuid] = {
          hostUuid,
          availableCapacity,
          availablePhysicalCapacity,
          totalCapacity,
          totalPhysicalCapacity
        }
        return obj
      },
      localHostPsMap
    )

    return uuids.map(hostUuid => _.get(_localHostPsMap, hostUuid, null))

    // 收集没有主存储UUID的hostUuid
    /***
    const collectWithoutPrimaryStorageHostUuidList = _.compact(
      _.map(uuids, hostUuid => {
        if (
          !_.get(
            this.localStorageHostDiskCapacityMap,
            [hostUuid, 'primaryStorageUuid'],
            null
          )
        )
          return hostUuid
        return null
      })
    )

    if (
      collectWithoutPrimaryStorageHostUuidList &&
      collectWithoutPrimaryStorageHostUuidList?.length > 0
    ) {
      const zqlObject = collectWithoutPrimaryStorageHostUuidList.map(
        hostUuid => {
          return {
            tableName: 'PrimaryStorage',
            fields: 'uuid',
            condition: {
              'cluster.host.uuid': hostUuid,
              type: 'LocalStorage'
            },
            namedAs: hostUuid
          }
        }
      )

      const zql = ZQL.multStringify(zqlObject)
      const { results } = await this.zqlService.call(zql)

      _.forEach(results, psInfo => {
        _.set(
          this.localStorageHostDiskCapacityMap,
          [_.get(psInfo, 'name'), 'primaryStorageUuid'],
          _.map(_.get(psInfo, 'inventories', []), 'uuid')
        )
      })
    }

    await Promise.all(
      _.map(uuids, hostUuid => {
        const primaryStorageUuidList = _.flatten([
          _.get(
            this.localStorageHostDiskCapacityMap,
            [hostUuid, 'primaryStorageUuid'],
            []
          )
        ])
        return Promise.all(
          _.map(primaryStorageUuidList, primaryStorageUuid => {
            return this.getLocalStorageHostDiskCapacityAction
              .call({
                primaryStorageUuid,
                hostUuid
              })
              .then(_result => {
                const hostCapacityInfo = _.get(hostDiskCapacity, hostUuid)
                if (!hostCapacityInfo) {
                  _.set(
                    hostDiskCapacity,
                    hostUuid,
                    _.get(_result, ['inventories', '0'], null)
                  )
                } else {
                  _.set(hostDiskCapacity, hostUuid, {
                    hostUuid,
                    availableCapacity: _.sumBy(
                      [
                        hostCapacityInfo,
                        _.get(_result, ['inventories', '0'], {})
                      ],
                      'availableCapacity'
                    ),
                    availablePhysicalCapacity: _.sumBy(
                      [
                        hostCapacityInfo,
                        _.get(_result, ['inventories', '0'], {})
                      ],
                      'availablePhysicalCapacity'
                    ),
                    totalCapacity: _.sumBy(
                      [
                        hostCapacityInfo,
                        _.get(_result, ['inventories', '0'], {})
                      ],
                      'totalCapacity'
                    ),
                    totalPhysicalCapacity: _.sumBy(
                      [
                        hostCapacityInfo,
                        _.get(_result, ['inventories', '0'], {})
                      ],
                      'totalPhysicalCapacity'
                    )
                  })
                }
              })
              .catch(e => console.log('GetLocalStorageHostDiskCapacity', e))
          })
        )
      })
    )

    return uuids.map(hostUuid => _.get(hostDiskCapacity, hostUuid, null))
     */
  }

  getHostIommu(uuid) {
    return this.hostIommuDataLoader.load(uuid)
  }

  _getHostIommu = async (uuids: string[]) => {
    const hostIommuMap = {}

    await Promise.all(
      _.map(uuids, async uuid => {
        await this.getHostIommuStateAction.call({ uuid }).then(state => {
          _.set(hostIommuMap, [uuid, 'state'], _.get(state, 'state'))
        })

        await this.getHostIommuStatusAction.call({ uuid }).then(status => {
          _.set(hostIommuMap, [uuid, 'status'], _.get(status, 'status'))
        })
      })
    )

    return uuids.map(uuid =>
      _.get(hostIommuMap, uuid, {
        state: null,
        status: null
      })
    )
  }

  getGlobalConifg(uuid, clusterUuid) {
    this.cpuMemoryCapacityMap[uuid] = {
      uuid,
      clusterUuid
    }
    return this.globalConifgDataLoader.load(uuid)
  }

  _getGlobalConifg = async (uuids = []) => {
    // 收集hostUuid 和 clusterUuid 并去重
    const resourceUuidList = _.concat(
      _.uniq(uuids),
      _.uniq(_.map(uuids, uuid => _.get(this.cpuMemoryCapacityMap, [uuid, 'clusterUuid'])))
    )

    // 获取资源配置，优先host，其次cluster，最后全局配置。
    const configZql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        condition: {
          [ZOp.or]: [
            {
              [ZOp.and]: {
                name: 'reservedMemory',
                category: 'kvm'
              }
            },
            {
              [ZOp.and]: {
                name: 'overProvisioning.memory',
                category: 'mevoco'
              }
            }
          ]
        }
      },
      {
        tableName: 'ResourceConfig',
        condition: {
          resourceUuid: {
            [ZOp.in]: resourceUuidList
          },
          [ZOp.or]: [
            {
              [ZOp.and]: {
                name: 'reservedMemory',
                category: 'kvm'
              }
            },
            {
              [ZOp.and]: {
                name: 'overProvisioning.memory',
                category: 'mevoco'
              }
            }
          ]
        }
      }
    ])

    const configResp = await this.zqlService.call(configZql)

    // 全局配置默认值
    const config = {
      'overProvisioning.memory': 1.0,
      reservedMemory: '1G'
    }

    // 收集全局配置的值
    _.forEach(_.get(configResp, ['results', '0', 'inventories'], []), globalConfig => {
      if (_.get(globalConfig, 'name')) {
        _.set(config, _.get(globalConfig, 'name'), _.get(globalConfig, 'value'))
      }
    })

    // 收集资源配置的值
    const resourceConfig = _.reduce(
      _.get(configResp, ['results', '1', 'inventories'], []),
      (obj, rsConfig) => {
        _.set(
          obj,
          [_.get(rsConfig, 'resourceUuid'), _.get(rsConfig, 'name')],
          _.get(rsConfig, 'value')
        )
        return obj
      },
      {}
    )

    const zql = ZQL.stringify({
      tableName: 'HostCapacity',
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)

    // 收集Host CpuMemoryCapacity。 可以批量查询。
    // const hostCpuMemoryResp = await this.getCpuMemoryCapacityAction.call({
    //   hostUuids: uuids
    // })
    const hostCapacityData = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, capacity) => {
        _.set(obj, _.get(capacity, 'uuid'), capacity)
        return obj
      },
      {}
    )

    const B = 1
    const K = B * 1024
    const M = K * K
    const G = M * K
    const T = G * K

    const unitObj = {
      B: B,
      K: K,
      M: M,
      G: G,
      T: T
    }

    const hostMap = _.reduce(
      uuids,
      (obj, hostUuid) => {
        // 每个host对应的超分率。优先取host上的配置，如果没有则取Cluster上的配置，如果还是没有则取全局配置。
        const overProvisioning = _.get(
          resourceConfig,
          [hostUuid, 'overProvisioning.memory'],
          _.get(
            resourceConfig,
            [
              _.get(this.cpuMemoryCapacityMap, [hostUuid, 'clusterUuid']),
              'overProvisioning.memory'
            ],
            _.get(config, 'overProvisioning.memory')
          )
        )
        const reservedMemory = _.get(
          resourceConfig,
          [hostUuid, 'reservedMemory'],
          _.get(
            resourceConfig,
            [_.get(this.cpuMemoryCapacityMap, [hostUuid, 'clusterUuid']), 'reservedMemory'],
            _.get(config, 'reservedMemory')
          )
        )

        const [_number, _unit = 'B'] = _.words(reservedMemory)

        const reservedPhysicalMemory = _.toNumber(_.get(unitObj, _unit, 1) * _.toNumber(_number))

        let availableMemory
        const availableCpuMemoryCapacity = (availableMemory =
          _.get(hostCapacityData, [hostUuid, 'availableMemory'], 0) - reservedPhysicalMemory)

        _.set(obj, hostUuid, {
          // 内存超分率
          memoryOverProvisioning: overProvisioning,
          // 保留内存
          reservedMemory: reservedMemory,
          // 内存，后端已经去除了保留内存。
          availableCpuMemoryCapacity,
          availableMemory,
          totalMemory: _.get(hostCapacityData, [hostUuid, 'totalMemory'], 0),
          // 超分后的总量。超分率X总量。
          overProvisioningTotalMemory:
            overProvisioning * _.get(hostCapacityData, [hostUuid, 'totalMemory'], 0),
          // 可用总量（超分后的）。超分率X可用总量。
          overProvisioningAvailableMemory: overProvisioning * availableMemory,
          // 超分后的CPU。
          availableCpu: _.get(hostCapacityData, [hostUuid, 'availableCpu'], 0),
          totalCpu: _.get(hostCapacityData, [hostUuid, 'totalCpu'], 0),
          // 实际物理CPU。
          managedCpuNum: _.get(hostCapacityData, [hostUuid, 'cpuNum'], 0)
        })
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(hostMap, uuid, null))
  }

  getSystemInfo(uuid) {
    return this.systemInfoDataLoader.load(uuid)
  }

  _getSystemInfo = async (uuids = []) => {
    // 每一条tag都不是完整的。
    const resolveTagList: string[] = [
      'cpuModelName',
      'pageTableExtensionDisabled',
      'hostCpuModelName',
      'ipmiAddress',
      'systemSerialNumber',
      'systemProductName',
      'cpuGHz',
      //
      'cpuProcessorNum', //仅提供逻辑核数，from ZSV-6815
      'cpuSocketCoreThread'
    ]

    const tagZql = {
      tableName: 'SystemTag',
      fields: ['uuid', 'tag', 'resourceUuid'],
      condition: {
        resourceType: 'HostVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        [ZOp.or]: _.map(resolveTagList, _tag => ({
          tag: {
            [ZOp.like]: _tag
          }
        }))
      }
    }

    const zql = ZQL.stringify(tagZql)

    const tagResp = await this.zqlService.call(zql)
    const tagList = _.get(tagResp, ['results', 0, 'inventories'], [])

    const hostTagMap = _.reduce(
      tagList,
      (obj, _tag) => {
        if (!obj[_tag.resourceUuid]) {
          _.set(obj, _tag.resourceUuid, {
            cpuModelName: null,
            ept: true,
            eptUuid: null,
            hostCpuModelName: null,
            // release: null,
            // version: null,
            // distribution: null,
            ipmiAddress: 'None',
            systemSerialNumber: null,
            systemProductName: null,
            cpuGHz: null,
            cpuProcessorNum: null,
            cpuSocketCoreThread: null
          })
        }

        if (_tag.tag.indexOf('cpuModelName') > -1) {
          _.set(obj, [_tag.resourceUuid, 'cpuModelName'], _.get(_.split(_tag.tag, '::'), '1', null))
        }

        if (_tag.tag.indexOf('hostCpuModelName') > -1) {
          _.set(
            obj,
            [_tag.resourceUuid, 'hostCpuModelName'],
            _.get(_.split(_tag.tag, '::'), '1', null)
          )
        }

        if (_tag.tag.indexOf('pageTableExtensionDisabled') > -1) {
          // 后端默认是有ept的tag，所以当有pageTableExtensionDisabled的时候表示ept关闭了。
          _.set(obj, [_tag.resourceUuid, 'ept'], false)
          _.set(obj, [_tag.resourceUuid, 'eptUuid'], _tag.uuid)
        }

        if (_tag.tag.indexOf('ipmiAddress') > -1) {
          _.set(
            obj,
            [_tag.resourceUuid, 'ipmiAddress'],
            _.get(_.split(_tag.tag, '::'), '1', 'None')
          )
        }

        if (_tag.tag.indexOf('systemSerialNumber') > -1) {
          _.set(
            obj,
            [_tag.resourceUuid, 'systemSerialNumber'],
            _.get(_.split(_tag.tag, '::'), '1', null)
          )
        }

        if (_tag.tag.indexOf('systemProductName') > -1) {
          _.set(
            obj,
            [_tag.resourceUuid, 'systemProductName'],
            _.get(_.split(_tag.tag, '::'), '1', null)
          )
        }

        if (_tag.tag.indexOf('cpuGHz') > -1) {
          _.set(obj, [_tag.resourceUuid, 'cpuGHz'], _.get(_.split(_tag.tag, '::'), '1', null))
        }

        if (_tag.tag.indexOf('cpuProcessorNum') > -1) {
          _.set(
            obj,
            [_tag.resourceUuid, 'cpuProcessorNum'],
            _.toNumber(_.get(_.split(_tag.tag, '::'), '1', null))
          )
        }

        if (_tag.tag.indexOf('cpuSocketCoreThread') > -1) {
          const cpuArr = _tag.tag.split('cpuSocketCoreThread::')?.[1].split('::')

          _.set(obj, [_tag.resourceUuid, 'cpuSocketCoreThread'], {
            sockets: Number(cpuArr[0]),
            coresPerSocket: Number(cpuArr[1]),
            threadsPerCore: Number(cpuArr[2])
          })
        }

        return obj
      },
      {}
    )

    return uuids.map(hostUuid => _.get(hostTagMap, hostUuid, null))
  }

  getZWatchInfo(uuid) {
    return this.zwatchInfoDataLoader.load(uuid)
  }

  _getZWatchInfo = async (uuids = []) => {
    const zql = ZQL.stringify({
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'zwatch1',
            metricName: 'CPUAllIdleUtilization',
            offsetAheadOfCurrentTime: 10,
            functions: ['average(groupBy="HostUuid")']
          },
          {
            resultName: 'zwatch2',
            metricName: 'MemoryFreeInPercent',
            offsetAheadOfCurrentTime: 10,
            functions: ['average(groupBy="HostUuid")']
          },
          {
            resultName: 'zwatch3',
            offsetAheadOfCurrentTime: 1,
            metricName: 'CPUAllUsedUtilization'
          },
          {
            resultName: 'zwatch4',
            offsetAheadOfCurrentTime: 1,
            metricName: 'MemoryUsedInPercent'
          },
          {
            resultName: 'zwatch5',
            offsetAheadOfCurrentTime: 1,
            metricName: 'MemoryFreeBytes'
          }
        ]
      }
    })

    const { results = [] } = await this.zqlService.call(zql)
    const cpuList = results?.[0]?.returnWith?.zwatch1 ?? []
    const memoryList = results?.[0]?.returnWith?.zwatch2 ?? []
    const cpuAllUsedUtilizationList = results?.[0]?.returnWith?.zwatch3 ?? []
    const memoryUsedInPercentList = results?.[0]?.returnWith?.zwatch4 ?? []
    const memoryFreeBytesList = results?.[0]?.returnWith?.zwatch5 ?? []

    return uuids.map(uuid => {
      const findCpu = cpuList.find(it => it?.labels?.HostUuid === uuid)
      let cpuAllIdleUtilization = '0'
      if (findCpu) {
        cpuAllIdleUtilization = `${parseInt(((100 - findCpu?.value) * 100).toString()) / 100} %`
      }

      let memoryFreeInPercent = '0'
      const findMemory = memoryList.find(it => it?.labels?.HostUuid === uuid)
      if (findMemory) {
        memoryFreeInPercent = `${parseInt(((100 - findMemory?.value) * 100).toString()) / 100} %`
      }

      const findUsedCpu = _.find(
        cpuAllUsedUtilizationList,
        it => _.get(it, ['labels', 'HostUuid']) === uuid
      )
      const cpuAllUsedUtilization = _.round(_.get(findUsedCpu, 'value', 0), 2)

      const findUsedMemory = _.find(
        memoryUsedInPercentList,
        it => _.get(it, ['labels', 'HostUuid']) === uuid
      )
      const memoryUsedInPercent = _.round(_.get(findUsedMemory, 'value', 0), 2)

      const findFreeMemory = _.find(
        memoryFreeBytesList,
        it => _.get(it, ['labels', 'HostUuid']) === uuid
      )
      const memoryFreeBytes = _.round(_.get(findFreeMemory, 'value', 0), 2)

      return {
        cpuAllIdleUtilization,
        memoryFreeInPercent,
        cpuAllUsedUtilization,
        memoryUsedInPercent,
        memoryFreeBytes
      }
    })
  }

  getRelatedVmCount(uuid) {
    return this.relatedVmCountDataLoader.load(uuid)
  }

  _getRelatedVmCount = async (uuids = []) => {
    const genZql = hostUuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          uuid: {
            [ZOp.notIn]: {
              [ZOp.and]: [
                {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.and]: {
                        [ZOp.query]: {
                          tableName: 'templatedVminstance',
                          fields: ['uuid']
                        }
                      }
                    }
                  }
                },
                {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.and]: {
                        [ZOp.query]: {
                          tableName: 'templatedVminstanceCache',
                          fields: ['cacheVmInstanceUuid']
                        }
                      }
                    }
                  }
                }
              ]
            }
          },
          [ZOp.or]: {
            hostUuid: hostUuid, // vm关机后是没有hostUuid的，只有lastHostUuid
            'rootVolume.localStorageHostRef.hostUuid': hostUuid // 在没有hostUuid的情况下，如果rootVolume在host上，那么该vm也属于该host
          }
        },
        namedAs: hostUuid // 这里本该用group by hostUuid 批量查询的，但是有些资源是没有hostUuid的，可以用多个API来解决该问题，但是多个API可能涉及权限问题，所以这个没有使用多个API。
      }
    }

    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'total', 0)
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(map, uuid, 0))
  }

  getRelatedVolumeCount(uuid) {
    return this.relatedVolumeCountDataLoader.load(uuid)
  }

  _getRelatedVolumeCount = async (uuids = []) => {
    const genZql = hostUuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          'localStorageHostRef.hostUuid': hostUuid, // 只有localStorage上的云盘才与Host有关，其他存储与Host无关，与PS有关。
          type: 'Data'
        },
        namedAs: hostUuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'total', 0)
        return obj
      },
      {}
    )

    return uuids.map(uuid => map[uuid] ?? 0)
  }

  getBondRelatedVSwitch(uuid, param) {
    const { extraConditions = [] } = param
    const extraConditionsMap = conditionsToObject(extraConditions)
    return this.getBondRelatedVSwitchDataloader.load({
      uuid,
      bondingName: extraConditionsMap['bondingName']
    })
  }

  _getBondRelatedVSwitch = async (params: { uuid: string; bondingName: string }[]) => {
    const uuids = params.map(it => it.uuid)
    const bondingName = params?.[0]?.bondingName ?? ''
    const zqlObject = {
      tableName: 'HostNetworkBonding',
      condition: {
        bondingName,
        hostUuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories ?? []
    return uuids.map(uuid => {
      return inventories?.filter(item => item.hostUuid === uuid) ?? []
    })
  }
  getExtraips(uuid) {
    return this.getExtraipsDataLoader.load(uuid)
  }

  _getExtraips = async (uuids: string[]) => {
    const tagZql = {
      tableName: 'SystemTag',
      fields: ['uuid', 'tag', 'resourceUuid'],
      condition: {
        resourceType: 'HostVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'extraips::'
        }
      }
    }

    const zql = ZQL.stringify(tagZql)

    const tagResp = await this.zqlService.call(zql)
    const tagList = _.get(tagResp, ['results', 0, 'inventories'], [])

    const hostTagMap = _.reduce(
      tagList,
      (obj, _tag) => {
        obj[_tag.resourceUuid] = _.get(_.split(_tag.tag, '::'), '1', null)
        return obj
      },
      {}
    )

    return uuids.map(hostUuid => _.get(hostTagMap, hostUuid, null))
  }

  getConnectedTime(uuid) {
    return this.getConnectedTimeDataLoader.load(uuid)
  }

  _getConnectedTime = async (uuids: string[]) => {
    const tagZql = {
      tableName: 'SystemTag',
      fields: ['uuid', 'tag', 'resourceUuid'],
      condition: {
        resourceType: 'HostVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'uptime::'
        }
      }
    }

    const zql = ZQL.stringify(tagZql)

    const tagResp = await this.zqlService.call(zql)
    const tagList = _.get(tagResp, ['results', 0, 'inventories'], [])

    const hostTagMap = _.reduce(
      tagList,
      (obj, _tag) => {
        // "tag": "uptime::2023-12-15 10:00:44"
        const timeStr = _.get(_.split(_tag.tag, '::'), '1', null)
        const timeStamp = timeStr ? new Date(timeStr).getTime() : null
        obj[_tag.resourceUuid] = timeStamp
        return obj
      },
      {}
    )

    return uuids.map(hostUuid => _.get(hostTagMap, hostUuid, null))
  }

  async getSummary(state, condtions = []) {
    const baseConditons: ICondition[] = [
      {
        key: 'hypervisorType',
        op: Op.ne,
        value: 'ESX'
      },
      {
        key: 'hypervisorType',
        op: Op.ne,
        value: 'baremetal2'
      }
    ].concat(condtions)

    switch (state) {
      case 'enabled':
        baseConditons.push({
          key: 'state',
          value: HostState.Enabled
        })
        break
      case 'disabled':
        baseConditons.push({
          key: 'state',
          value: HostState.Disabled
        })
        break
      case 'maintenance':
        baseConditons.push({
          key: 'state',
          value: HostState.Maintenance
        })
        break
      case 'connected':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: HostStatus.Connected
        })
        break
      case 'connecting':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: HostStatus.Connecting
        })
        break
      case 'disconnected':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: HostStatus.Disconnected
        })
        break
      case 'other':
        baseConditons.push({
          key: 'status',
          op: Op.notIn,
          values: [HostStatus.Connected, HostStatus.Disconnected]
        })
        break
      case 'total':
        break
      default:
        break
    }

    const zqlObject = {
      tableName: 'host',
      condition: QueryConditionTranslator.translate(baseConditons),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results = [] } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }
  async getHostNUMATopology(uuid) {
    const { topology: hostTopology } = await this.getHostNUMATopologyAction.call({
      uuid
    })
    return Object.keys(hostTopology)?.length === 0 ? false : true
  }

  getCallBackIp(hostUuid: string) {
    return this.hostCallBackIpDataLoader.load(hostUuid)
  }

  _getCallBackIp = async (hostUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterface',
      fields: ['hostUuid', 'callBackIp'],
      groupBy: 'hostUuid',
      condition: {
        hostUuid: {
          [ZOp.in]: hostUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const hostCallBackIpMap = _.reduce(
      inventories,
      (obj, item) => {
        obj[item?.hostUuid] = item?.callBackIp
        return obj
      },
      {}
    )

    return hostUuids.map(hostUuid => _.get(hostCallBackIpMap, hostUuid, null))
  }

  physicalNicList(hostUuid: string) {
    return this.physicalNicListDataLoader.load(hostUuid)
  }

  getHostQemuState(uuid) {
    return this.hostQemuStateDataLoader.load(uuid)
  }

  _hostQemuStateDataLoader = async (uuids = []) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'KvmHypervisorInfo',
        condition: {
          uuid,
          matchState: {
            [ZOp.eq]: 'Unmatched'
          }
        },
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const hostQemuStateMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0'])
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const item = _.get(hostQemuStateMap, uuid, null)
      if (item) {
        return item?.matchState
      }
    })
  }

  private _physicalNicList = async (hostUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterface',
      condition: {
        [ZOp.and]: [
          {
            hostUuid: {
              [ZOp.in]: hostUuids
            }
          },
          {
            bondingUuid: {
              [ZOp.is]: null
            }
          }
          // {
          //   uuid: {
          //     [ZOp.in]: {
          //       [ZOp.query]: {
          //         tableName: 'HostNetworkInterfaceServiceRef',
          //         fields: ['interfaceUuid'],
          //         condition: {
          //           serviceType: {
          //             [ZOp.not]: null
          //           }
          //         }
          //       }
          //     }
          //   }
          // }
        ]
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const hostNetworkInterfaceMap = _.reduce(
      inventories,
      (obj, hostNetworkInterface) => {
        if (!obj[hostNetworkInterface.hostUuid]) {
          obj[hostNetworkInterface.hostUuid] = [hostNetworkInterface]
        } else {
          obj[hostNetworkInterface.hostUuid].push(hostNetworkInterface)
        }
        return obj
      },
      {}
    )

    return hostUuids.map(uuid => hostNetworkInterfaceMap[uuid] ?? [])
  }

  bondList(hostUuid: string) {
    return this.bondListDataLoader.load(hostUuid)
  }

  private _bondList = async (hostUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkBonding',
      condition: {
        hostUuid: {
          [ZOp.in]: hostUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const hostNetworkBondingMap = _.reduce(
      inventories,
      (obj, hostNetworkBonding) => {
        if (!obj[hostNetworkBonding.hostUuid]) {
          obj[hostNetworkBonding.hostUuid] = [hostNetworkBonding]
        } else {
          obj[hostNetworkBonding.hostUuid].push(hostNetworkBonding)
        }
        return obj
      },
      {}
    )

    return hostUuids.map(uuid => hostNetworkBondingMap[uuid] ?? [])
  }

  // 主机调度组
  getHostGroup(uuid) {
    return this.hostGroupDataLoader.load(uuid)
  }

  _hostGroupDataLoader = async (uuids = []) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'HostSchedulingRuleGroup',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'HostSchedulingRuleGroupRef',
                fields: 'hostGroupUuid',
                condition: {
                  hostUuid: uuid
                }
              }
            }
          }
        },
        fields: 'name,uuid',
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const hostGroupMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0'])
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const item = _.get(hostGroupMap, uuid, null)
      if (item) {
        return item
      }
    })
  }

  // 批量查询host 用量
  getHostUsageList(uuid) {
    return this.hostUsageDataLoader.load(uuid)
  }

  _getHostUsageList = async (uuids = []) => {
    const zqlObject = {
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'CPUAverageUsedUtilization',
            namespace: 'ZStack/Host',
            metricName: 'CPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1
          },
          {
            resultName: 'MemoryUsedInPercent',
            namespace: 'ZStack/Host',
            metricName: 'MemoryUsedInPercent',
            offsetAheadOfCurrentTime: 1
          },
          {
            resultName: 'DiskAllUsedCapacityInBytes',
            namespace: 'ZStack/Host',
            metricName: 'DiskAllUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1
          }
        ]
      }
    }
    const resp = await this.zqlService.call(ZQL.stringify(zqlObject))
    const { CPUAverageUsedUtilization, MemoryUsedInPercent, DiskAllUsedCapacityInBytes } =
      resp.results?.[0]?.returnWith ?? {}

    const filterValue = (metricData, uuid: string) => {
      return metricData?.find(it => it?.labels?.HostUuid === uuid)?.value
    }

    return uuids.map(uuid => {
      return {
        cpuUsed: filterValue(CPUAverageUsedUtilization, uuid),
        memoryUsed: filterValue(MemoryUsedInPercent, uuid),
        storageUsed: filterValue(DiskAllUsedCapacityInBytes, uuid)
      }
    })
  }

  getHostUsage = async uuid => {
    const zqlObject = {
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        uuid
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'CPUAverageUsedUtilization',
            namespace: 'ZStack/Host',
            metricName: 'CPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1
          },
          {
            resultName: 'MemoryUsedInPercent',
            namespace: 'ZStack/Host',
            metricName: 'MemoryUsedInPercent',
            offsetAheadOfCurrentTime: 1
          },
          {
            resultName: 'DiskAllUsedCapacityInBytes',
            namespace: 'ZStack/Host',
            metricName: 'DiskAllUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1
          }
        ]
      }
    }
    const resp = await this.zqlService.call(ZQL.stringify(zqlObject))
    const {
      CPUAverageUsedUtilization,
      OperatingSystemCPUAverageUsedUtilization,
      MemoryUsedInPercent,
      OperatingSystemMemoryUsedPercent,
      DiskAllUsedCapacityInBytes
    } = resp.results?.[0]?.returnWith ?? {}
    return {
      cpuUsed:
        OperatingSystemCPUAverageUsedUtilization?.[0]?.value ??
        CPUAverageUsedUtilization?.[0]?.value,
      memoryUsed: OperatingSystemMemoryUsedPercent?.[0]?.value ?? MemoryUsedInPercent?.[0]?.value,
      storageUsed: DiskAllUsedCapacityInBytes?.[0]?.value
    }
  }

  getHostNodeInfo(uuid: string) {
    return this.hostNodeInfoDataLoader.load(uuid)
  }

  _getHostNodeInfo = async (uuids: string[]) => {
    const { inventories } = await this.getNodeRolesAction.call({})

    return uuids.map(uuid => {
      // 查找是否有任何 inventory 的 roles 中包含匹配的 HostVO
      const isManagementNode = inventories?.some(inventory =>
        inventory.roles?.some(role => role.resourceType === 'HostVO' && role.uuid === uuid)
      )

      return {
        nodeType: isManagementNode ? NodeType.ManagementNode : NodeType.ComputeNode
      }
    })
  }

  getKernelInterfaces({ hostUuid, internalNetwork, externalNetwork }) {
    return this.hostKernelInterfacesDataLoader.load({
      hostUuid,
      internalNetwork,
      externalNetwork
    })
  }

  /**
   * 检查IP是否在CIDR范围内
   * @param ip IP地址
   * @param cidr CIDR网络
   * @returns 是否匹配
   */
  private isIpInCidr(ip: string, cidr: string): boolean {
    if (!ip || !cidr) {
      return false
    }

    try {
      const [network, prefixLength] = cidr.split('/')
      const ipNum = this.ipToNumber(ip)
      const networkNum = this.ipToNumber(network)
      const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0

      return (ipNum & mask) === (networkNum & mask)
    } catch (error) {
      console.warn(`CIDR检查失败: ip=${ip}, cidr=${cidr}`, error)
      return false
    }
  }

  /**
   * 将IP地址转换为数字
   * @param ip IP地址
   * @returns 数字形式的IP
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
  }

  /**
   * 检测主机存储网络配置验证状态
   * @param hostUuid 主机UUID
   * @param externalNetwork 外部网络CIDR
   * @param internalNetwork 内部网络CIDR
   * @param ipsByCidrThenHost CIDR到主机IP的映射
   * @returns 验证状态信息
   */
  private validateStorageNetworkConfig(
    hostUuid: string,
    externalNetwork: string,
    internalNetwork: string,
    ipsByCidrThenHost: Map<string, Map<string, string>>
  ) {
    // 获取主机在各个CIDR下的IP
    const publicStorageIp = ipsByCidrThenHost.get(externalNetwork)?.get(hostUuid) || ''
    const clusterStorageIP = ipsByCidrThenHost.get(internalNetwork)?.get(hostUuid) || ''

    // 检查外部网络CIDR匹配
    // 如果配置了externalNetwork，则必须要有IP且IP要在CIDR范围内
    const externalNetworkCidrMatched = Boolean(
      !externalNetwork || (publicStorageIp && this.isIpInCidr(publicStorageIp, externalNetwork))
    )

    // 检查内部网络CIDR匹配
    // 如果配置了internalNetwork，则必须要有IP且IP要在CIDR范围内
    const internalNetworkCidrMatched = Boolean(
      !internalNetwork || (clusterStorageIP && this.isIpInCidr(clusterStorageIP, internalNetwork))
    )

    // 检查是否有多个CIDR下的IP
    const allHostIps = new Set<string>()
    ipsByCidrThenHost.forEach(hostMap => {
      const hostIp = hostMap.get(hostUuid)
      if (hostIp) {
        allHostIps.add(hostIp)
      }
    })
    const hasMultipleCidrIps = Boolean(allHostIps.size > 1)

    return {
      externalNetworkCidrMatched,
      internalNetworkCidrMatched,
      hasMultipleCidrIps
    }
  }

  _getKernelInterfaces = async params => {
    const hostUuids = _.uniq(params.map(it => it.hostUuid))
    const allCidrs = new Set<string>()

    params.forEach(p => {
      if (p.externalNetwork) {
        allCidrs.add(p.externalNetwork)
      }
      if (p.internalNetwork) {
        allCidrs.add(p.internalNetwork)
      }
    })

    const uniqueCidrs = Array.from(allCidrs)

    if (uniqueCidrs.length === 0) {
      return params.map(p => ({
        hostUuid: p.hostUuid,
        publicStorageIp: '',
        clusterStorageIP: '',
        externalNetworkCidrMatched: true,
        internalNetworkCidrMatched: true,
        hasMultipleCidrIps: false
      }))
    }

    // 步骤 2: 并发 API 调用
    const apiPromises = uniqueCidrs.map(cidr =>
      this.getCandidateHostKernelInterfacesAction.call({
        hostUuids,
        cidr,
        containsRejected: false,
        trafficTypes: ['Storage']
      })
    )

    const settledResults: any = await Promise.allSettled(apiPromises)
    const ipsByCidrThenHost = new Map<string, Map<string, string>>()

    settledResults.forEach((result, index) => {
      if (result.status !== 'fulfilled' || !result.value?.results) {
        return
      }

      const cidr = uniqueCidrs[index]
      const candidatesByHost = new Map()

      result?.value.results.forEach(item => {
        const uuid = item.candidate.hostUuid
        if (!candidatesByHost.has(uuid)) {
          candidatesByHost.set(uuid, [])
        }
        candidatesByHost.get(uuid)?.push(item)
      })
      candidatesByHost.forEach((candidates, hostUuid) => {
        const acceptedCandidates = candidates.filter(c => c.finalDecision === 'ACCEPTED')
        if (acceptedCandidates.length === 1) {
          const ip = acceptedCandidates[0].candidate.usedIps?.[0]?.ip
          if (ip) {
            if (!ipsByCidrThenHost.has(cidr)) {
              ipsByCidrThenHost.set(cidr, new Map<string, string>())
            }
            ipsByCidrThenHost.get(cidr)?.set(hostUuid, ip)
          }
        }
      })
    })

    return params.map(p => {
      const { hostUuid, externalNetwork, internalNetwork } = p

      const publicStorageIp = ipsByCidrThenHost.get(externalNetwork)?.get(hostUuid) || ''

      const clusterStorageIP = ipsByCidrThenHost.get(internalNetwork)?.get(hostUuid) || ''

      // 验证存储网络配置
      const validationResult = this.validateStorageNetworkConfig(
        hostUuid,
        externalNetwork,
        internalNetwork,
        ipsByCidrThenHost
      )

      return {
        hostUuid,
        publicStorageIp,
        clusterStorageIP,
        ...validationResult
      }
    })
  }
}
