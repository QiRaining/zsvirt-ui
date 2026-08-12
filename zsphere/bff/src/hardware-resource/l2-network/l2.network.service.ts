import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  conditionsToObject,
  Op,
  QueryParam as IQueryParam,
  QueryParam
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateNetworkInterfacesAction } from '@/api/zstack/GetCandidateNetworkInterfacesAction'
import { GetClusterHostNetworkFactsAction } from '@/api/zstack/GetClusterHostNetworkFactsAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryL2VxlanNetworkPoolAction } from '@/api/zstack/QueryL2VxlanNetworkPoolAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryZoneAction } from '@/api/zstack/QueryZoneAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction, QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import {
  L2NetworkQueryType,
  QueryL2NetworkArgs
} from '@/hardware-resource/l2-network/l2.network.model'
import { UplinkGroupType } from '@/hardware-resource/uplink-group/uplink-group.model'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'
import { ZsvSharedResourceQueryService } from '@/zsphere-administration/owner/zsv-shared-resource-query'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'

@Injectable()
export class L2NetworkService extends ActionService {
  @Inject() queryClusterAction: QueryClusterAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryZoneAction: QueryZoneAction
  @Inject() queryL2VxlanNetworkPoolAction: QueryL2VxlanNetworkPoolAction
  @Inject() zqlService: ZQLService
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject() zsvSharedResourceQueryService: ZsvSharedResourceQueryService
  @Inject() getClusterHostNetworkFactsAction: GetClusterHostNetworkFactsAction
  @Inject()
  getCandidateNetworkInterfacesAction: GetCandidateNetworkInterfacesAction

  private zoneDataLoader
  private clusterDataLoader
  private l3networkNumDataLoader
  private vxlanPoolLoader
  private systemTagDataLoader
  private isDefaultLoader
  private isUplinkBondingExistLoader

  private clusterMap: { [key: string]: string[] } = {}

  constructor() {
    super()
    this.zoneDataLoader = new DataLoader(this._getZone)
    this.vxlanPoolLoader = new DataLoader(this._getVxlanPool)
    this.clusterDataLoader = new DataLoader(this._getCluster)
    this.l3networkNumDataLoader = new DataLoader(this._getL3networkNum)
    this.systemTagDataLoader = new DataLoader(this._getSystemTag)
    this.isDefaultLoader = new DataLoader((uuids: string[]) => this._getIsDefault(uuids))
    this.isUplinkBondingExistLoader = new DataLoader(this._isUplinkBondingExist)
  }

