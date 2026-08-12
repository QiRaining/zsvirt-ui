import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { ApplyDRSAdviceAction } from '@/api/zstack/ApplyDRSAdviceAction'
import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeClusterStateAction } from '@/api/zstack/ChangeClusterStateAction'
import { CreateClusterAction } from '@/api/zstack/CreateClusterAction'
import { CreateClusterDRSAction } from '@/api/zstack/CreateClusterDRSAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { DetachL2NetworkFromClusterAction } from '@/api/zstack/DetachL2NetworkFromClusterAction'
import { DetachPrimaryStorageFromClusterAction } from '@/api/zstack/DetachPrimaryStorageFromClusterAction'
import { ExecuteDRSSchedulingAction } from '@/api/zstack/ExecuteDRSSchedulingAction'
import { GetCandidateZonesClustersHostsForCreatingVmAction } from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import { GetCpuMemoryCapacityAction } from '@/api/zstack/GetCpuMemoryCapacityAction'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import { GetResourceConfigAction } from '@/api/zstack/GetResourceConfigAction'
import { GetVirtualizerInfoAction } from '@/api/zstack/GetVirtualizerInfoAction'
import { QueryBareMetal2ChassisAction } from '@/api/zstack/QueryBareMetal2ChassisAction'
import { QueryBareMetal2GatewayAction } from '@/api/zstack/QueryBareMetal2GatewayAction'
import { QueryBareMetal2ProvisionNetworkAction } from '@/api/zstack/QueryBareMetal2ProvisionNetworkAction'
import { QueryBaremetalChassisAction } from '@/api/zstack/QueryBaremetalChassisAction'
import { QueryBaremetalPxeServerAction } from '@/api/zstack/QueryBaremetalPxeServerAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryClusterDRSAction } from '@/api/zstack/QueryClusterDRSAction'
import { QueryDRSAdviceAction } from '@/api/zstack/QueryDRSAdviceAction'
import { QueryDRSVmMigrationActivityAction } from '@/api/zstack/QueryDRSVmMigrationActivityAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryIscsiServerAction } from '@/api/zstack/QueryIscsiServerAction'
import { QueryL2NetworkAction } from '@/api/zstack/QueryL2NetworkAction'
import { QueryPciDeviceAction } from '@/api/zstack/QueryPciDeviceAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QueryResourceConfigAction } from '@/api/zstack/QueryResourceConfigAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryUsbDeviceAction } from '@/api/zstack/QueryUsbDeviceAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { ClusterInventory as IClusterInventory } from '@/api/zstack/types'
import { UpdateClusterAction } from '@/api/zstack/UpdateClusterAction'
import { UpdateClusterDRSAction } from '@/api/zstack/UpdateClusterDRSAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ValidateClusterSupportDRSAction } from '@/api/zstack/ValidateClusterSupportDRSAction'
import { ActionService } from '@/base/action-service'
import { BaremetalInstanceState } from '@/common/enum'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import {
  QueryAction as IQueryAction,
  SortDirectionValidValues
} from '@/common/model/action-query.model'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import { PrimaryStorageTypeParam } from '@/hardware-resource/primary-storage/primary-storage.model'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'

import { HostInterfaceService } from '../pci-device/pci-device-query/host-interface.service'
import { PciDeviceQueryService } from '../pci-device/pci-device-query/pci-device-query.service'
import { getAvailablePsTypes } from '../primary-storage/helper'
import {
  Baremetal2ClusterRelatedSummary,
  ClusterQueryType,
  ClusterRelatedSummary,
  QueryClusterArgs,
  QueryClusterDRSResp,
  QueryClusterResp,
  QueryDRSAdviceResp
} from './cluster.model'

