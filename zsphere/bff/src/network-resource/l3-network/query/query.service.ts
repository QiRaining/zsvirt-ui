import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  concat as _concat,
  get as _get,
  groupBy as _groupBy,
  isEmpty as _isEmpty,
  pick as _pick,
  remove as _remove,
  compact,
  uniq
} from 'lodash'

import {
  Condition as ICondition,
  Op,
  QueryParam,
  conditionsToObject
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateL3NetworksForChangeVmNicNetworkAction } from '@/api/zstack/GetCandidateL3NetworksForChangeVmNicNetworkAction'
import { GetInterdependentL3NetworksBackupStoragesActionParam } from '@/api/zstack/GetInterdependentL3NetworksBackupStoragesAction'
import { GetInterdependentL3NetworksImagesActionParam } from '@/api/zstack/GetInterdependentL3NetworksImagesAction'
import { GetL3NetworkMtuAction } from '@/api/zstack/GetL3NetworkMtuAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QueryAccountResourceRefAction } from '@/api/zstack/QueryAccountResourceRefAction'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryL3NetworkAction } from '@/api/zstack/QueryL3NetworkAction'
import { QueryNetworkServiceL3NetworkRefAction } from '@/api/zstack/QueryNetworkServiceL3NetworkRefAction'
import { QueryNetworkServiceProviderAction } from '@/api/zstack/QueryNetworkServiceProviderAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { QueryVpcHaGroupAction } from '@/api/zstack/QueryVpcHaGroupAction'
import { QueryVpcRouterAction } from '@/api/zstack/QueryVpcRouterAction'
import { SystemTagInventory } from '@/api/zstack/types'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'
import { ZsvSharedResourceQueryService } from '@/zsphere-administration/owner/zsv-shared-resource-query'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'

import { L3Network, L3NetworkQueryType } from '../l3-network.model'

@Injectable()
export class QueryL3NetworkService {
  @Inject() queryL3NetworkAction: QueryL3NetworkAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() zqlService: ZQLService
  @Inject() getL3NetworkMtuAction: GetL3NetworkMtuAction

  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject()
  queryNetworkServiceL3NetworkRefAction: QueryNetworkServiceL3NetworkRefAction
  @Inject() queryAccountResourceRefAction: QueryAccountResourceRefAction
  @Inject()
  queryNetworkServiceProviderAction: QueryNetworkServiceProviderAction
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject() queryClusterAction: QueryClusterAction
  @Inject() queryVpcHaGroupAction: QueryVpcHaGroupAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() queryVpcRouterAction: QueryVpcRouterAction
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject() zsvSharedResourceQueryService: ZsvSharedResourceQueryService
  @Inject()
  getCandidateL3NetworksForChangeVmNicNetworkAction: GetCandidateL3NetworksForChangeVmNicNetworkAction

  private networkServiceProviderLoader
  private networkTypeNameLoader
  private isDefaultLoader
  private hasDefaultKernelLoader

  constructor() {
    this.networkServiceProviderLoader = new DataLoader(this._getNetworkServiceProvider)
    this.networkTypeNameLoader = new DataLoader(this._getNetworkTypeName)
    this.isDefaultLoader = new DataLoader((uuids: string[]) => this._getIsDefault(uuids))
    this.hasDefaultKernelLoader = new DataLoader(this._hasDefaultKernel)
  }