  async queryPhysicalInterfaceListByClusterList(clusterUuids: string[]) {
    const hostZql = {
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: clusterUuids
        }
      }
    }
    const hostResp = await this.zqlService.call(ZQL.stringify(hostZql))
    const hostUuids = hostResp?.results?.[0]?.inventories?.map(it => it.uuid)
    const slaveNameResp = await this.getCandidateNetworkInterfacesAction.call({
      hostUuids
    })
    return slaveNameResp?.slaveNames
  }

  async queryPhysicalInterfaceList(clusterUuid: string, networkAccelerationMode: string) {
    const list = await this.queryPhysicalInterfaceListByClusterUuid(
      clusterUuid,
      networkAccelerationMode
    )

    return { list, total: list.length }
  }

  async queryPhysicalInterfaceListByClusterUuid(
    clusterUuid: string,
    networkAccelerationMode: string
  ) {
    const res = await this.getClusterHostNetworkFactsAction.call({
      clusterUuid
    })
    const { bondings = [], nics = [] } = res ?? {}

    const list = []
    ;(bondings as { bondingName: string; uuid: string }[]).forEach(({ bondingName: name, uuid }) =>
      list.push({
        name,
        uuid
      })
    )
    ;(
      nics as {
        interfaceName: string
        uuid: string
        offloadStatus: string
      }[]
    ).forEach(({ interfaceName: name, uuid, offloadStatus }) => {
      if (networkAccelerationMode === 'SmartNic') {
        if (offloadStatus) {
          list.push({
            name,
            uuid
          })
        }
      } else {
        list.push({
          name,
          uuid
        })
      }
    })
    return list
  }
  async query(params: QueryL2NetworkArgs) {
    const { type } = params

    const conditions = []

    let zqlObj: ZqlObject = {
      tableName: 'l2Network'
    }

    switch (type) {
      case L2NetworkQueryType.ClusterAttachableL2network:
        zqlObj = await this.getClusterAttachableL2NetworkByAction(params)
        break
      case L2NetworkQueryType.BaremetalClusterAttachableL2network:
        zqlObj = await this.getClusterAttachableL2NetworkByAction(params)
        break
      case L2NetworkQueryType.L2NetworkInZone:
        zqlObj = await this.getL2NetworkInZone(params)
        break
      case L2NetworkQueryType.AttachedVxlanNetwork:
        zqlObj = await this.getVxlanPoolAttachedVxlanNetwork(params)
        break
      case L2NetworkQueryType.CreateL3AllCandidate:
      case L2NetworkQueryType.CreateL3DefaultCandidate:
        zqlObj = await this.getL3NetworkCandidateL2Network(type, params)
        break
      case L2NetworkQueryType.SharedResource:
        const finalZqlCondition = await this.zsvSharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'L2NetworkVO'
        )

        zqlObj = {
          tableName: 'l2network',
          condition: {
            ...finalZqlCondition
          }
        }

        break
      case L2NetworkQueryType.Admin:
        zqlObj = this.getAdminCondition()
        break

      case L2NetworkQueryType.Mine:
        zqlObj = this.getMineCondition(params)
        break
      case L2NetworkQueryType.Share:
        zqlObj = this.getShareCondition(params)
        break
      case L2NetworkQueryType.ZSV_SHARED_RESOURCE:
        zqlObj = {
          tableName: 'l2network',
          condition: {
            ...this.zsvSharedResourceQueryService.getSharedResourceList(
              params.extraConditions,
              'L2NetworkVO'
            )
          }
        }
        break
      case L2NetworkQueryType.ZSV_NOT_SHARED_RESOURCE:
        zqlObj = {
          tableName: 'l2network',
          condition: {
            ...this.zsvSharedResourceQueryService.getSharedResourceList(
              params.extraConditions,
              'L2NetworkVO',
              false
            )
          }
        }

        break
    }

    const shareTypeCondition = this.spliceFilterKeyCondition(
      params,
      'shareType',
      this.getShareTypeCondition
    )
    if (shareTypeCondition) {
      conditions.push(shareTypeCondition)
    }

    const networkAccelerationModeCondition = this.spliceFilterKeyCondition(
      params,
      'networkAccelerationMode',
      this.getNetworkAccelerationModeCondition
    )
    if (networkAccelerationModeCondition) {
      conditions.push(networkAccelerationModeCondition)
    }

    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'L2NetworkVO',
      conditions: params.conditions
    })
    if (resourceAttributeZqlCondition) {
      conditions.push(resourceAttributeZqlCondition)
    }

    if (conditions.length > 0) {
      zqlObj.condition = zqlObj.condition
        ? {
            [ZOp.and]: [zqlObj.condition, ...conditions]
          }
        : conditions
    }

    zqlObj = QueryConditionTranslator.mergeQueryAction(params, zqlObj)

    const zql = ZQL.stringify(zqlObj)

    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(zql)

    return {
      list,
      total
    }
  }

  // 过滤网络加速模式
  // 普通(Normal): vSwitchType = LinuxBridge and systemTag 没有 enableSRIOV
  // SrIov: vSwitchType = LinuxBridge and systemTag 有 enableSRIOV
  // 智能网卡(SmartNic): vSwitchType = OvsDpdk
  getNetworkAccelerationModeCondition(condition: any) {
    const { values } = condition
    const vSwitchTypes = []
    values?.forEach(type => {
      if (['Normal', 'SrIov'].includes(type)) {
        vSwitchTypes.push('LinuxBridge')
      }
      if (type === 'SmartNic') {
        vSwitchTypes.push('OvsDpdk')
      }
    })
    const querySRIOVUuidCondition = {
      [ZOp.query]: {
        tableName: 'systemTag',
        fields: 'resourceUuid',
        condition: {
          [ZOp.and]: {
            tag: 'enableSRIOV',
            resourceType: 'L2NetworkVO'
          }
        }
      }
    }
    if (values?.includes('SrIov')) {
      if (values?.includes('Normal')) {
        return {
          [ZOp.or]: {
            uuid: { [ZOp.in]: querySRIOVUuidCondition },
            vSwitchType: { [ZOp.in]: vSwitchTypes }
          }
        }
      }
      return {
        [ZOp.or]: {
          [ZOp.and]: {
            uuid: { [ZOp.in]: querySRIOVUuidCondition },
            vSwitchType: 'LinuxBridge'
          },
          vSwitchType: {
            [ZOp.in]: _.remove(vSwitchTypes, cv => cv !== 'LinuxBridge')
          }
        }
      }
    }
    return {
      [ZOp.and]: {
        uuid: {
          [ZOp.notIn]: querySRIOVUuidCondition
        },
        vSwitchType: { [ZOp.in]: vSwitchTypes }
      }
    }
  }

  getShareTypeCondition(shareTypeCondition: any) {
    const { values } = shareTypeCondition

    return QueryConditionTranslator.generateShareTypeZqlConditon(values, 'L2NetworkVO')
  }

  spliceFilterKeyCondition(
    queryAction: QueryAction,
    filterKey: string,
    getFilterCondition?: (conditon: any) => any
  ) {
    const { conditions } = queryAction

    const filterCondition = _.remove(
      conditions,
      ({ key }: { key: string }) => key === filterKey
    )?.[0]
    if (!filterCondition) {
      return null
    }
    return getFilterCondition?.(filterCondition)
  }

  getMineCondition(params) {
    const { extraConditions } = params

    const conditionsMap = conditionsToObject(extraConditions)
    const accountUuid = conditionsMap['accountUuid']

    const zqlObj = {
      tableName: 'l2network',
      condition: {
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'L2Network',
                  fields: ['uuid'],
                  condition: {
                    'cluster.type': 'vmware'
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'L2NetworkVO',
                    accountUuid
                  }
                }
              }
            }
          }
        ]
      }
    }

    return zqlObj
  }

  getAdminCondition() {
    return {
      tableName: 'l2network',
      condition: {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'L2Network',
              fields: ['uuid'],
              condition: {
                'cluster.type': 'vmware'
              }
            }
          }
        }
      }
    }
  }

  getShareCondition(params) {
    const { extraConditions } = params

    const conditionsMap = conditionsToObject(extraConditions)
    const accountUuid = conditionsMap['accountUuid']

    const zqlObj = {
      tableName: 'l2network',
      condition: {
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'L2Network',
                  fields: ['uuid'],
                  condition: {
                    'cluster.type': 'vmware'
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'L2NetworkVO',
                    accountUuid
                  }
                }
              }
            }
          }
        ]
      }
    }

    return zqlObj
  }

  getEnableSRIOV = async uuid => {
    const params: IQueryAction = {
      conditions: [
        {
          key: 'resourceUuid',
          value: uuid
        },
        {
          key: 'resourceType',
          value: 'L2NetworkVO'
        },
        {
          key: 'tag',
          value: 'enableSRIOV'
        }
      ]
    }
    const { inventories } = await this.querySystemTagAction.call(params)

    return inventories?.length > 0
  }

  getSystemTag(uuid) {
    return this.systemTagDataLoader.load(uuid)
  }

  _getSystemTag = async (uuids: string[]) => {
    const paramsByChunk: QueryParam[] = _.chunk(uuids, 20).map(_uuids => ({
      conditions: [{ key: 'resourceUuid', op: Op.in, values: _uuids }],
      start: 0,
      limit: 1000
    }))

    let _systemTagList = []

    await Promise.all(
      paramsByChunk.map(params =>
        this.querySystemTagAction
          .call(params)
          .then(resp => (_systemTagList = _systemTagList.concat(resp.inventories)))
      )
    )

    const systemTagList = [..._systemTagList]
    const systemGroup = _.groupBy(systemTagList, 'resourceUuid')
    const systemMap = {}
    uuids.forEach(uuid => {
      if (!systemGroup[uuid]) {
        systemMap[uuid] = null
      } else {
        const tagMap = {
          bondingMode: undefined,
          xmitHashPolicy: undefined
        }
        systemGroup[uuid].forEach(item => {
          const tag = item.tag.split('::')
          switch (tag[0]) {
            case 'uplink':
              tagMap.bondingMode = tag[2]
              tagMap.xmitHashPolicy = tag[3]
              break
            default:
              tagMap[tag[0]] = tag[1]
              break
          }
        })
        systemMap[uuid] = tagMap
      }
    })
    return uuids.map(uuid => {
      return systemMap[uuid] ? systemMap[uuid] : null
    })
  }

  getZone(zoneUuid) {
    return this.zoneDataLoader.load(zoneUuid)
  }

  _getZone = async (uuids = []) => {
    const params: IQueryParam = {
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        }
      ]
    }
    const { inventories } = await this.queryZoneAction.call(params)
    return uuids.map(uuid => {
      return inventories.find(z => z.uuid == uuid)
    })
  }

  async getVxlanPool(uuid) {
    if (uuid) {
      return this.vxlanPoolLoader.load(uuid)
    }
    return null
  }

  _getVxlanPool = async uuids => {
    const params = {
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        }
      ]
    }

    const { inventories = [] } = await this.queryL2VxlanNetworkPoolAction.call(params)

    return uuids.map(uuid => {
      return inventories.find(inv => inv.uuid === uuid)
    })
  }

  async getClusters(uuid, clusterUuids) {
    if (!clusterUuids || clusterUuids.length == 0) {
      return null
    }
    this.clusterMap[uuid] = clusterUuids
    return this.clusterDataLoader.load(uuid)
  }

  _getCluster = async (uuids: string[]) => {
    const clusterUuids = Object.values(this.clusterMap).reduce((p, c) => [...p, ...c], [])
    const params = {
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: clusterUuids
        }
      ]
    }
    const { inventories } = await this.queryClusterAction.call(params)

    return uuids.map(uuid => {
      const clusterUuids = this.clusterMap[uuid]
      const cls = inventories.filter(inv => clusterUuids.includes(inv.uuid))
      return cls
    })
  }

  async getL3networkNum(uuid) {
    return this.l3networkNumDataLoader.load(uuid)
  }

  _getL3networkNum = async (uuids: string[]) => {
    const zql = [
      {
        tableName: 'l3network',
        action: ZQLAction.COUNT,
        conditions: {
          l2NetworkUuid: {
            [ZOp.in]: uuids
          }
        },
        groupBy: 'l2NetworkUuid'
      },
      {
        tableName: 'PortGroup',
        action: ZQLAction.COUNT,
        conditions: {
          vSwitchUuid: {
            [ZOp.in]: uuids
          }
        },
        groupBy: 'vSwitchUuid'
      }
    ]

    const resp = await this.zqlService.call(ZQL.multStringify(zql))

    const l3result = resp.results[0]
    const l2portGroup = resp.results[1]
    return uuids.map(uuid => {
      return (
        (l3result?.inventoryCounts?.find(it => it[0].l2NetworkUuid === uuid)?.[1] ?? 0) +
        (l2portGroup?.inventoryCounts?.find(it => it[0].vSwitchUuid === uuid)?.[1] ?? 0)
      )
    })
  }

  async getVxlanPoolAttachedVxlanNetwork(params: IQueryAction) {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const uuid = conditionsMap['vxlanPooUuuid']
    const param: QueryAction = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.queryL2VxlanNetworkPoolAction.call(param)
    const attachedVxlanNetwork = inventories[0]?.attachedVxlanNetworkRefs
    const uuidList = attachedVxlanNetwork.map(cv => cv.uuid)

    const zqlObj = {
      tableName: 'L2Network',
      condition: {
        uuid: {
          [ZOp.in]: uuidList
        }
      }
    }
    return zqlObj
  }
  async getL3NetworkCandidateL2Network(type: L2NetworkQueryType, params: QueryL2NetworkArgs) {
    const { isCount } = params
    const defL2: any = [
      {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'L3Network',
              fields: ['l2NetworkUuid']
            }
          }
        }
      },
      {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'L2PortGroupNetwork',
              fields: ['vSwitchUuid']
            }
          }
        }
      }
    ]

    let subQuery: any = [
      {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'L3Network',
              fields: ['l2NetworkUuid'],
              condition: {
                'l2Network.cluster.type': 'vmware'
              }
            }
          }
        }
      }
    ]

    if (type === L2NetworkQueryType.CreateL3DefaultCandidate) {
      subQuery = [...subQuery, ...defL2]
    }
    const zqlObj = {
      tableName: 'l2Network',
      action: isCount ? ZQLAction.COUNT : ZQLAction.QUERY,
      condition: {
        type: {
          [ZOp.notIn]: ['VxlanNetworkPool', 'HardwareVxlanNetworkPool']
        },
        [ZOp.and]: subQuery
      }
    }

    return zqlObj
  }

  async getL2NetworkInZone(params: IQueryAction) {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const zoneUuid = conditionsMap['zoneUuid']
    return {
      tableName: 'l2network',
      condition: {
        zoneUuid,
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'l2networkclusterRef',
              fields: ['l2NetworkUuid'],
              condition: {
                clusterUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'cluster',
                      fields: ['uuid'],
                      condition: {
                        type: 'vmware'
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

  async getClusterAttachableL2NetworkByAction(params: IQueryAction) {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const clusterUuid = conditionsMap['clusterUuid']
    return {
      tableName: 'L2Network',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetCandidateL2NetworksForAttachingCluster',
              output: 'inventories.uuid',
              condition: {
                clusterUuid
              }
            }
          }
        }
      }
    }
  }

  private async _getIsDefault(uuids: string[]) {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['resourceUuid'],
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        resourceType: 'L2VirtualSwitchNetworkVO',
        tag: 'virtualSwitch::default'
      }
    })

    const resp = await this.zqlService.call(zql)
    const tagSet = new Set(resp.results?.[0]?.inventories?.map(({ resourceUuid }) => resourceUuid))
    return uuids.map(uuid => tagSet.has(uuid))
  }

  getIsDefault(uuid: string) {
    return this.isDefaultLoader.load(uuid)
  }

  async isUplinkBondingExist(uuid: string) {
    return await this.isUplinkBondingExistLoader.load(uuid)
  }

  _isUplinkBondingExist = async (uuids: string[]) => {
    const { results } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'UplinkGroup',
        fields: ['l2NetworkUuid'],
        condition: {
          l2NetworkUuid: {
            [ZOp.in]: _.uniq(uuids)
          },
          type: UplinkGroupType.Bonding
        }
      })
    )
    const bondingL2NetworkUuids = new Set(
      results?.[0]?.inventories?.map(item => item.l2NetworkUuid) ?? []
    )
    return uuids.map(uuid => bondingL2NetworkUuids.has(uuid))
  }
}