@Injectable()
export class ClusterService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() zsHttpService: ZsHttpService
  @Inject() queryHostAction: QueryHostAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() vGpuDeviceService: VGpuDeviceService
  @Inject() metricDataService: MetricDataService
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() hostInterfaceService: HostInterfaceService
  @Inject() queryClusterAction: QueryClusterAction
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() updateClusterAction: UpdateClusterAction
  @Inject() createClusterAction: CreateClusterAction
  @Inject() queryPciDeviceAction: QueryPciDeviceAction
  @Inject() queryUsbDeviceAction: QueryUsbDeviceAction
  @Inject() applyDRSAdviceAction: ApplyDRSAdviceAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryDRSAdviceAction: QueryDRSAdviceAction
  @Inject() queryL2NetworkAction: QueryL2NetworkAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() queryClusterDRSAction: QueryClusterDRSAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() createClusterDRSAction: CreateClusterDRSAction
  @Inject() queryIscsiServerAction: QueryIscsiServerAction
  @Inject() updateClusterDRSAction: UpdateClusterDRSAction
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction
  @Inject() changeClusterStateAction: ChangeClusterStateAction
  @Inject() queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject() queryResourceConfigAction: QueryResourceConfigAction
  @Inject() getResourceConfigAction: GetResourceConfigAction
  @Inject() executeDRSSchedulingAction: ExecuteDRSSchedulingAction
  @Inject() getCpuMemoryCapacityAction: GetCpuMemoryCapacityAction
  @Inject() primaryStorageQueryService: PrimaryStorageQueryService
  @Inject() queryBaremetalChassisAction: QueryBaremetalChassisAction
  @Inject() queryBaremetal2ChassisAction: QueryBareMetal2ChassisAction
  @Inject() queryBareMetal2GatewayAction: QueryBareMetal2GatewayAction
  @Inject() queryBaremetalPxeServerAction: QueryBaremetalPxeServerAction
  @Inject() validateClusterSupportDRSAction: ValidateClusterSupportDRSAction
  @Inject() attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction
  @Inject() detachL2NetworkFromClusterAction: DetachL2NetworkFromClusterAction
  @Inject()
  queryDRSVmMigrationActivityAction: QueryDRSVmMigrationActivityAction
  @Inject()
  detachPrimaryStorageFromClusterAction: DetachPrimaryStorageFromClusterAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction

  @Inject()
  queryBareMetal2ProvisionNetworkAction: QueryBareMetal2ProvisionNetworkAction
  @Inject() getVirtualizerInfoAction: GetVirtualizerInfoAction
  @Inject() resourceConfigService: ResourceConfigService
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  private getHostNumDataLoader
  private getPsTypesDataLoader
  private getIsAttachL2networkDataLoader
  private getIsAttachPrimaryStorageDataLoader
  private getBaremetalChassisNumDataLoader
  private getBaremetal2ChassisNumDataLoader
  private getBaremetal2GatewayNumDataLoader
  private getIsAttachBaremetalPxeServerDataLoader
  private getBaremetalPxeServerDataLoader
  private getProvisionDataLoader
  private getIsHugePageMemoryCanOpen
  private clusterCheckCpuModelDataLoader
  private clusterCheckCpuModelIdDataLoader
  private clusterKVMCpuModelDataLoader
  private recommendQemuVersionDataLoader
  private clusterDisplayNetworkCidrDataLoader
  private clusterMigrateNetworkCidrDataLoader
  private getAdviceStatusDataLoader
  private getVmInstanceListDataLoader
  private getHostListDataLoader
  private getPrimaryStorageListDataLoader
  private getCpuMemoryCapacityDataLoader
  // private getOverProvisioningTotalMemoryDataLoader
  private zwatchInfoDataLoader
  private getIsMaintenanceOfAllHostDataLoader
  private resourceConfigValueDataLoader
  private getBaremetalInstanceNumDataLoader

  private drsSchedulingIntervalDataLoader
  private getClusterNameDataLoader
  private getIsShowDrsTableDataLoader

  private _getHostListQueryArgs: IQueryAction = {}

  constructor() {
    super()
    this.zwatchInfoDataLoader = new DataLoader(this._getZWatchInfo)
    // this.getOverProvisioningTotalMemoryDataLoader = new DataLoader(this._getOverProvisioningTotalMemory)
    this.getCpuMemoryCapacityDataLoader = new DataLoader(this._getCpuMemoryCapacity)
    this.getIsHugePageMemoryCanOpen = new DataLoader(this._isHugePageMemoryCanOpen)
    this.getIsMaintenanceOfAllHostDataLoader = new DataLoader(this._getIsMaintenanceOfAllHost)
    this.getHostNumDataLoader = new DataLoader(this._getHostNums)
    this.getIsAttachL2networkDataLoader = new DataLoader(this._getIsAttachL2network)
    this.getIsAttachPrimaryStorageDataLoader = new DataLoader(this._getIsAttachPrimaryStorage)
    this.getPsTypesDataLoader = new DataLoader(this._getPsTypes)
    this.getBaremetalChassisNumDataLoader = new DataLoader(this._getBaremetalChassisNum)
    this.getBaremetal2ChassisNumDataLoader = new DataLoader(this._getBaremetal2ChassisNum)
    this.getBaremetal2GatewayNumDataLoader = new DataLoader(this._getBaremetal2GatewayNum)
    this.getIsAttachBaremetalPxeServerDataLoader = new DataLoader(
      this._getIsAttachBaremetalPxeServer
    )
    this.getBaremetalPxeServerDataLoader = new DataLoader(this._getBaremetalPxeServer)
    this.clusterMigrateNetworkCidrDataLoader = new DataLoader(this._getMigrateNetworkCidr)
    this.clusterDisplayNetworkCidrDataLoader = new DataLoader(this._getDisplayNetworkCidr)
    this.clusterKVMCpuModelDataLoader = new DataLoader(this._getClusterKVMCpuModel)
    this.recommendQemuVersionDataLoader = new DataLoader(this._getRecommendQemuVersion)
    this.clusterCheckCpuModelDataLoader = new DataLoader(this._getCheckCpuModel)
    this.clusterCheckCpuModelIdDataLoader = new DataLoader(this._getCheckCpuModelId)
    this.getProvisionDataLoader = new DataLoader(this._getProvisionNetwork)
    this.getAdviceStatusDataLoader = new DataLoader(this._getAdviceStatus)
    this.getVmInstanceListDataLoader = new DataLoader(this._getVmInstanceList)
    this.getHostListDataLoader = new DataLoader(this._getHostList)
    this.drsSchedulingIntervalDataLoader = new DataLoader(this._getDrsSchedulingInterval)
    this.getPrimaryStorageListDataLoader = new DataLoader(this._getPrimaryStorageList)
    this.resourceConfigValueDataLoader = new DataLoader(this._resourceConfigValue)
    this.getClusterNameDataLoader = new DataLoader(this._getClusterName)
    this.getIsShowDrsTableDataLoader = new DataLoader(this._getIsShowDrsTab)
    this.getBaremetalInstanceNumDataLoader = new DataLoader(this._getBaremetalInstanceNum)
  }

  async cluster(uuid: string): Promise<IClusterInventory> {
    const params: IQueryAction = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.queryClusterAction.call(params)
    return inventories?.[0] ?? null
  }

  async clusterList(params: QueryClusterArgs): Promise<QueryClusterResp> {
    const { type = ClusterQueryType.Normal } = params
    let _extrazqlConditions
    let finalConditions: ICondition[] = []
    switch (type) {
      case ClusterQueryType.Normal:
        break

      // 创建云主机
      case ClusterQueryType.CreateVmCandidate:
        finalConditions = await this.getCandidateForCreateVm(params.extraConditions)
        break

      // 二层网络挂载集群
      case ClusterQueryType.ClusterAttachableL2Network:
        _extrazqlConditions = await this.getL2NetworkAttachableCluster(params.extraConditions)
        break

      //获取部署服务器可加载的裸金属集群
      case ClusterQueryType.BaremetalPxeserviceAttachableCluster:
        finalConditions = await this.getBaremetalPxeserviceAttachableCluster()
        break

      //获取部署服务器可卸载的裸金属集群
      case ClusterQueryType.BaremetalPxeserviceDetachableCluster:
        finalConditions = await this.getBaremetalPxeserviceDetachableCluster(params.extraConditions)
        break

      // 获取主存储可加载的集群
      case ClusterQueryType.PsAttachableCluster:
        _extrazqlConditions = await this.getPrimaryStorageAttachableCluster(params.extraConditions)
        break

      // ISCSIServer 获取可加载的集群
      case ClusterQueryType.ISCSIServerAttachableCluster:
        _extrazqlConditions = await this.getISCSIServerAttachableCluster(params.extraConditions)
        break

      // 获取ISCSIServer上的cluster
      case ClusterQueryType.GetClusterByISCSIServer:
        _extrazqlConditions = await this.getClusterByISCSIServer(params.extraConditions)
        break

      // NvmeServer 获取可加载的集群
      case ClusterQueryType.NvmeServerAttachableCluster:
        _extrazqlConditions = await this.getNvmeServerAttachableCluster(params.extraConditions)
        break

      // 获取NvmeServer上的cluster
      case ClusterQueryType.GetClusterByNvmeServer:
        _extrazqlConditions = await this.getClusterByNvmeServer(params.extraConditions)
        break

      default:
        break
    }

    let specicalCondition
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(
      params.conditions,
      ['networkHp', 'hostName', 'cluster.hostUuid', 'hasL3Network']
    )

    if (_extraConditionMap['networkHp']) {
      const filterNetworkHp =
        _extraConditionMap['networkHp'].values.length === 1 &&
        _extraConditionMap['networkHp'].values[0]
      const networkHpList = {
        [ZOp.query]: {
          tableName: 'ResourceConfig',
          fields: ['resourceUuid'],
          condition: {
            name: 'network.ovsdpdk',
            category: 'premiumCluster'
          }
        }
      }
      if (filterNetworkHp === 'on') {
        specicalCondition = {
          uuid: {
            [ZOp.in]: networkHpList
          }
        }
      }
      if (filterNetworkHp === 'off') {
        specicalCondition = {
          uuid: {
            [ZOp.notIn]: networkHpList
          }
        }
      }
    }

    if (_extraConditionMap['hostName']) {
      specicalCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['clusterUuid'],
              condition: {
                name: {
                  [ZOp.like]: _extraConditionMap['hostName'].value
                }
              }
            }
          }
        }
      }
    }

    if (_extraConditionMap['hasL3Network']) {
      specicalCondition = {
        ['l2Network.l3Network.uuid']: {
          [_extraConditionMap['hasL3Network'].value ? ZOp.notIn : ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SystemTag',
              fields: ['resourceUuid'],
              condition: {
                resourceType: 'PortGroupVO',
                tag: 'portGroup::default'
              }
            }
          }
        }
      }
    }

    // if (_extraConditionMap['cluster.hostUuid']) {
    //   specicalCondition = {
    //     uuid: {
    //       [ZOp.in]: {
    //         [ZOp.query]: {
    //           tableName: 'Host',
    //           fields: ['clusterUuid'],
    //           condition: {
    //             name: {
    //               [ZOp.like]: _extraConditionMap['hostName'].value
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    const _zqlCondition = QueryConditionTranslator.translate(
      _conditions.concat(finalConditions),
      specicalCondition
    )

    const zqlCondition = _extrazqlConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _extrazqlConditions
          )
        }
      : _zqlCondition

    return await this.getClusterList(params, zqlCondition)
  }

  async getClusterList(params: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'Cluster',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)

    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []

    const total = results?.[0]?.total ?? 0
    return {
      list: list,
      total: total
    }
  }

  /**
   * 收集创建云主机时的集群参数 conditions
   * @param extraConditions ICondition[]
   */
  async getCandidateForCreateVm(extraConditions: ICondition[]) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateParam: GetCandidateZonesClustersHostsForCreatingVmActionParam = {
      imageUuid: conditionsMap['imageUuid'],
      l3NetworkUuids: conditionsMap['l3NetworkUuids'],
      systemTags: []
    }

    const instanceOfferingUuid = conditionsMap['instanceOfferingUuid']
    if (instanceOfferingUuid) {
      candidateParam.instanceOfferingUuid = instanceOfferingUuid
    }

    const rootDiskOfferingUuid = conditionsMap['rootDiskOfferingUuid']
    if (rootDiskOfferingUuid) {
      candidateParam.rootDiskOfferingUuid = rootDiskOfferingUuid
    }

    const vmGroupUuid = conditionsMap['vmGroupUuid']
    if (vmGroupUuid) {
      candidateParam.systemTags.push(`vmSchedulingRuleGroupUuid::${vmGroupUuid}`)
    }

    const cpuNum = conditionsMap['cpuNum']
    if (cpuNum) {
      candidateParam.cpuNum = cpuNum
    }

    const memorySize = conditionsMap['memorySize']
    if (memorySize) {
      candidateParam.memorySize = memorySize
    }

    const rootDiskSize = conditionsMap['rootDiskSize']
    if (rootDiskSize) {
      candidateParam.rootDiskSize = rootDiskSize
    }

    const { clusters = [] } =
      await this.getCandidateZonesClustersHostsForCreatingVmAction.call(candidateParam)
    const clusterUuidList = clusters.map(item => item.uuid)

    const conditions: ICondition[] = [
      {
        key: 'type',
        value: 'zstack'
      },
      {
        key: 'uuid',
        op: Op.in,
        values: clusterUuidList
      }
    ]
    return conditions
  }

  /**
   * 收集二层网络挂载集群的参数 l2NetworkUuid
   * @param extraConditions ICondition[]
   */
  async getL2NetworkAttachableCluster(extraConditions: ICondition[]) {
    const conditionsMap = conditionsToObject(extraConditions)
    const l2NetworkUuid = conditionsMap['l2NetworkUuid']
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetCandidateClustersForAttachingL2Network',
            output: 'inventories.uuid',
            condition: {
              l2NetworkUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getCandidateClusterForVmSelectList(param: QueryClusterArgs) {
    const { conditions = [] } = param
    const extraConditionKeys = [
      'instanceOfferingUuid',
      'imageUuid',
      'l3NetworkUuids',
      'rootDiskOfferingUuid',
      'vmGroupUuid'
    ]
    const _extraConditionMap = extractAndRemoveExtraCondition(conditions, extraConditionKeys)[1]

    const candidateParam: GetCandidateZonesClustersHostsForCreatingVmActionParam = {
      instanceOfferingUuid: _extraConditionMap['instanceOfferingUuid']?.value,
      imageUuid: _extraConditionMap['imageUuid']?.value,
      l3NetworkUuids: _extraConditionMap['l3NetworkUuids']?.values,
      systemTags: []
    }

    const rootDiskOfferingUuid = _extraConditionMap['rootDiskOfferingUuid']?.value
    if (rootDiskOfferingUuid) {
      candidateParam.rootDiskOfferingUuid = rootDiskOfferingUuid
    }

    const vmGroupUuid = _extraConditionMap['vmGroupUuid']?.value
    if (vmGroupUuid) {
      candidateParam.systemTags.push(`vmSchedulingRuleGroupUuid::${vmGroupUuid}`)
    }

    const { clusters } =
      await this.getCandidateZonesClustersHostsForCreatingVmAction.call(candidateParam)
    const clusterUuidList = clusters.map(item => item.uuid)

    const params: QueryClusterArgs = {
      conditions: [
        {
          key: 'type',
          value: 'zstack'
        },
        {
          key: 'uuid',
          op: Op.in,
          values: clusterUuidList
        }
      ],
      replyWithCount: true
    }
    return await this.clusterList(params)
  }

  async getHostNum(uuid: string) {
    return this.getHostNumDataLoader.load(uuid)
  }

  private _getHostNums = async (uuids: string[] = []) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'Host',
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterHostCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterHostCountMap, clusterUuid, 0))
  }

  async getIsAttachL2network(uuid: string) {
    return this.getIsAttachL2networkDataLoader.load(uuid)
  }

  _getIsAttachL2network = async (uuids: string[] = []) => {
    const zql = ZQL.stringify({
      tableName: 'L2NetworkClusterRef',
      fields: ['l2NetworkUuid', 'clusterUuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterHasL2Map = _.reduce(
      _.get(results, ['0', 'inventories']),
      (obj, item) => {
        obj[item.clusterUuid] = true
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterHasL2Map, clusterUuid, false))
  }

  async getIsAttachPrimaryStorage(uuid: string) {
    return this.getIsAttachPrimaryStorageDataLoader.load(uuid)
  }

  _getIsAttachPrimaryStorage = async (uuids: string[] = []) => {
    const zql = ZQL.stringify({
      tableName: 'PrimaryStorageClusterRef',
      fields: ['primaryStorageUuid', 'clusterUuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterHasPsMap = _.reduce(
      _.get(results, ['0', 'inventories']),
      (obj, item) => {
        obj[item.clusterUuid] = true
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterHasPsMap, clusterUuid, false))
  }

  async getPsTypes(uuid: string) {
    return this.getPsTypesDataLoader.load(uuid)
  }

  _getPsTypes = async (uuids: string[] = []) => {
    const zql = ZQL.multStringify([
      {
        tableName: 'PrimaryStorage',
        fields: ['uuid', 'type'],
        condition: {
          'cluster.uuid': {
            [ZOp.in]: uuids
          }
        }
      },
      {
        tableName: 'PrimaryStorageClusterRef',
        fields: ['primaryStorageUuid', 'clusterUuid'],
        condition: {
          clusterUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])

    const { results = [] } = await this.zqlService.call(zql)

    const psTypeMap = _.reduce(
      _.get(results, ['0', 'inventories']),
      (obj, ps) => {
        if (!obj[ps.uuid]) {
          obj[ps.uuid] = [ps.type]
        } else {
          obj[ps.uuid].push(ps.type)
        }

        return obj
      },
      {}
    )

    const clusterPsMap = _.reduce(
      _.get(results, ['1', 'inventories']),
      (obj, item) => {
        if (!obj[item.clusterUuid]) {
          obj[item.clusterUuid] = [item.primaryStorageUuid]
        } else {
          obj[item.clusterUuid].push(item.primaryStorageUuid)
        }

        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => {
      const psUuids = _.get(clusterPsMap, clusterUuid, [])
      const types = _.uniq(
        _.compact(
          _.flatten(
            _.map(psUuids, psUuid => {
              return _.get(psTypeMap, psUuid, [])
            })
          )
        )
      )

      return types
    })
  }

  getZWatchInfo(uuid) {
    return this.zwatchInfoDataLoader.load(uuid)
  }

  _getZWatchInfo = async (uuids: string[]) => {
    // 直接查询集群查不到信息。
    const zql = ZQL.stringify({
      tableName: 'host',
      fields: ['uuid', 'clusterUuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'zwatch1',
            offsetAheadOfCurrentTime: 1,
            metricName: 'CPUAllUsedUtilization'
          },
          {
            resultName: 'zwatch2',
            offsetAheadOfCurrentTime: 1,
            metricName: 'MemoryUsedInPercent'
          },
          {
            resultName: 'zwatch3',
            offsetAheadOfCurrentTime: 1,
            metricName: 'MemoryFreeBytes'
          }
        ]
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const cpuAllUsedUtilizationMap = _.reduce(
      _.get(results, ['0', 'returnWith', 'zwatch1'], []),
      (obj, cpuValueInfo) => {
        _.set(obj, _.get(cpuValueInfo, ['labels', 'HostUuid']), _.get(cpuValueInfo, 'value', 0))
        return obj
      },
      {}
    )

    const memoryUsedInPercentMap = _.reduce(
      _.get(results, ['0', 'returnWith', 'zwatch2'], []),
      (obj, memoryValueInfo) => {
        _.set(
          obj,
          _.get(memoryValueInfo, ['labels', 'HostUuid']),
          _.get(memoryValueInfo, 'value', 0)
        )
        return obj
      },
      {}
    )

    const memoryFreeBytesMap = _.reduce(
      _.get(results, ['0', 'returnWith', 'zwatch3'], []),
      (obj, memoryBytesValueInfo) => {
        _.set(
          obj,
          _.get(memoryBytesValueInfo, ['labels', 'HostUuid']),
          _.get(memoryBytesValueInfo, 'value', 0)
        )
        return obj
      },
      {}
    )

    const clusterHostMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, host) => {
        if (!obj[host.clusterUuid]) {
          obj[host.clusterUuid] = {
            cpuAllUsedUtilization: [_.get(cpuAllUsedUtilizationMap, host.uuid, 0)],
            memoryUsedInPercent: [_.get(memoryUsedInPercentMap, host.uuid, 0)],
            memoryFreeBytes: [_.get(memoryFreeBytesMap, host.uuid, 0)]
          }
        } else {
          obj[host.clusterUuid].cpuAllUsedUtilization.push(
            _.get(cpuAllUsedUtilizationMap, host.uuid, 0)
          )
          obj[host.clusterUuid].memoryUsedInPercent.push(
            _.get(memoryUsedInPercentMap, host.uuid, 0)
          )
          obj[host.clusterUuid].memoryFreeBytes.push(_.get(memoryFreeBytesMap, host.uuid, 0))
        }
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      // 取平均值。
      return {
        cpuAllUsedUtilization: _.mean(_.get(clusterHostMap, [uuid, 'cpuAllUsedUtilization'], [0])),
        memoryUsedInPercent: _.mean(_.get(clusterHostMap, [uuid, 'memoryUsedInPercent'], [0])),
        memoryFreeBytes: _.sum(_.get(clusterHostMap, [uuid, 'memoryFreeBytes'], [0]))
      }
    })
  }

  getCpuMemoryCapacity(uuid: string) {
    return this.getCpuMemoryCapacityDataLoader.load(uuid)
  }

  _getCpuMemoryCapacity = async (uuids: string[]) => {
    // 获取资源配置，优先cluster，最后全局配置。
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
            [ZOp.in]: uuids
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

    const reservedMemory = _.get(config, 'reservedMemory', '1G')
    const [_number, _unit = 'B'] = _.words(reservedMemory)

    const reservedPhysicalMemory = _.toNumber(_.get(unitObj, _unit, 1) * _.toNumber(_number))

    /***
     *
time zstack-cli ZQLQuery zql="sum HostCapacity.availableCpu,availableMemory,availablePhysicalMemory,cpuNum,totalCpu,totalMemory,totalPhysicalMemory by cpuSockets where uuid in (query host.uuid where clusterUuid in ('2d59704fcd194ecfa33bee05f8449817','649e3a37b3284482a96a290a939db1a3','cf1a0eb4d36e4f80b024334470e6ee0c','d1943b2970a7477ba4e29581ccc74256'))"
{
    "results": [
        {
            "inventories": [
                [
                    2,
                    832000,
                    357341279027200,
                    357341279027200,
                    83200,
                    832000,
                    357341279027200,
                    357341279027200
                ]
            ]
        }
    ],
    "success": true
}


real    0m3.122s
user    0m0.643s
sys     0m0.120s
     *
     */
    // 一般 cpuSockets 种类相比其他较少，所以用cpuSockets分类

    const uuidList = _.chunk(_.uniq(uuids), 50)
    let resultList = []
    await Promise.allSettled(
      _.map(uuidList, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.SUM,
              tableName: 'HostCapacity',
              fields: ['cpuNum', 'availableCpu', 'totalCpu', 'availableMemory', 'totalMemory'],
              sumBy: 'uuid', // sumBy: 'cpuSockets' 每个host的availableMemory要减去reservedMemory（注意这里是host不是cluster也不是zone）
              condition: {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Host',
                      fields: ['uuid'],
                      condition: {
                        clusterUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const clusterCapacityMap = _.reduce(
      resultList,
      (obj, item) => {
        const capacityList = _.get(item, ['inventories'], [])

        obj[item.name] = _.reduce(
          capacityList,
          (_obj, it) => {
            const [
              hostUuid,
              cpuNum = 0,
              availableCpu = 0,
              totalCpu = 0,
              availableMemory = 0,
              totalMemory = 0
            ] = it
            const _availableMemory = _.max([0, availableMemory - reservedPhysicalMemory])
            _obj.physicalCpu += cpuNum
            _obj.availableCpu += availableCpu
            _obj.totalCpu += totalCpu
            _obj.availableMemory += _availableMemory
            _obj.totalMemory += totalMemory

            return _obj
          },
          {
            physicalCpu: 0,
            availableCpu: 0,
            totalCpu: 0,
            availableMemory: 0,
            totalMemory: 0
          }
        )
        return obj
      },
      {}
    )

    // // 收集Cluster CpuMemoryCapacity。 可以批量查询。
    // const clusterCpuMemoryResp = await this.getCpuMemoryCapacityAction.call({
    //   clusterUuids: uuids
    // })
    // const clussterCapacityData = _.reduce(
    //   _.get(clusterCpuMemoryResp, 'capacityData', []),
    //   (obj, capacity) => {
    //     _.set(obj, _.get(capacity, 'resourceUuid'), {
    //       ...capacity,
    //       physicalCpu: capacity?.managedCpuNum || 0
    //     })

    //     return obj
    //   },
    //   {}
    // )

    return uuids.map(clusterUuid => {
      const overProvisioning = _.get(
        resourceConfig,
        [clusterUuid, 'overProvisioning.memory'],
        _.get(config, 'overProvisioning.memory')
      )
      const reservedMemory = _.get(
        resourceConfig,
        [clusterUuid, 'reservedMemory'],
        _.get(config, 'reservedMemory')
      )
      const overProvisioningTotalMemory =
        _.get(clusterCapacityMap, [clusterUuid, 'totalMemory'], 0) * overProvisioning
      const overProvisioningAvailableMemory =
        _.get(clusterCapacityMap, [clusterUuid, 'availableMemory'], 0) * overProvisioning

      return {
        ..._.get(clusterCapacityMap, clusterUuid, null),
        reservedMemory,
        overProvisioningTotalMemory,
        overProvisioningAvailableMemory
      }
    })
  }

  // getOverProvisioningTotalMemory(uuid: string) {
  //   return this.getOverProvisioningTotalMemoryDataLoader.load(uuid)
  // }

  // _getOverProvisioningTotalMemory = async (uuids: string[]) => {
  //   // 获取资源配置，优先cluster，最后全局配置。
  //   const configZql = ZQL.multStringify([
  //     {
  //       tableName: 'GlobalConfig',
  //       condition: {
  //         name: 'overProvisioning.memory'
  //       }
  //     },
  //     {
  //       tableName: 'ResourceConfig',
  //       condition: {
  //         resourceUuid: {
  //           [ZOp.in]: uuids
  //         },
  //         name: 'overProvisioning.memory'
  //       }
  //     }
  //   ])

  //   const configResp = await this.zqlService.call(configZql)

  //   // 全局配置默认值
  //   const config = {
  //     'overProvisioning.memory': 1.0
  //   }

  //   // 收集全局配置的值
  //   _.forEach(_.get(configResp, ['results', '0', 'inventories'], []), globalConfig => {
  //     if (_.get(globalConfig, 'name')) {
  //       _.set(config, _.get(globalConfig, 'name'), _.get(globalConfig, 'value'))
  //     }
  //   })

  //   // 收集资源配置的值
  //   const resourceConfig = _.reduce(_.get(configResp, ['results', '1', 'inventories'], []), (obj, rsConfig) => {
  //     _.set(obj, [_.get(rsConfig, 'resourceUuid'), _.get(rsConfig, 'name')], _.get(rsConfig, 'value'))
  //     return obj
  //   }, {})

  //   // 收集Cluster CpuMemoryCapacity。 可以批量查询。
  //   const clusterCpuMemoryResp = await this.getCpuMemoryCapacityAction.call({
  //     clusterUuids: uuids
  //   })
  //   const clussterCapacityData = _.reduce(_.get(clusterCpuMemoryResp, 'capacityData', []), (obj, capacity) => {
  //     _.set(obj, _.get(capacity, 'resourceUuid'), capacity)
  //     return obj
  //   }, {})

  //   return uuids.map(clusterUuid => {
  //     const overProvisioning = _.get(resourceConfig, [clusterUuid, 'overProvisioning.memory'], _.get(config, 'overProvisioning.memory'))
  //     const totalMemory = _.get(clussterCapacityData, [clusterUuid, 'totalMemory'], 0) * overProvisioning
  //     return totalMemory
  //   })
  // }

  async getTotalVm(uuid: string) {
    const params: IQueryAction = {
      conditions: [
        {
          key: 'cluster.uuid',
          op: Op.eq,
          value: uuid
        },
        {
          key: 'type',
          op: Op.eq,
          value: 'UserVm'
        }
      ],
      limit: 100000,
      count: true
    }
    const { total } = await this.queryVmInstanceAction.call(params)
    return total ?? 0
  }

  async getRunningVm(uuid: string) {
    const params: IQueryAction = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: uuid
        },
        {
          key: 'state',
          value: 'Running'
        },
        {
          key: 'type',
          op: Op.eq,
          value: 'UserVm'
        }
      ],
      limit: 100000,
      count: true
    }
    const { total } = await this.queryVmInstanceAction.call(params)
    return total ?? 0
  }

  async getDestroyedVm(uuid: string) {
    const params: IQueryAction = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: uuid
        },
        {
          key: 'state',
          value: 'Destroyed'
        },
        {
          key: 'type',
          op: Op.eq,
          value: 'UserVm'
        }
      ],
      limit: 100000,
      count: true
    }
    const { total } = await this.queryVmInstanceAction.call(params)
    return total ?? 0
  }

  async getStoppedVm(uuid: string) {
    const params: IQueryAction = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: uuid
        },
        {
          key: 'state',
          value: 'Stopped'
        },
        {
          key: 'type',
          op: Op.eq,
          value: 'UserVm'
        }
      ],
      limit: 100000,
      count: true
    }
    const { total } = await this.queryVmInstanceAction.call(params)
    return total ?? 0
  }

  getCheckCpuModel(uuid: string) {
    return this.clusterCheckCpuModelDataLoader.load(uuid)
  }

  _getCheckCpuModel = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceType: 'ClusterVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'check::cluster::cpu::model::'
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const clusterCpuModelMap = _.reduce(
      inventories,
      (obj, tag) => {
        const checkCpuModel = tag.tag.split('::')[4]
        obj[tag?.resourceUuid] = checkCpuModel
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterCpuModelMap, clusterUuid, 'default'))
  }

  getCheckCpuModelId(uuid: string) {
    return this.clusterCheckCpuModelIdDataLoader.load(uuid)
  }

  _getCheckCpuModelId = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'uuid'],
      condition: {
        resourceType: 'ClusterVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'check::cluster::cpu::model::'
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const clusterCpuModelMap = _.reduce(
      inventories,
      (obj, tag) => {
        obj[tag?.resourceUuid] = tag?.uuid
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterCpuModelMap, clusterUuid, null))
  }

  getRecommendQemuVersion(uuid: string) {
    return this.recommendQemuVersionDataLoader.load(uuid)
  }

  _getRecommendQemuVersion = async (uuids: string[]) => {
    const clusterUuidList = _.chunk(_.uniq(uuids), 50)
    const unmatchedHostUuids: string[] = []
    const hostExpectVersionMap = {}
    let resultList = []
    await Promise.allSettled(
      _.map(clusterUuidList, async clusterUuids => {
        const zql = ZQL.multStringify(
          _.map(clusterUuids, clusterUuid => {
            return {
              tableName: 'KvmhypervisorInfo',
              fields: 'uuid',
              condition: {
                matchState: 'Unmatched',
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Host',
                      fields: ['uuid'],
                      condition: {
                        clusterUuid: clusterUuid
                      }
                    }
                  }
                }
              },
              limit: 1,
              namedAs: clusterUuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const clusterUnmatchedHostMap = _.reduce(
      resultList,
      (obj, item) => {
        const hostUuid = _.get(item, ['inventories', '0', 'uuid'], null)
        unmatchedHostUuids.push(hostUuid)

        obj[item.name] = hostUuid
        return obj
      },
      {}
    )

    const hostUuidList = _.chunk(_.compact(unmatchedHostUuids), 50)

    await Promise.all(
      _.map(hostUuidList, hostUuids => {
        return this.getVirtualizerInfoAction
          .call({
            uuids: hostUuids
          })
          .then(resp => {
            const { inventories = [] } = resp
            for (const virtualizerInfo of inventories) {
              hostExpectVersionMap[virtualizerInfo?.uuid] = _.get(
                virtualizerInfo,
                ['infoList', '0', 'expectVersion'],
                null
              )
            }
          })
          .catch(() => Promise.resolve())
      })
    )

    return uuids.map(clusterUuid =>
      _.get(hostExpectVersionMap, _.get(clusterUnmatchedHostMap, clusterUuid))
    )
  }

  getClusterKVMCpuModel(uuid: string) {
    return this.clusterKVMCpuModelDataLoader.load(uuid)
  }

  _getClusterKVMCpuModel = async (uuids: string[]) => {
    // 获取资源配置，优先cluster，最后全局配置。
    const configZql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        fields: ['value'],
        condition: {
          name: 'vm.cpuMode',
          category: 'kvm'
        }
      },
      {
        tableName: 'ResourceConfig',
        fields: ['resourceUuid', 'value'],
        condition: {
          name: 'vm.cpuMode',
          category: 'kvm',
          resourceType: 'ClusterVO',
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])

    const { results = [] } = await this.zqlService.call(configZql)

    const globalConfigValue = _.get(results, ['0', 'inventories', '0', 'value'])

    const resourceConfigMap = _.reduce(
      _.get(results, ['1', 'inventories'], []),
      (obj, config) => {
        obj[config?.resourceUuid] = config?.value
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(resourceConfigMap, clusterUuid, globalConfigValue))
  }

  getDisplayNetworkCidr(uuid: string) {
    return this.clusterDisplayNetworkCidrDataLoader.load(uuid)
  }

  _getDisplayNetworkCidr = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceType: 'ClusterVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'display::network::cidr::'
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const clusterCidrMap = _.reduce(
      inventories,
      (obj, tag) => {
        obj[tag?.resourceUuid] = _.get(_.split(tag?.tag, '::'), '3', null)
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterCidrMap, clusterUuid, null))
  }

  getMigrateNetworkCidr(uuid: string) {
    return this.clusterMigrateNetworkCidrDataLoader.load(uuid)
  }

  _getMigrateNetworkCidr = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceType: 'ClusterVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'cluster::migrate::network::cidr::'
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const clusterCidrMap = _.reduce(
      inventories,
      (obj, tag) => {
        obj[tag?.resourceUuid] = _.get(_.split(tag?.tag, '::'), '4', null)
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterCidrMap, clusterUuid, null))
  }

  // 获取集群关联的云主机、云盘、主存储、二层网络数量
  async getCount(
    clusterUuid: string,
    type: 'PrimaryStorage' | 'L2Network' | 'VmInstance' | 'Volume' | 'Host',
    condition = {}
  ): Promise<number> {
    const conditionMap = {
      PrimaryStorage: {
        'cluster.uuid': clusterUuid
      },
      L2Network: {
        'cluster.uuid': clusterUuid,
        type: {
          [ZOp.ne]: 'portGroup'
        }
      },
      VmInstance: {
        clusterUuid: clusterUuid,
        type: 'UserVm',
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'templatedVminstance',
                  fields: ['uuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'templatedVminstanceCache',
                  fields: ['cacheVmInstanceUuid']
                }
              }
            }
          }
        ]
      },
      Volume: {
        'primaryStorage.cluster.uuid': clusterUuid,
        type: 'Data'
      },
      Host: {
        clusterUuid: clusterUuid
      }
    }

    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: type,
      condition: _.merge(_.get(conditionMap, type, {}), condition)
    })

    const { results } = await this.zqlService.call(zql)
    const total = _.get(results, ['0', 'total'], 0)

    return total
  }

  // 获取裸金属设备数量
  getBaremetalChassisNum = async (uuid: string) => {
    return this.getBaremetalChassisNumDataLoader.load(uuid)
  }

  _getBaremetalChassisNum = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'BaremetalChassis',
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBaremetalChassisCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterBaremetalChassisCountMap, clusterUuid, 0))
  }

  getBaremetalInstanceNum = async (uuid: string) => {
    return this.getBaremetalInstanceNumDataLoader.load(uuid)
  }

  _getBaremetalInstanceNum = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'BaremetalInstance',
      groupBy: 'clusterUuid',
      condition: {
        state: {
          [ZOp.ne]: BaremetalInstanceState.Destroyed
        },
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBaremetalInstanceCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterBaremetalInstanceCountMap, clusterUuid, 0))
  }

  // 获取弹性裸金属设备数量
  getBaremetal2ChassisNum = async (uuid: string) => {
    return this.getBaremetal2ChassisNumDataLoader.load(uuid)
  }

  _getBaremetal2ChassisNum = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'Baremetal2Chassis',
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBaremetal2ChassisCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterBaremetal2ChassisCountMap, clusterUuid, 0))
  }

  // 获取弹性裸金属设备数量
  getBaremetal2GatewayNum = async (uuid: string) => {
    return this.getBaremetal2GatewayNumDataLoader.load(uuid)
  }

  _getBaremetal2GatewayNum = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'BareMetal2GatewayClusterRef',
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBareMetal2GatewayClusterRefCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total > 0
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid =>
      _.get(clusterBareMetal2GatewayClusterRefCountMap, clusterUuid, false)
    )
  }

  // 是否已加载部署服务器
  getIsAttachBaremetalPxeServer = async (uuid: string) => {
    return this.getIsAttachBaremetalPxeServerDataLoader.load(uuid)
  }

  _getIsAttachBaremetalPxeServer = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'BaremetalPxeServerClusterRef',
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBaremetalPxeServerClusterRefCountMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.clusterUuid] = total > 0
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid =>
      _.get(clusterBaremetalPxeServerClusterRefCountMap, clusterUuid, false)
    )
  }

  getBaremetalPxeServer = async (uuid: string) => {
    return this.getBaremetalPxeServerDataLoader.load(uuid)
  }

  _getBaremetalPxeServer = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'BaremetalPxeServer',
      condition: {
        attachedClusterUuids: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    return uuids.map(clusterUuid =>
      _.get(results, ['0', 'inventories'], []).find(it =>
        it.attachedClusterUuids.includes(clusterUuid)
      )
    )
  }

  // 获取部署网络
  getProvisionNetwork = async (uuid: string) => {
    return this.getProvisionDataLoader.load(uuid)
  }

  _getProvisionNetwork = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'BareMetal2ProvisionNetwork',
      condition: {
        'cluster.uuid': {
          [ZOp.in]: uuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterBareMetal2ProvisionNetworkMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, pNetwork) => {
        const attachedClusterUuids = pNetwork?.attachedClusterUuids || []
        for (const clusterUuid of attachedClusterUuids) {
          obj[clusterUuid] = pNetwork
        }

        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => _.get(clusterBareMetal2ProvisionNetworkMap, clusterUuid, null))
  }

  isHugePageMemoryCanOpen = async (uuid: string) => {
    return this.getIsHugePageMemoryCanOpen.load(uuid)
  }

  _isHugePageMemoryCanOpen = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      fields: ['uuid', 'clusterUuid'],
      groupBy: 'clusterUuid',
      condition: {
        clusterUuid: {
          [ZOp.in]: uuids
        },
        state: {
          [ZOp.ne]: 'Destroyed'
        },
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ResourceConfig',
              fields: ['resourceUuid'],
              condition: {
                resourceType: 'VmInstanceVO',
                category: 'kvm',
                name: 'memory.auto.balloon',
                value: 'true'
              }
            }
          }
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const clusterVmMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, it) => {
        obj[it.clusterUuid] = true
        return obj
      },
      {}
    )

    return uuids.map(clusterUuid => !_.get(clusterVmMap, clusterUuid, false))
  }

  getIsShowDrsTab = async (uuid: string) => {
    return this.getIsShowDrsTableDataLoader.load(uuid)
  }

  _getIsShowDrsTab = async (uuids: string[]) => {
    const genZql = (uuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'ClusterDRS',
        condition: {
          clusterUuid: uuid,
          state: 'Enabled'
        },
        namedAs: uuid
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
    return uuids.map(uuid => {
      const count = map[uuid]
      return !!count
    })
  }

  async getIsSupported(uuid: string): Promise<boolean> {
    const resourceConfigParams: ValidateClusterSupportDRSActionParam = {
      clusterUuid: uuid
    }

    try {
      const { supported = false } =
        await this.validateClusterSupportDRSAction.call(resourceConfigParams)
      return supported
    } catch (err) {
      return false
    }
  }

  getIsMaintenanceOfAllHost(uuid) {
    return this.getIsMaintenanceOfAllHostDataLoader.load(uuid)
  }

  _getIsMaintenanceOfAllHost = async (uuids: string[]) => {
    // 对于没有host的cluster认为与Maintenance无关
    const zql = ZQL.multStringify([
      {
        // 该cluster一定有host
        tableName: 'Cluster',
        fields: ['uuid'],
        condition: {
          'host.state': {
            [ZOp.ne]: 'Maintenance'
          }
        }
      },
      {
        // 该cluster一定有host
        tableName: 'Cluster',
        fields: ['uuid'],
        condition: {
          'host.state': 'Maintenance'
        }
      }
    ])
    const { results = [] } = await this.zqlService.call(zql)

    const notAllMaintenanceMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, cluster) => {
        obj[cluster?.uuid] = true
        return obj
      },
      {}
    )

    const allMaintenanceMap = _.reduce(
      _.get(results, ['1', 'inventories'], []),
      (obj, cluster) => {
        obj[cluster?.uuid] = !_.get(notAllMaintenanceMap, cluster?.uuid)
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(allMaintenanceMap, uuid, false))

    // const uuidList = _.chunk(_.uniq(uuids), 50)
    // let resultList = []
    // await Promise.allSettled(
    //   _.map(uuidList, async _uuids => {
    //     const zql = ZQL.multStringify(
    //       _.map(_uuids, uuid => {
    //         return {
    //           action: ZQLAction.COUNT,
    //           tableName: 'Host',
    //           condition: {
    //             clusterUuid: uuid,
    //             state: {
    //               [ZOp.ne]: 'Maintenance'
    //             }
    //           },
    //           namedAs: uuid
    //         }
    //       })
    //     )

    //     const { results } = await this.zqlService.call(zql)
    //     resultList = resultList.concat(results)
    //   })
    // )

    // const hostNumMap = _.reduce(
    //   resultList,
    //   (obj, item) => {
    //     obj[item.name] = _.get(item, ['total'], 0) <= 0
    //     return obj
    //   },
    //   {}
    // )

    // return uuids.map(uuid => _.get(hostNumMap, uuid, false))
  }

  /**
   * 创建PS的时候，可加载的集群列表uuidList
   * @param psType
   * @param isOpensource
   */
  async getPrimaryStorageAttachableClusterByType(
    psType,
    isOpensource = false,
    cache = [],
    defaultProtocol
  ) {
    const clusterResp = await this.queryClusterAction.call({
      fields: ['uuid']
    })
    const clusterUuids = clusterResp.inventories.map(it => it.uuid)

    if (_.isBoolean(isOpensource) && isOpensource) {
      return clusterUuids
    } else {
      const result = []
      const taskList = []
      clusterUuids.forEach(uuid => {
        const p = this.queryPrimaryStorageAction
          .call({
            conditions: [
              {
                key: 'cluster.uuid',
                value: uuid
              }
            ]
          })
          .then(resp => {
            let psTypes = getAvailablePsTypes(resp.inventories)
            if (cache && _.find(cache, { clusterUuid: uuid })) {
              psTypes = getAvailablePsTypes([
                ...resp.inventories,
                ..._.filter(cache, { clusterUuid: uuid })
              ])
            }
            if (psTypes.includes(psType) || psTypes.includes(defaultProtocol)) {
              result.push(uuid)
            }
          })
        taskList.push(p)
      })
      return await Promise.all(taskList).then(() => result)
    }
  }

  async getClusterByISCSIServer(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['iscsiServerUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      iscsiServerUuid: string
    }
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'IscsiServerClusterRef',
            fields: ['clusterUuid'],
            condition: {
              iscsiServerUuid: params?.iscsiServerUuid
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getISCSIServerAttachableCluster(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['iscsiServerUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      iscsiServerUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'IscsiServerClusterRef',
            fields: ['clusterUuid'],
            condition: {
              iscsiServerUuid: params?.iscsiServerUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getNvmeServerAttachableCluster(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['nvmeServerUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      nvmeServerUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'NvmeServerClusterRef',
            fields: ['clusterUuid'],
            condition: {
              nvmeServerUuid: params?.nvmeServerUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getClusterByNvmeServer(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['nvmeServerUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      nvmeServerUuid: string
    }
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'NvmeServerClusterRef',
            fields: ['clusterUuid'],
            condition: {
              nvmeServerUuid: params?.nvmeServerUuid
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async filterCephTokenOrShareblockTypePs(type, cephToken: string, clusterUuids: string[] = []) {
    if (type === 'Ceph' && cephToken) {
      //有token类型的ceph主存储加载BM集群时：过滤掉已有shareblock主存储的弹性裸金属集群
      const _clusterUuids = await Promise.all(
        clusterUuids.map(async uuid => {
          const zqlObj = {
            action: ZQLAction.COUNT,
            tableName: 'PrimaryStorage',
            condition: {
              'cluster.uuid': uuid,
              type: 'SharedBlock'
            }
          }

          const zql = ZQL.stringify(zqlObj)

          const {
            results: [{ total = 0 } = {}]
          } = await this.zqlService.call(zql)

          if (total > 0) {
            return null
          }
          return uuid
        })
      )

      return _clusterUuids?.filter(Boolean)
    } else if (type === 'SharedBlock') {
      //shareblock主存储加载BM集群时：过滤掉已有token类型的ceph的弹性裸金属集群
      const _clusterUuids = await Promise.all(
        clusterUuids.map(async uuid => {
          const zqlObj = {
            action: ZQLAction.COUNT,
            tableName: 'PrimaryStorage',
            condition: {
              'cluster.uuid': uuid,
              type: 'Ceph',
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'systemtag',
                    fields: ['resourceUuid'],
                    condition: {
                      tag: {
                        [ZOp.like]: 'ceph::thirdPartyPlatform'
                      }
                    }
                  }
                }
              }
            }
          }

          const zql = ZQL.stringify(zqlObj)

          const {
            results: [{ total = 0 } = {}]
          } = await this.zqlService.call(zql)

          if (total > 0) {
            return null
          }
          return uuid
        })
      )

      return _clusterUuids?.filter(Boolean)
    }

    return clusterUuids
  }
  /**
   * 获取主存储可加载的集群
   * @param PrimaryStorageAttachableClusterParam [type]
   *
   */
  async getPrimaryStorageAttachableCluster(extraConditions) {
    const conditionsMap = conditionsToObject(
      extraConditions
    ) as PrimaryStorageAttachableClusterParam
    const {
      type,
      defaultProtocol,
      isOpensource = false,
      __PrimaryStorageUuids__ = [],
      cache = [],
      cephToken
    } = conditionsMap
    const attachableClusterUuids = await this.getPrimaryStorageAttachableClusterByType(
      type,
      isOpensource,
      cache,
      defaultProtocol
    )

    let finalAttachableClusterUuids = attachableClusterUuids

    finalAttachableClusterUuids = await this.filterCephTokenOrShareblockTypePs(
      type,
      cephToken,
      finalAttachableClusterUuids
    )
    const zqlCondition =
      __PrimaryStorageUuids__?.length > 0
        ? {
            [ZOp.and]: [
              {
                uuid: {
                  [ZOp.in]: finalAttachableClusterUuids
                }
              },
              {
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'PrimaryStorageClusterRef',
                      fields: ['clusterUuid'],
                      condition: {
                        primaryStorageUuid: {
                          [ZOp.in]: __PrimaryStorageUuids__
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        : {
            uuid: {
              [ZOp.in]: finalAttachableClusterUuids
            }
          }

    return zqlCondition
  }

  //获取部署服务器可加载的裸金属集群
  async getBaremetalPxeserviceAttachableCluster() {
    const { inventories } = await this.queryBaremetalPxeServerAction.call({
      conditions: []
    })
    let attachedClusterUuids = []
    inventories.forEach(item => {
      attachedClusterUuids = _.concat(attachedClusterUuids, item.attachedClusterUuids)
    })
    attachedClusterUuids = _.uniq(attachedClusterUuids)
    const conditions: ICondition[] = [
      {
        key: 'uuid',
        op: Op.notIn,
        values: attachedClusterUuids
      }
    ]
    return conditions
  }

  //获取部署服务器可加载的裸金属集群
  async getBaremetalPxeserviceDetachableCluster(params) {
    const { inventories } = await this.queryBaremetalPxeServerAction.call({
      conditions: params
    })

    const conditions: ICondition[] = [
      {
        key: 'uuid',
        op: Op.in,
        values: inventories[0]?.attachedClusterUuids
      }
    ]
    return conditions
  }

  // 查询集群相关资源数量
  async getClusterRelatedSummary(uuid: string): Promise<ClusterRelatedSummary> {
    let vmResp
    try {
      vmResp = await this.queryVmInstanceAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: uuid
          },
          {
            key: 'type',
            value: 'UserVM'
          },
          {
            key: 'hypervisorType',
            value: 'ESX',
            op: Op.ne
          }
        ]
      })
    } catch (error) {}
    let hostResp
    try {
      hostResp = await this.queryHostAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let primaryStorageResp
    try {
      primaryStorageResp = await this.queryPrimaryStorageAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let iscsiServerResp
    try {
      iscsiServerResp = await this.queryIscsiServerAction.call({
        count: true,
        conditions: [
          {
            key: 'iscsiCluster.clusterUuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let l2NetworkResp
    try {
      l2NetworkResp = await this.queryL2NetworkAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let physicalNicResp
    try {
      physicalNicResp = await this.hostInterfaceService.query({
        conditions: [
          {
            key: 'host.clusterUuid',
            op: Op.eq,
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let gpuResp
    try {
      gpuResp = await this.queryPciDeviceAction.call({
        count: true,
        conditions: [
          {
            key: 'host.clusterUuid',
            value: uuid
          },
          {
            key: 'virtStatus',
            value: 'SRIOV_VIRTUAL',
            op: Op.ne
          },
          {
            key: 'type',
            values: ['GPU_Video_Controller', 'GPU_3D_Controller'],
            op: Op.in
          }
        ]
      })
    } catch (error) {}
    let vGpuResp
    try {
      vGpuResp = await this.vGpuDeviceService.queryVGpuDevice({
        count: true,
        conditions: [
          {
            key: 'host.clusterUuid',
            value: uuid
          }
        ]
      })
    } catch {}
    let usbResp
    try {
      usbResp = await this.queryUsbDeviceAction.call({
        count: true,
        conditions: [
          {
            key: 'host.clusterUuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}
    let pciResp
    try {
      pciResp = await this.queryPciDeviceAction.call({
        count: true,
        conditions: [
          {
            key: 'type',
            values: ['Moxa_Device', 'Custom'],
            op: Op.in
          }
        ]
      })
    } catch (error) {}

    return {
      vm: vmResp?.total || 0,
      host: hostResp?.total || 0,
      primaryStorage: primaryStorageResp?.total || 0,
      iscsiServer: iscsiServerResp?.total || 0,
      l2Network: l2NetworkResp?.total || 0,
      physicalNic: physicalNicResp?.total || 0,
      gpu: gpuResp?.total || 0,
      vGpu: vGpuResp?.total || 0,
      usb: usbResp?.total || 0,
      pci: pciResp?.total || 0
    }
  }

  // 查询裸金属集群相关资源数量
  async getBaremetal2ClusterRelatedSummary(uuid: string): Promise<Baremetal2ClusterRelatedSummary> {
    const params: IQueryAction = {
      count: true,
      conditions: [
        {
          key: 'cluster.uuid',
          value: uuid
        }
      ]
    }
    let gatewayResp
    try {
      gatewayResp = await this.queryBareMetal2GatewayAction.call(params)
    } catch {}
    let baremetalNodeResp
    try {
      baremetalNodeResp = await this.queryBaremetal2ChassisAction.call(params)
    } catch {}
    let primaryStorageResp
    try {
      primaryStorageResp = await this.queryPrimaryStorageAction.call(params)
    } catch (error) {}
    let l2NetworkResp
    try {
      l2NetworkResp = await this.queryL2NetworkAction.call(params)
    } catch (error) {}
    let iscsiServerResp
    try {
      iscsiServerResp = await this.queryIscsiServerAction.call({
        count: true,
        conditions: [
          {
            key: 'iscsiCluster.clusterUuid',
            value: uuid
          }
        ]
      })
    } catch (error) {}

    return {
      gateway: gatewayResp?.total || 0,
      baremetalNode: baremetalNodeResp?.total || 0,
      primaryStorage: primaryStorageResp?.total || 0,
      l2Network: l2NetworkResp?.total || 0,
      iscsiServer: iscsiServerResp?.total || 0
    }
  }

  // 获取集群 | 裸金属集群 | 弹性裸金属集群 Tab按钮数量
  async getClusterSummary(query: QueryClusterArgs) {
    const { type = ClusterQueryType.Normal, ...params } = query

    let condition

    const clusterCondition: any = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        hypervisorType: {
          [ZOp.notIn]: ['baremetal', 'baremetal2', 'ESX']
        }
      }
    }

    const clusterbaremetalCondition: any = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        hypervisorType: {
          [ZOp.eq]: 'baremetal'
        }
      }
    }

    const clusterbaremetal2Condition: any = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        hypervisorType: {
          [ZOp.eq]: 'baremetal2'
        }
      }
    }
    switch (type) {
      case ClusterQueryType.Normal:
        break

      // 二层网络挂载集群
      case ClusterQueryType.ClusterAttachableL2Network:
        condition = await this.getL2NetworkAttachableCluster(params.extraConditions)
        break

      // ISCSIServer 获取可加载的集群
      case ClusterQueryType.ISCSIServerAttachableCluster:
        condition = await this.getISCSIServerAttachableCluster(params.extraConditions)
        break

      // // 获取主存储可加载的集群
      case ClusterQueryType.PsAttachableCluster:
        condition = await this.getPrimaryStorageAttachableCluster(params.extraConditions)
        break

      default:
        break
    }

    const conds = [clusterCondition, clusterbaremetalCondition, clusterbaremetal2Condition].map(
      cond => {
        if (condition) {
          cond.condition = {
            [ZOp.and]: [cond.condition, condition]
          }
        }
        return QueryConditionTranslator.mergeQueryAction(query, cond)
      }
    )
    const zql = ZQL.multStringify(conds)

    const { results } = await this.zqlService.call(zql)
    const [clusterCount, baremetalCount, baremetal2Count] = results.map(t => t.total)

    return {
      clusterCount,
      baremetalCount,
      baremetal2Count
    }
  }

  // 物理机监控数据
  async getHostMetricDataList(
    uuid: string,
    startTime: number,
    endTime: number,
    period: number,
    metricNames: string[]
  ) {
    const zql = ZQL.stringify({
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        'cluster.uuid': uuid
      }
    })
    const { results } = await this.zqlService.call(zql)
    const hostInven = results?.[0]?.inventories ?? []
    const hostUuids = hostInven?.map(host => host.uuid)

    const namespace = 'ZStack/Host'
    const metricList = metricNames.map(metricName => {
      return {
        metricName,
        conditions: [
          {
            key: 'HostUuid',
            values: hostUuids
          }
        ]
      }
    })
    const data = await this.metricDataService.getMetricDataList(
      namespace,
      startTime,
      endTime,
      period,
      metricList
    )
    return metricNames.map(metricName => data[metricName])
  }

  // 云主机监控数据
  async getVmMetricDataList(
    uuid: string,
    startTime: number,
    endTime: number,
    period: number,
    metricNames: string[]
  ) {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      fields: ['uuid'],
      condition: {
        'cluster.uuid': uuid
      }
    })
    const { results } = await this.zqlService.call(zql)
    const vmInven = results?.[0]?.inventories ?? []
    const vmUuids = vmInven?.map(vm => vm.uuid)

    const namespace = 'ZStack/VM'
    const metricList = metricNames.map(metricName => {
      return {
        metricName,
        conditions: [
          {
            key: 'VMUuid',
            values: vmUuids
          }
        ]
      }
    })
    const data = await this.metricDataService.getMetricDataList(
      namespace,
      startTime,
      endTime,
      period,
      metricList
    )
    return metricNames.map(metricName => data[metricName])
  }

  /**
   * 查询DRS策略信息
   * @param params QueryClusterArgs [clusterUuid]
   */
  async queryClusterDRS(clusterUuid): Promise<QueryClusterDRSResp> {
    const zql = ZQL.stringify({
      tableName: 'ClusterDRS',
      condition: {
        clusterUuid: {
          [Op.eq]: clusterUuid
        }
      },
      returnWith: {
        total: true
      }
    })

    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list,
      total: total
    }
  }

  async clusterDRSList(params: QueryClusterArgs): Promise<QueryClusterResp> {
    const { type = ClusterQueryType.Normal } = params
    let _extrazqlConditions
    const finalConditions: ICondition[] = []
    switch (type) {
      case ClusterQueryType.Normal:
        break

      default:
        break
    }

    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(
      params.conditions,
      ['zoneUuid', 'cluster.name']
    )

    // 根据zoneUuid搜索过滤
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid: string = _extraConditionMap['zoneUuid']?.value

      const zoneZqlCondition = {
        clusterUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Cluster',
              fields: ['uuid'],
              condition: {
                zoneUuid
              }
            }
          }
        }
      }
      specicalCondition.push(zoneZqlCondition)
    }

    if (_extraConditionMap['cluster.name']) {
      const clusterName: string = _extraConditionMap['cluster.name']?.value

      const clusterNameZqlCondition = {
        clusterUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Cluster',
              fields: ['uuid'],
              condition: {
                name: {
                  [ZOp.like]: clusterName
                }
              }
            }
          }
        }
      }

      specicalCondition.push(clusterNameZqlCondition)
    }

    const _zqlCondition = QueryConditionTranslator.translate(
      _conditions.concat(finalConditions),
      specicalCondition
    )

    const zqlCondition = _extrazqlConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _extrazqlConditions
          )
        }
      : _zqlCondition

    return await this.getClusterDRSList(params, zqlCondition)
  }

  async getClusterDRSList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'ClusterDRS',
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
    const clusterDRS = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: clusterDRS,
      total: total
    }
  }

  /**
   * 查询DRS建议
   * @param params QueryClusterArgs [drsUuid(drsObj.uuid) ...]
   */
  async dRSAdviceList(params: QueryClusterArgs): Promise<QueryDRSAdviceResp> {
    const { type = ClusterQueryType.Normal } = params
    let _extrazqlConditions
    let adviceGroupUuid = ''
    const finalConditions: ICondition[] = []
    switch (type) {
      case ClusterQueryType.Normal:
        break
      default:
        break
    }

    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(
      params.conditions,
      ['drsUuid', 'lastAdviceGroupUuid', 'vm', 'current.host', 'target.host', 'status']
    )

    // 这块逻辑比较奇怪，最初版为2020年，由于 先revet到zsv_4.3.0的样子
    if (_extraConditionMap['drsUuid']) {
      const drsUuid = _extraConditionMap['drsUuid']?.value
      const queryDrsAdviceParam: IQueryAction = {
        limit: 1,
        sortBy: 'createDate',
        fields: ['adviceGroupUuid'],
        sortDirection: SortDirectionValidValues.desc,
        conditions: [
          {
            key: 'drsUuid',
            op: Op.eq,
            value: drsUuid
          }
        ]
      }
      const DRSAdviceResp = await this.queryDRSAdviceAction.call(queryDrsAdviceParam)
      adviceGroupUuid = DRSAdviceResp?.inventories?.[0]?.adviceGroupUuid

      if (adviceGroupUuid === undefined) {
        return {
          list: [],
          total: 0
        }
      }
    }

    if (adviceGroupUuid) {
      const drsUuid = _extraConditionMap['drsUuid']?.value
      const zqlCondition = {
        [ZOp.or]: [
          {
            [ZOp.and]: {
              adviceGroupUuid,
              drsUuid,
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'drsVmMigrationActivity',
                    fields: ['adviceUuid'],
                    condition: {
                      adviceUuid: { [ZOp.not]: null }, // ZSV-11285
                      drsUuid: drsUuid,
                      cause: 'ApplyAdvice'
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
                  tableName: 'drsVmMigrationActivity',
                  fields: ['adviceUuid'],
                  condition: {
                    drsUuid: drsUuid,
                    cause: 'ApplyAdvice',
                    status: {
                      [ZOp.in]: ['Created', 'InProgress', 'Failed']
                    }
                  }
                }
              }
            }
          }
        ]
      }
      specicalCondition.push(zqlCondition)
    }

    if (_extraConditionMap['vm']) {
      const vmName = _extraConditionMap['vm'].value
      const { inventories: vms } = await this.queryVmInstanceAction.call({
        conditions: [
          {
            key: 'name',
            op: Op.like,
            value: vmName
          }
        ]
      })
      _conditions.push({
        key: 'vmUuid',
        op: Op.in,
        values: vms.map(it => it.uuid)
      })
    }

    if (_extraConditionMap['current.host']) {
      const currentHostName = _extraConditionMap['current.host'].value
      const { inventories: hosts } = await this.queryHostAction.call({
        conditions: [
          {
            key: 'name',
            op: Op.like,
            value: currentHostName
          }
        ]
      })
      _conditions.push({
        key: 'vmSourceHostUuid',
        op: Op.in,
        values: hosts.map(it => it.uuid)
      })
    }

    if (_extraConditionMap['target.host']) {
      const targetHostName = _extraConditionMap['target.host'].value
      const { inventories: hosts } = await this.queryHostAction.call({
        conditions: [
          {
            key: 'name',
            op: Op.like,
            value: targetHostName
          }
        ]
      })
      _conditions.push({
        key: 'vmTargetHostUuid',
        op: Op.in,
        values: hosts.map(it => it.uuid)
      })
    }

    if (_extraConditionMap['status']) {
      const statusArr: string[] = _.uniq(
        _.compact(
          _.flatten([_extraConditionMap['status'].value || _extraConditionMap['status'].values])
        )
      )

      const hasUnexecuted = _.includes(statusArr, 'Unexecuted')
      if (hasUnexecuted) {
        specicalCondition.push({
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'drsvmMigrationActivity',
                    fields: ['drsUuid'],
                    condition: {
                      status: {
                        [ZOp.in]: statusArr
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
                    tableName: 'drsvmMigrationActivity',
                    fields: ['drsUuid']
                  }
                }
              }
            }
          ]
        })
      } else {
        specicalCondition.push({
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'drsvmMigrationActivity',
                fields: ['drsUuid'],
                condition: {
                  status: {
                    [ZOp.in]: statusArr
                  }
                }
              }
            }
          }
        })
      }
    }

    const _zqlCondition = QueryConditionTranslator.translate(
      _conditions.concat(finalConditions),
      specicalCondition
    )

    const zqlCondition = _extrazqlConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _extrazqlConditions
          )
        }
      : _zqlCondition

    return await this.getDRSAdviceList(params, zqlCondition)
  }

  async getDRSAdviceList(
    param: IQueryAction,
    zqlCondition: ZqlObject['condition']
  ): Promise<QueryDRSAdviceResp> {
    const zqlObject = {
      tableName: 'drsAdvice',
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
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list,
      total
    }
  }

  getAdviceStatus(uuid) {
    return this.getAdviceStatusDataLoader.load(uuid)
  }

  _getAdviceStatus = async (uuids: string[]) => {
    const params = {
      conditions: [{ key: 'adviceUuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.queryDRSVmMigrationActivityAction.call(params)
    const clusters = resp?.inventories
    return uuids.map(uuid => {
      const cluster = clusters.find(cluster => cluster.adviceUuid === uuid)
      if (cluster) {
        return cluster?.status
      } else {
        return 'Unexecuted'
      }
    })
  }

  getClusterName(uuid: string) {
    return this.getClusterNameDataLoader.load(uuid)
  }

  _getClusterName = async (uuids: string[]) => {
    const genZql = (uuid: string) => {
      return {
        tableName: 'Cluster',
        fields: ['name'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'vmInstance',
                fields: ['clusterUuid'],
                condition: {
                  uuid: {
                    [ZOp.eq]: uuid
                  }
                }
              }
            }
          }
        },
        namedAs: uuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(it => genZql(it)))
    const { results = [] } = await this.zqlService.call(zql)

    const clusterMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0', 'name'], '')
        return obj
      },
      {}
    )

    return uuids.map(uuid => clusterMap[uuid] ?? {})
  }

  getVmInstanceList(uuid) {
    return this.getVmInstanceListDataLoader.load(uuid)
  }

  _getVmInstanceList = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'VmInstance',
      fields: ['uuid', 'name', 'state', 'clusterUuid'],
      condition: {
        type: 'UserVm',
        'cluster.uuid': {
          [ZOp.in]: uuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const vmInventories = results?.[0]?.inventories ?? []
    return uuids.map(uuid => vmInventories.filter(cv => cv?.clusterUuid === uuid))
  }

  getHostList(clusterUuid: string, conditions: IQueryAction['conditions']) {
    this._getHostListQueryArgs = {
      conditions
    }
    return this.getHostListDataLoader.load(clusterUuid)
  }

  _getHostList = async (uuids: string[]) => {
    const { conditions } = this._getHostListQueryArgs

    const zqlCondition = QueryConditionTranslator.translate(conditions, {
      'cluster.uuid': {
        [ZOp.in]: uuids
      }
    })

    const zqlObject = {
      tableName: 'Host',
      fields: ['uuid', 'name', 'clusterUuid', 'state', 'managementIp'],
      condition: zqlCondition
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const vmInventories = results?.[0]?.inventories ?? []
    return uuids.map(uuid => vmInventories.filter(cv => cv?.clusterUuid === uuid))
  }

  getPrimaryStorageList(uuid) {
    return this.getPrimaryStorageListDataLoader.load(uuid)
  }

  _getPrimaryStorageList = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'PrimaryStorage',
      condition: {
        'cluster.uuid': {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const primaryStorageMap = _.reduce(
      uuids,
      (obj, clusterUuid) => {
        if (!obj[clusterUuid]) {
          obj[clusterUuid] = []
        }
        return obj
      },
      {} as any
    )

    await Promise.all(
      Object.keys(primaryStorageMap).map(async clusterUuid => {
        const clusterPromises = inventories
          .filter(primaryStorage => primaryStorage.attachedClusterUuids.includes(clusterUuid))
          .map(async primaryStorage => {
            const primaryStorageCapacity =
              await this.capacityCalculationQueryService.getPrimaryStorageCapacity({
                primaryStorageUuids: [primaryStorage.uuid]
              })

            primaryStorageMap[clusterUuid].push({
              ...primaryStorage,
              primaryStorageCapacity
            })
          })

        await Promise.all(clusterPromises)
      })
    )

    return uuids.map(it => primaryStorageMap[it])
  }

  async queryDRSVmMigrationActivityList(params: QueryClusterArgs): Promise<QueryDRSAdviceResp> {
    const { type = ClusterQueryType.Normal } = params
    let _extrazqlConditions

    const finalConditions: ICondition[] = []
    switch (type) {
      case ClusterQueryType.Normal:
        break
      default:
        break
    }

    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(
      params.conditions,
      ['vm']
    )

    if (_extraConditionMap['vm']) {
      const vmName = _extraConditionMap['vm'].value
      const { inventories: vms } = await this.queryVmInstanceAction.call({
        conditions: [
          {
            key: 'name',
            op: Op.like,
            value: vmName
          }
        ]
      })
      _conditions.push({
        key: 'vmUuid',
        op: Op.in,
        values: vms.map(it => it.uuid)
      })
    }

    const _zqlCondition = QueryConditionTranslator.translate(
      _conditions.concat(finalConditions),
      specicalCondition
    )

    const zqlCondition = _extrazqlConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _extrazqlConditions
          )
        }
      : _zqlCondition

    return await this.getDRSVmMigrationActivityList(params, zqlCondition)
  }

  async getDRSVmMigrationActivityList(
    param: IQueryAction,
    zqlCondition: ZqlObject['condition']
  ): Promise<QueryDRSAdviceResp> {
    const zqlObject = {
      tableName: 'DRSVmMigrationActivity',
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
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list,
      total
    }
  }

  async getResourceCpuMode(uuid: string) {
    const zqlObject = {
      tableName: 'ResourceConfig',
      condition: {
        name: 'vm.cpuMode',
        category: 'kvm',
        resourceUuid: uuid
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    return { cpuMode: results?.[0]?.inventories?.[0]?.value || '' }
  }

  getDrsSchedulingInterval(uuid: string) {
    return this.drsSchedulingIntervalDataLoader.load(uuid)
  }

  _getDrsSchedulingInterval = async (uuids: string[]) => {
    const zqlCondition = [
      {
        tableName: 'GlobalConfig', // 全局配置
        condition: {
          name: 'drs.schedulingInterval',
          category: 'drs'
        },
        fields: ['value']
      },
      {
        tableName: 'ResourceConfig', // 资源配置，如果资源没有被设过，则该数据库表中是没有数据的。
        condition: {
          resourceType: 'ClusterVO',
          resourceUuid: {
            [Op.in]: uuids
          },
          name: 'drs.schedulingInterval',
          category: 'drs'
        },
        fields: ['value', 'resourceUuid']
      }
    ]

    const zql = ZQL.multStringify(zqlCondition)

    const resp = await this.zqlService.call(zql)

    const globalDrsSchedulingInterval = _.get(resp, ['results', '0', 'inventories', '0', 'value'])

    const resourceConfigMap = _.reduce(
      _.get(resp, ['results', '1', 'inventories'], []),
      (obj, rsConfig) => {
        obj[rsConfig.resourceUuid] = rsConfig

        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      const resourceConfig = _.get(resourceConfigMap, uuid, null)

      if (resourceConfig) {
        return resourceConfig.value
      }

      return globalDrsSchedulingInterval
    })
  }

  resourceConfigValue(clusterUuid: string) {
    return this.resourceConfigValueDataLoader.load(clusterUuid)
  }

  private _resourceConfigValue = async (clusterUuids: string[]) => {
    try {
      const resourceConfigList = [
        {
          category: 'host',
          name: 'cpu.overProvisioning.ratio'
        },
        {
          category: 'mevoco',
          name: 'overProvisioning.memory'
        },
        {
          category: 'kvm',
          name: 'ignoreMsrs'
        },
        {
          category: 'premiumCluster',
          name: 'enable.zeroCopy'
        },
        {
          category: 'kvm',
          name: 'reservedMemory'
        },
        {
          category: 'premiumCluster',
          name: 'hugepage.enable'
        },
        {
          category: 'vm',
          name: 'emulateHyperV'
        },
        {
          category: 'vm',
          name: 'videoType'
        },
        {
          category: 'kvm',
          name: 'auto.set.vm.nic.multiqueue'
        },
        {
          category: 'drs',
          name: 'drs.migrateVm.concurrent'
        },
        {
          category: 'drs',
          name: 'drs.schedulingInterval'
        },
        {
          category: 'ha',
          name: 'vm.ha.level'
        },
        {
          category: 'vm',
          name: 'vm.ha.across.clusters'
        }
      ]

      /**
       * 1，集群如果没有资源配置则一定是参考全局配置
       * 2，第一句话很重要，如果你没看懂，请不要动！！！
       * 3，其他资源不可参考第一句话的思路！！！
       *
       */
      const zqlCondition = [
        {
          tableName: 'ResourceConfig', // 资源配置，如果资源没有被设过，则该数据库表中是没有数据的。
          condition: {
            resourceType: 'ClusterVO',
            resourceUuid: {
              [Op.in]: clusterUuids
            },
            [ZOp.or]: _.map(resourceConfigList, it => ({
              [ZOp.and]: [it]
            }))
          }
        },
        {
          tableName: 'GlobalConfig', // 全局配置
          condition: {
            [ZOp.or]: _.map(resourceConfigList, it => ({
              [ZOp.and]: [it]
            }))
          }
        }
      ]

      const zql = ZQL.multStringify(zqlCondition)

      const { results = [] } = await this.zqlService.call(zql)

      const resourceConfigs = _.get(results, ['0', 'inventories'], [])
      const globalConfigs = _.get(results, ['1', 'inventories'], [])

      const globalConfigMap = _.reduce(
        globalConfigs,
        (obj, it) => {
          const category = it?.category
          const name = _.chain(it?.name).split('.').map(_.upperFirst).join('').value()

          const _key = `${category}${name}`

          obj[_key] = it?.value

          return obj
        },
        {}
      )

      const resourceConfigMap = _.reduce(
        resourceConfigs,
        (obj, it) => {
          const category = it?.category
          const name = _.chain(it?.name).split('.').map(_.upperFirst).join('').value()

          const _key = `${category}${name}`
          const resourceUuid = it?.resourceUuid

          if (!obj[resourceUuid]) {
            obj[resourceUuid] = {}
          }

          obj[resourceUuid][_key] = it?.value

          return obj
        },
        {}
      )

      return clusterUuids.map(clusterUuid =>
        _.assign(globalConfigMap, _.get(resourceConfigMap, clusterUuid, globalConfigMap))
      )
    } catch (e) {
      console.log(e)

      return []
    }
  }
}

export interface GetCpuMemoryCapacityActionParam {
  zoneUuids?: any[]
  clusterUuids?: any[]
  hostUuids?: any[]
  hypervisorType?: string
}

export interface GetCandidateZonesClustersHostsForCreatingVmActionParam {
  instanceOfferingUuid?: string
  imageUuid: string
  l3NetworkUuids: any[]
  rootDiskOfferingUuid?: string
  dataDiskOfferingUuids?: any[]
  cpuNum?: number
  memorySize?: number
  rootDiskSize?: number
  zoneUuid?: string
  clusterUuid?: string
  defaultL3NetworkUuid?: string
  systemTags?: any[]
  userTags?: any[]
  sessionId?: any
  accessKeyId?: any
  accessKeySecret?: any
  requestIp?: any
}

export interface AttachL2NetworkToClusterActionParam {
  l2NetworkUuid: string
  clusterUuid: string
}

export interface ValidateClusterSupportDRSActionParam {
  clusterUuid: string
}

export interface QueryClusterDRSParam {
  clusterUuid: string
  [key: string]: any
}

export interface PrimaryStorageAttachableClusterParam {
  type: PrimaryStorageTypeParam
  isOpensource: boolean
  [key: string]: any
}