  // isCount 用于查询数量，只返回total，queryAll 用于（包括vcenter）的三层网络
  async query(param: IQueryAction, isCount = false) {
    const { type = L3NetworkQueryType.ZSTACK } = param
    let _extrazqlConditions
    let finalConditions = []
    switch (type) {
      // 创建云主机
      case L3NetworkQueryType.CreateInstance:
        //  _extrazqlConditions = this.getCandidateForCreateInstance(param.extraConditions)
        break
      // 创建云主机
      case L3NetworkQueryType.CREATE_VM_CANDIDATE:
        _extrazqlConditions = this.getCandidateForCreateVm(param.extraConditions)
        break

      // 将条件入到前端了。都是conditions可以传入的。
      case L3NetworkQueryType.CREATE_VIP_CANDIDATE:
        break
      case L3NetworkQueryType.CREATE_OVF:
        _extrazqlConditions = this.getCandidateForCreateVmFromOvf(param.extraConditions)
        break
      case L3NetworkQueryType.RecoverRootVolumeBackupCandidate:
        _extrazqlConditions = this.queryRecoverRootVolumeBackupCandidate(param)
        break
      case L3NetworkQueryType.QueryVpcNetwork:
        _extrazqlConditions = await this.queryVpcNetworkList()
        break
      case L3NetworkQueryType.CreateIPsecCandidate:
        _extrazqlConditions = await this.getCandidateForCreateIpsec(param.extraConditions)
        break
      case L3NetworkQueryType.CreateVirtualRouterOfferingManageNetwork:
        ;[finalConditions, _extrazqlConditions] =
          await this.getManageNetworkForCreateVirtualRouterOffering(param.extraConditions)
        break
      case L3NetworkQueryType.CreateVirtualRouterOfferingL3Network:
        ;[finalConditions, _extrazqlConditions] =
          await this.getL3NetworkForCreateVirtualRouterOffering(param.extraConditions)
        break
      case L3NetworkQueryType.OspfAddVpcRouterCandidate:
        ;[finalConditions, _extrazqlConditions] = await this.getOspfAddVpcRouterCandidate(
          param.extraConditions
        )
        break
      case L3NetworkQueryType.NetFlowAddVpcRouterCandidate:
        _extrazqlConditions = await this.getNetFlowAddVpcRouterCandidate(param.extraConditions)
        break
      case L3NetworkQueryType.CreateAutoScalingGroupCandidate:
        _extrazqlConditions = await this.getCandidateForCreateAutoScalingGroup(
          param.extraConditions
        )
        break
      case L3NetworkQueryType.VpcFirewallBindL3Network:
        _extrazqlConditions = await this.getCandidateForVpcFirewallBindL3Network(
          param.extraConditions
        )
        break
      case L3NetworkQueryType.Shared_Resource_Flat_Network:
        finalConditions = this.queryFlatNetworkList()
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO'
        )
        break

      case L3NetworkQueryType.ZSV_Shared_Resource_Flat_Network:
        finalConditions = [{ key: 'category', op: Op.eq, value: 'Private' }]
        _extrazqlConditions = await this.zsvSharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO'
        )
        break

      case L3NetworkQueryType.ZSV_NOT_Shared_Resource_Flat_Network:
        finalConditions = [{ key: 'category', op: Op.eq, value: 'Private' }]
        _extrazqlConditions = await this.zsvSharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO',
          false
        )
        break

      case L3NetworkQueryType.IpsecConnectionLocalCidrAttachCandidate:
        _extrazqlConditions = await this.queryIpsecConnectionLocalCidrAttachCandidate(param)
        break

      case L3NetworkQueryType.Shared_Resource_Public_Network:
        finalConditions = [{ key: 'category', op: Op.eq, value: 'Public' }]
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO'
        )
        break

      case L3NetworkQueryType.Shared_Resource_VPC_Network:
        finalConditions = [
          {
            key: 'type',
            op: Op.eq,
            value: 'L3VpcNetwork'
          }
        ]
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO'
        )
        break

      case L3NetworkQueryType.Mine_Resource_Network:
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO',
          false
        )
        break

      case L3NetworkQueryType.Shared_Resource_Network:
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'L3NetworkVO'
        )
        break

      case L3NetworkQueryType.SetIPAddress:
        _extrazqlConditions = await this.getSetIpAddressCandidate(param.extraConditions)
        break
      default:
        break
    }

    switch (type) {
      case L3NetworkQueryType.AttachVmNicCandiate:
        _extrazqlConditions = this.getAttachVmNicCandiate(param.extraConditions)
        break
    }

    const specialCondition = []
    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'L3NetworkVO',
      conditions: param.conditions
    })
    if (resourceAttributeZqlCondition) {
      specialCondition.push(resourceAttributeZqlCondition)
    }

    const zqlCondition = this.buildZqlCondition(
      param.conditions.concat(finalConditions),
      compact(specialCondition.concat([_extrazqlConditions]))
    )

    const zqlObject: ZqlObject = {
      tableName: 'L3Network',
      condition: zqlCondition,
      orderBy: param.sortBy ?? 'createDate',
      orderDirection: param.sortDirection ?? 'asc',
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    if (isCount) {
      zqlObject.action = ZQLAction.COUNT
    }

    zqlObject.condition = this.addZStackZqlCondition(zqlObject.condition, param.extraConditions)

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    const { inventories = [], total = 0 } = resp?.results?.[0] || {}

    if (isCount) {
      return { total }
    }

    const systemMap = await this.getSystemTags(inventories.map(item => item.uuid))
    const l3List = inventories.map(item => {
      const systemItem = systemMap[item.uuid] || {}
      return {
        ...systemItem,
        ...item
      }
    })

    return {
      list: l3List,
      total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []
    // 按照所有者名称搜索资源——UI端通过conditions传数据
    const extraConditions = _remove(conditions, condition =>
      [
        'defaultFilter',
        'ownerName',
        'toPublic',
        'vCenter',
        'dhcp.service',
        'ip.allocation.strategy',
        'clusterUuid',
        'hostUuid',
        'ipVersion'
      ].includes(condition.key)
    )
    const conditionsMap = conditionsToObject(extraConditions) as {
      defaultFilter?: string // ALL, IS_DEFAULT, NOT_DEFAULT
      ownerName?: string
      toPublic?: string[]
      vCenter?: string
      hostUuid?: string
      ipVersion?: number
    }

    if (conditionsMap.defaultFilter && conditionsMap.defaultFilter !== 'ALL') {
      const op = conditionsMap.defaultFilter === 'NOT_DEFAULT' ? ZOp.notIn : ZOp.in
      specicalCondition.push({
        uuid: {
          [op]: {
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
      })
    }

    if (conditionsMap['ip.allocation.strategy']) {
      const strategyList = conditionsMap['ip.allocation.strategy']
      const allocationStrategy = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ResourceConfig.resourceUuid',
              condition: {
                category: 'l3Network',
                name: 'ipAllocateStrategy',
                value: {
                  [ZOp.in]: strategyList
                }
              }
            }
          }
        }
      }
      let strategyCondition: any = allocationStrategy
      if (strategyList.includes('RandomIpAllocatorStrategy')) {
        strategyCondition = {
          [ZOp.or]: [
            allocationStrategy,
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'ResourceConfig.resourceUuid',
                    category: 'l3Network',
                    name: 'ipAllocateStrategy'
                  }
                }
              }
            }
          ]
        }
      }
      specicalCondition.push(strategyCondition)
    }

    if (conditionsMap['dhcp.service']) {
      if (conditionsMap['dhcp.service'].length === 1) {
        const dhcpService = conditionsMap['dhcp.service'][0] === 'open'
        if (dhcpService) {
          specicalCondition.push({
            'networkServices.networkServiceType': 'DHCP'
          })
        } else {
          specicalCondition.push({
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'NetworkServiceL3NetworkRef.l3NetworkUuid',
                  condition: {
                    networkServiceType: 'DHCP'
                  }
                }
              }
            }
          })
        }
      }
    }

    if (conditionsMap.toPublic) {
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(conditionsMap.toPublic, 'L3NetworkVO')
      )
    }

    if (conditionsMap['clusterUuid']) {
      specicalCondition.push({
        l2NetworkUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'L2NetworkClusterRef',
              fields: ['l2NetworkUuid'],
              condition: {
                clusterUuid: conditionsMap['clusterUuid']
              }
            }
          }
        }
      })
    }

    if (conditionsMap['hostUuid']) {
      specicalCondition.push({
        l2NetworkUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'L2PortGroupNetwork',
              fields: ['uuid'],
              condition: {
                vSwitchUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2NetworkHostRef',
                      fields: ['l2NetworkUuid'],
                      condition: {
                        hostUuid: conditionsMap['hostUuid']
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

    // ipv4 | ipv6
    if (conditionsMap['ipVersion']) {
      specicalCondition.push({
        [ZOp.or]: [
          {
            'ipRange.ipVersion': conditionsMap['ipVersion']
          },
          {
            enableIPAM: false
          }
        ]
      })
    }

    const translateConditions = extrazqlConditions
      ? specicalCondition.concat(extrazqlConditions)
      : specicalCondition
    const zqlCondition = QueryConditionTranslator.translate(conditions, translateConditions)

    return zqlCondition
  }

  getAttachVmNicCandiate = extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      vmInstanceUuid: string
      isVpcNetwork?: boolean
    }

    if (conditionsMap.isVpcNetwork) {
      return {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmNic.l3NetworkUuid',
              condition: {
                vmInstanceUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'VpcRouterVm.uuid',
                      condition: {
                        'vmNics.l3Network.uuid': {
                          [ZOp.in]: `getapi(api='GetVmAttachableL3Network',output='inventories.uuid',vmInstanceUuid='${conditionsMap?.vmInstanceUuid}')`
                        },
                        applianceVmType: 'vpcvrouter',
                        state: 'Running'
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

    const zqlCondition = {
      uuid: {
        [ZOp.in]: `getapi(api='GetVmAttachableL3Network',output='inventories.uuid',vmInstanceUuid='${conditionsMap?.vmInstanceUuid}')`
      }
    }
    return zqlCondition
  }

  getCandidateForVpcFirewallBindL3Network = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      vpcUuid: string
      vpcFirewallUuid: string
    }
    const resp = await this.queryVpcRouterAction.call({
      conditions: [
        {
          key: 'uuid',
          value: conditionsMap.vpcUuid
        }
      ]
    })
    const item = resp.inventories[0]
    if (!item) {
      return undefined
    }
    const uuidList = resp.inventories[0].vmNics.map(item => item.l3NetworkUuid)
    const zqlCondition = {
      uuid: {
        [ZOp.in]: uuidList
      }
    }

    return zqlCondition
  }

  queryIpsecConnectionLocalCidrAttachCandidate = params => {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions) as any
    const ipsecConnectionUuid = conditionsMap?.ipsecConnectionUuid

    const zqlCondition = {
      uuid: {
        [ZOp.in]: `getapi(api='GetCandidateL3NetworksForIpSecConnection',output='inventories.uuid',uuid='${ipsecConnectionUuid}')`
      }
    }
    return zqlCondition
  }
  queryFlatNetworkList = () => {
    const conditions: ICondition[] = [
      // {
      //   key: 'networkServices.networkServiceType',
      //   op: Op.notHas,
      //   values: ['SNAT']
      // },
      // {
      //   key: 'networkServices.serviceProvider.type',
      //   value: 'Flat'
      // },
      {
        key: 'system',
        value: 'false'
      },
      {
        key: 'category',
        op: Op.eq,
        value: 'Private'
      }
    ]
    return conditions
  }
  queryCluster = condition => {
    const conditionsMap: any = conditionsToObject(condition)
    return {
      'l2Network.cluster.uuid': {
        [ZOp.eq]: conditionsMap?.clusterUuid
      }
    }
  }

  getCandidateForCreateVm = extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['imageUuid', 'zoneUuid']
    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetInterdependentL3NetworksImagesActionParam

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetInterdependentL3NetworksImages',
            output: 'inventories.uuid',
            condition: {
              imageUuid: candidateParams?.imageUuid,
              zoneUuid: candidateParams?.zoneUuid
            }
          }
        }
      }
    }

    return candidateParams?.imageUuid ? zqlCondition : null
  }

  getCandidateForCreateVmFromOvf = extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['backupStorageUuid', 'zoneUuid']
    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetInterdependentL3NetworksBackupStoragesActionParam

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetInterdependentL3NetworksBackupStorages',
            output: 'inventories.uuid',
            condition: {
              backupStorageUuid: candidateParams?.backupStorageUuid,
              zoneUuid: candidateParams?.zoneUuid
            }
          }
        }
      }
    }

    return candidateParams?.backupStorageUuid ? zqlCondition : null
  }

  getCandidateForCreateIpsec = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions)
    const l3NetworkUuid = conditionsMap['l3NetworkUuid']
    const vipUuid = conditionsMap['vipUuid'] ?? ''

    const condition = {
      publicL3Uuid: l3NetworkUuid
    }
    if (vipUuid) {
      condition['vipUuid'] = vipUuid
    }

    const zqlGetApi = {
      [ZOp.getapi]: {
        action: ZQLAction.GET_API,
        api: 'GetCandidateL3NetworksForIpSecConnection',
        output: 'inventories.uuid',
        condition
      }
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: zqlGetApi
      }
    }

    return zqlCondition
  }
  getCandidateForCreateIpsec1 = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions)

    // 已经选择的本地子网uuid
    let l3NetworkUuids = conditionsMap['l3NetworkUuids'] ?? []
    const zoneUuid = conditionsMap['zoneUuid']
    const vipUuid = conditionsMap['vipUuid']
    let isSNATVIp = false
    if (vipUuid) {
      const vipZqlObject: ZqlObject = {
        tableName: 'vip',
        condition: {
          uuid: vipUuid
        }
      }
      const { results: [{ inventories: [vip] = [] } = {}] = [] } = ({} = await this.zqlService.call(
        ZQL.stringify(vipZqlObject)
      ))
      isSNATVIp = vip.useFor && vip.useFor === 'SNAT'

      l3NetworkUuids = vip.peerL3NetworkUuids ?? l3NetworkUuids
      l3NetworkUuids = [...l3NetworkUuids, vip.l3NetworkUuid]
    }

    const virtualRouterUuidListObj: ZqlObject = {
      tableName: 'VirtualRouterVm',
      condition: {
        zoneUuid,
        ['vmNics.l3NetworkUuid']: {
          [ZOp.in]: l3NetworkUuids
        },
        haStatus: {
          [ZOp.ne]: 'Backup'
        }
      }
    }

    let { results: [{ inventories: virtualRouterList = [] } = {}] = [] } = ({} =
      await this.zqlService.call(ZQL.stringify(virtualRouterUuidListObj)))

    if (isSNATVIp) {
      virtualRouterList = virtualRouterList.filter(item =>
        item.virtualRouterVips.some(uuid => uuid === vipUuid)
      )
    }

    const vRouterUuidList = virtualRouterList.map(item => item.uuid)

    const privateL3ListObject: ZqlObject = {
      tableName: 'L3Network',
      fields: ['uuid'],
      condition: {
        category: 'Private',
        'vmNic.vmInstanceUuid': {
          [ZOp.in]: vRouterUuidList
        },
        ipVersion: {
          [ZOp.in]: ['4', '6']
        }
      }
    }

    const { results: [{ inventories: privateL3List = [] } = {}] = [] } = ({} =
      await this.zqlService.call(ZQL.stringify(privateL3ListObject)))

    const zqlCondition = {
      uuid: { [ZOp.in]: privateL3List.map(({ uuid }) => uuid) }
    }

    return zqlCondition
  }

  getCandidateForCreateAutoScalingGroup = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      listenerUuid: string
    }

    let zqlCondition
    if (conditionsMap.listenerUuid) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: `getapi(api='GetCandidateL3NetworksForLoadBalancer',output='inventories.uuid',listenerUuid='${conditionsMap.listenerUuid}')`
        }
      }
    }

    return zqlCondition
  }

  getNetFlowAddVpcRouterCandidate = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      vpcVRouterUuid: string
    }
    let haGroupUuid
    const groupResp = await this.queryVpcHaGroupAction.call({
      conditions: [
        {
          key: 'vrRefs.uuid',
          value: conditionsMap.vpcVRouterUuid
        }
      ]
    })
    if (groupResp.inventories.length === 1) {
      haGroupUuid = groupResp.inventories[0].uuid
    }
    const refUuid = haGroupUuid || conditionsMap.vpcVRouterUuid

    const attachedNetworkList = {
      [ZOp.query]: {
        tableName: 'NetworkRouterFlowMeterRef.l3NetworkUuid', //queryVRouterFlowMeterNetworkAction
        condition: {
          ['vRouter.uuid']: refUuid
        }
      }
    }

    const l3NetworkUuidList = {
      [ZOp.query]: {
        tableName: 'l3network.uuid',
        condition: {
          ['vmNic.vmInstanceUuid']: conditionsMap.vpcVRouterUuid,
          uuid: {
            [ZOp.notIn]: attachedNetworkList
          }
        }
      }
    }

    return {
      uuid: {
        [ZOp.in]: l3NetworkUuidList
      }
    }
  }

  getSetIpAddressCandidate = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      vmNicUuids: string[]
      l3NetworkUuids: string[]
    }

    const tasks = conditionsMap.vmNicUuids?.map(vmNicUuid =>
      this.getCandidateL3NetworksForChangeVmNicNetworkAction.call({
        vmNicUuid
      })
    )

    const results = await Promise.all(tasks)

    const l3NetworkUuids = results.reduce((prev, curr) => {
      const uuids = curr?.inventories?.map?.(item => item?.uuid) ?? []

      return [...prev, ...uuids]
    }, conditionsMap.l3NetworkUuids ?? [])

    return {
      uuid: {
        [ZOp.in]: l3NetworkUuids
      }
    }
  }

  getOspfAddVpcRouterCandidate = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      vpcVRouterUuid: string
    }
    let haGroupUuid
    const groupResp = await this.queryVpcHaGroupAction.call({
      conditions: [
        {
          key: 'vrRefs.uuid',
          value: conditionsMap.vpcVRouterUuid
        }
      ]
    })
    if (groupResp.inventories.length === 1) {
      haGroupUuid = groupResp.inventories[0].uuid
    }
    const refUuid = haGroupUuid || conditionsMap.vpcVRouterUuid

    const attachedNetworkList = {
      [ZOp.query]: {
        tableName: 'NetworkRouterAreaRef.l3NetworkUuid', //queryVRouterOspfNetworkAction
        condition: {
          vRouterUuid: refUuid
        }
      }
    }

    const l3NetworkUuidList = {
      [ZOp.query]: {
        tableName: 'l3network.uuid',
        condition: {
          ['vmNic.vmInstanceUuid']: conditionsMap.vpcVRouterUuid,
          uuid: {
            [ZOp.notIn]: attachedNetworkList
          }
        }
      }
    }

    const vmResp = await this.queryVmInstanceAction.call({
      conditions: [
        {
          key: 'uuid',
          value: conditionsMap.vpcVRouterUuid
        }
      ]
    })
    const { managementNetworkUuid } = vmResp.inventories?.[0] || {}

    const finalConditions = []
    if (managementNetworkUuid) {
      const managementNetworkRes = await this.queryL3NetworkAction.call({
        conditions: [
          {
            key: 'uuid',
            value: managementNetworkUuid
          }
        ]
      })

      const managementNetwork = managementNetworkRes?.inventories?.[0]

      if (!(managementNetwork && managementNetwork.category === 'Public')) {
        finalConditions.push({
          key: 'uuid',
          op: Op.ne,
          value: managementNetworkUuid
        })
      }
    }
    const zqlCondition = {
      uuid: {
        [ZOp.in]: l3NetworkUuidList
      }
    }
    return [finalConditions, zqlCondition] as [any[], any]
  }

  getManageNetworkForCreateVirtualRouterOffering = async extraConditions => {
    const conditionsMap = conditionsToObject(extraConditions) as {
      format: string
      zoneUuid: string
      imageUuid: string
    }
    const finalConditions = []
    finalConditions.push(
      // 管理网络支持双栈公网
      // {
      //   key: 'ipVersion',
      //   value: '4'
      // },
      {
        key: '__systemTag__',
        op: Op.ne,
        value: 'mirrorNetwork'
      },
      {
        key: 'category',
        op: Op.in,
        values: ['Public', 'System']
      }
    )

    let zqlCondition

    if (conditionsMap.format === 'vmtx') {
      const vCenterNetworkUuidList = this.getVCenterNetworkUuidList(conditionsMap.zoneUuid)
      const vCenterNetworkUuidListCondition = {
        uuid: {
          [ZOp.in]: vCenterNetworkUuidList
        }
      }

      const vCenterClusterUuidList = this.getVCenterClusterUuidList(conditionsMap.imageUuid)

      const vCenterClusterUuidListCondition = {
        ['l2Network.cluster.uuid']: {
          [ZOp.in]: vCenterClusterUuidList
        }
      }
      zqlCondition = {
        ...vCenterNetworkUuidListCondition,
        ...vCenterClusterUuidListCondition
      }
    } else {
      const resp1 = await this.queryBackupStorageAction.call({
        conditions: [
          {
            key: 'image.uuid',
            value: conditionsMap.imageUuid
          }
        ]
      })
      const backupStorageList = resp1.inventories
      const bsType = backupStorageList?.[0]?.type
      if (bsType === 'Ceph') {
        const clusterUuidList = await this.getClusterUuidList(backupStorageList)
        finalConditions.push({
          key: 'l2Network.cluster.uuid',
          op: Op.in,
          values: clusterUuidList
        })
      }
      finalConditions.push(
        {
          key: 'zoneUuid',
          value: conditionsMap.zoneUuid
        },
        {
          key: 'l2Network.cluster.type',
          value: 'zstack'
        }
      )
    }
    return [finalConditions, zqlCondition]
  }

  getL3NetworkForCreateVirtualRouterOffering = async extraConditions => {
    const finalConditions = []
    const conditionsMap = conditionsToObject(extraConditions) as {
      format: string
      zoneUuid: string
      imageUuid: string
    }

    let zqlCondition
    if (conditionsMap.format === 'vmtx') {
      const vCenterNetworkUuidList = await this.getVCenterNetworkUuidList(conditionsMap.zoneUuid)
      const vCenterNetworkUuidListCondition = {
        uuid: {
          [ZOp.in]: vCenterNetworkUuidList
        }
      }

      const vCenterClusterUuidList = await this.getVCenterClusterUuidList(conditionsMap.imageUuid)
      const vCenterClusterUuidListCondition = {
        ['l2Network.cluster.uuid']: {
          [ZOp.in]: vCenterClusterUuidList
        }
      }
      zqlCondition = {
        ...vCenterNetworkUuidListCondition,
        ...vCenterClusterUuidListCondition
      }

      finalConditions.push({
        key: 'category',
        value: 'Public'
      })
    } else {
      const resp1 = await this.queryBackupStorageAction.call({
        conditions: [
          {
            key: 'image.uuid',
            value: conditionsMap.imageUuid
          }
        ]
      })
      const backupStorageList = resp1.inventories
      const bsType = backupStorageList[0].type
      if (bsType === 'Ceph') {
        const clusterUuidList = await this.getClusterUuidList(backupStorageList)
        finalConditions.push({
          key: 'l2Network.cluster.uuid',
          op: Op.in,
          values: clusterUuidList
        })
      }
      finalConditions.push(
        {
          key: 'zoneUuid',
          value: conditionsMap.zoneUuid
        },
        {
          key: 'l2Network.cluster.type',
          value: 'zstack'
        },
        {
          key: 'category',
          value: 'Public'
        }
      )
    }
    return [finalConditions, zqlCondition]
  }

  getVCenterNetworkUuidList = zoneUuid => {
    const vCenterNetworkUuidList = {
      [ZOp.query]: {
        tableName: 'L3Network.uuid',
        condition: {
          ['l2Network.cluster.type']: 'vmware',
          ['zone.uuid']: zoneUuid
        }
      }
    }
    return vCenterNetworkUuidList
  }

  getVCenterClusterUuidList = imageUuid => {
    const vCenterUuidList = {
      [ZOp.query]: {
        tableName: 'VCenterBackupStorage.vCenterUuid',
        condition: {
          ['image.uuid']: imageUuid
        }
      }
    }

    const vCenterClusterUuidList = {
      [ZOp.query]: {
        tableName: 'VCenterCluster.uuid',
        condition: {
          vCenterUuid: {
            [ZOp.in]: vCenterUuidList
          }
        }
      }
    }

    return vCenterClusterUuidList
  }

  getClusterUuidList = async backupStorageList => {
    const backupStorageUuidList = backupStorageList.map(it => it.uuid)
    const resp2 = await this.queryPrimaryStorageAction.call({
      conditions: [
        {
          key: 'cluster.zone.backupStorage.uuid',
          op: Op.in,
          values: backupStorageUuidList
        },
        {
          key: 'type',
          value: 'Ceph'
        }
      ]
    })
    const cephPrimaryStorageList = resp2.inventories

    let primaryStorageUuid = ''
    cephPrimaryStorageList.forEach(item => {
      if (item.fsid === backupStorageList?.[0]?.fsid) {
        primaryStorageUuid = item.uuid
      }
    })
    let clusterUuidList = []
    if (primaryStorageUuid !== '') {
      const clusterList = await this.queryClusterAction.call({
        conditions: [
          {
            key: 'primaryStorage.uuid',
            value: primaryStorageUuid
          }
        ]
      })
      clusterUuidList = clusterList.inventories.map(item => item.uuid)
    }
    return clusterUuidList
  }

  notInVCenterUuidListObj = {
    [ZOp.notIn]: {
      [ZOp.query]: {
        tableName: 'L3Network.uuid',
        condition: {
          ['l2Network.cluster.type']: 'vmware'
        }
      }
    }
  }

  queryRecoverRootVolumeBackupCandidate = param => {
    /**
     *       }
          let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid!?=${self.l3NetworkUuidList}`]
          let categories = ['Private', 'Public']
          rpc.query('l3-networks', {q: [`category?=${categories}`, `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]}).then(resp => {
            if (resp.inventories.length > 0) {
              let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid)
              conditions.push(`uuid?=${uuidList}`)
            } else if (resp.inventories.length === 0) {
              conditions.push(`uuid?=${[]}`)
            }
            self.openSideWindowForCreate('PrivateAndPublicL3NetworkMultiSelectListDlg', {
              conditions,
              select: add
            })
          })
        },
     */
    const zoneUuid = (conditionsToObject(param.extraConditions) as any)?.zoneUuid
    const type = (conditionsToObject(param.conditions) as any)?.type

    const baseCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'L3Network',
            fields: ['uuid'],
            condition: {
              category: {
                [ZOp.in]: ['Private', 'Public']
              },
              zoneUuid
            }
          }
        }
      }
    }
    if (type === 'L3VpcNetwork') {
      /**
       *   this.zql = `uuid in (query vmNic.l3NetworkUuid where vmInstanceUuid in (query vmInstance.uuid where type='ApplianceVm' and state='Running'))`
       */

      return {
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'vmNic',
                  fields: ['l3NetworkUuid'],
                  condition: {
                    vmInstanceUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'vmInstance',
                          fields: ['uuid'],
                          condition: {
                            type: 'ApplianceVm',
                            state: 'Running'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          baseCondition
        ]
      }
    }

    return baseCondition
  }
  queryVpcNetworkList = async () => {
    const isAdmin = true

    let uuidList = []
    if (isAdmin) {
    } else {
      const myUuidList = []
      const { inventories = [] } = await this.queryAccountResourceRefAction.call({
        conditions: [
          {
            key: 'resourceType',
            value: 'L3NetworkVO'
          },
          {
            key: 'accountUuid',
            value: 'unkonwn'
          }
        ]
      })
      uuidList = myUuidList.concat(inventories.map(it => it.resourceUuid))
    }
  }

  addZStackZqlCondition = (conditions: ZqlObject['condition'], extraConditions: ICondition[]) => {
    const { clusterType } = conditionsToObject(extraConditions || []) as {
      clusterType?: string
    }

    // 没有查询条件直接返回
    if (!clusterType) {
      return conditions
    }

    if (Object.keys(conditions).length === 1 && Reflect.has(conditions, 'uuid')) {
      // 单个查询无须添加条件
      return conditions
    }

    const clusterTypeToNotInMap = {
      zstack: 'vmware',
      vmware: 'zstack'
    }
    const zstackCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'L3Network.uuid',
            condition: {
              ['l2Network.cluster.type']: clusterTypeToNotInMap[clusterType]
            }
          }
        }
      }
    }
    // {
    //   key: 'l2Network.cluster.type', // 会过滤掉二层网络没有挂载集群的三层  ，不能这么写
    //   op: Op.ne,
    //   value: 'vmware'
    // }

    let zqlCondition = zstackCondition as ZqlObject['condition']
    if (!_isEmpty(conditions)) {
      zqlCondition = {
        [ZOp.and]: _concat(conditions, zstackCondition)
      }
    }
    return zqlCondition
  }

  getSystemTags = async (uuids: string[]) => {
    const inventories = await this.querySystemTagByResourceUuids(uuids)
    const systemGroup = _groupBy(inventories, 'resourceUuid')
    const systemMap = {}
    uuids.forEach(uuid => {
      if (!systemGroup[uuid]) {
        systemMap[uuid] = {}
      } else {
        const tagMap = {
          virtualRouterOfferingUuid: '',
          mirrorNetwork: null
        }
        systemGroup[uuid].forEach(item => {
          const tag = item.tag.split('::')
          switch (tag[0]) {
            case 'virtualRouterOffering':
              tagMap.virtualRouterOfferingUuid = tag[1]
              break
            case 'mirrorNetwork':
              tagMap.mirrorNetwork = true
              break
            default:
              tagMap[tag[0]] = tag[1]
              break
          }
        })
        systemMap[uuid] = tagMap
      }
    })
    return systemMap
  }

  async querySystemTagByResourceUuids(
    resourceUuids: string[],
    condition?: ICondition
  ): Promise<SystemTagInventory[]> {
    const params: QueryParam = {
      conditions: [{ key: 'resourceUuid', op: Op.in, values: resourceUuids }]
    }
    condition && params.conditions.push(condition)
    const { inventories } = await this.querySystemTagAction.call(params)
    return inventories
  }

  _getNetworkServiceProvider = async uuids => {
    const { inventories } = await this.queryNetworkServiceProviderAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        }
      ]
    })
    return inventories
  }

  async getNetworkServiceProvider(uuid) {
    return this.networkServiceProviderLoader.load(uuid)
  }

  async getNetworkTypeName(l3Network, types, tags) {
    const { category, type, uuid } = l3Network
    const networkServiceType = await this.getNetworkServiceTypeName(l3Network, types)
    if (['Public', 'System'].includes(category)) {
      const systemtags = await tags.filter(tag => tag.uuid == uuid)
      if (systemtags.some(tag => tag.tag === 'mirrorNetwork')) {
        return 'Flow'
      }
      return category
    } else if (type === 'L3VpcNetwork') {
      return 'Vpc'
    } else {
      return networkServiceType
    }
  }

  _getNetworkTypeName = async l3NetworkList => {
    const serviceUuids = l3NetworkList
      .filter((l3: L3Network) => {
        return l3.networkServices.length > 0
      })
      .reduce((acc, l3Network: L3Network) => {
        return acc.concat(
          l3Network.networkServices.filter(item => item.networkServiceType !== 'SecurityGroup')
        )
      }, [])
      .map(ele => ele.networkServiceProviderUuid)
    const zql = ZQL.stringify({
      tableName: 'networkServiceProvider',
      fields: ['type', 'uuid'],
      condition: {
        uuid: {
          [ZOp.in]: serviceUuids
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const types = _get(resp, ['results', 0, 'inventories'], [])
    const tagUuids = l3NetworkList
      .filter((l3: L3Network) => {
        const { category } = l3
        return ['Public', 'System'].includes(category)
      })
      .map((l3: L3Network) => l3.uuid)
    const tagZql = ZQL.stringify({
      tableName: 'systemTag',
      fields: ['tag', 'resourceUuid'],
      condition: {
        uuid: {
          [ZOp.in]: tagUuids
        }
      }
    })
    const tagResp = await this.zqlService.call(tagZql)
    const tags = _get(tagResp, ['results', 0, 'inventories'], [])
    return l3NetworkList.map(l3Network => this.getNetworkTypeName(l3Network, types, tags))
  }

  loadNetworkTypeName = async l3Network => {
    return this.networkTypeNameLoader.load(l3Network)
  }

  async getNetworkServiceTypeName(l3Network, types) {
    if (l3Network.networkServices.length === 0) {
      return ''
    }
    const networkServices = l3Network.networkServices.filter(
      item => item.networkServiceType !== 'SecurityGroup'
    )
    if (networkServices.length === 0) {
      return ''
    }
    let type = 'Flat'

    networkServices.map(service => {
      const _type = types.find(ele => {
        ele.uuid = service.networkServiceProviderUuid
      })
      if (['vrouter', 'VirtualRouter'].includes(_type)) {
        type = _type
      }
    })

    if (type === 'vrouter') {
      type = networkServices.some(item => item.networkServiceType === 'SNAT') ? 'vrouter' : 'Flat'
    }
    return type
  }

  private async _getIsDefault(uuids: string[]) {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['resourceUuid'],
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        resourceType: 'PortGroupVO',
        tag: 'portGroup::default'
      }
    })

    const resp = await this.zqlService.call(zql)
    const tagSet = new Set(resp.results?.[0]?.inventories?.map(({ resourceUuid }) => resourceUuid))
    return uuids.map(uuid => tagSet.has(uuid))
  }

  getIsDefault(uuid: string) {
    return this.isDefaultLoader.load(uuid)
  }

  async validateVlanIdForPortGroup(vlanId: string, vSwitchUuid: string) {
    const vlanIdCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'portGroup',
      condition: {
        vlanId: Number(vlanId),
        vSwitchUuid
      }
    }

    const zql = ZQL.stringify(vlanIdCountZql)

    const { results } = await this.zqlService.call(zql)

    return { result: results[0].total === 0 }
  }

  async hasDefaultKernel(uuid: string) {
    return await this.hasDefaultKernelLoader.load(uuid)
  }

  _hasDefaultKernel = async (uuids: string[]) => {
    const { results } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'HostKernelInterface',
        fields: ['l3NetworkUuid'],
        condition: {
          l3NetworkUuid: {
            [ZOp.in]: uniq(uuids)
          },
          __systemTag__: 'zskernel::default'
        }
      })
    )
    const defaultUuids = new Set(results?.[0]?.inventories?.map(item => item.l3NetworkUuid) ?? [])
    return uuids.map(uuid => defaultUuids.has(uuid))
  }
}
