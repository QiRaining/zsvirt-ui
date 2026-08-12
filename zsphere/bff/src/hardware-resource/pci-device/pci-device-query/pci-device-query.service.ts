import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  QueryParam as IQueryParam,
  Op,
  conditionsToObject
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetCandidateZonesClustersHostsForCreatingVmAction,
  GetCandidateZonesClustersHostsForCreatingVmActionParam as IGetCandidateZonesClustersHostsForCreatingVmActionParam
} from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import { GetHostNetworkInterfaceLldpAction } from '@/api/zstack/GetHostNetworkInterfaceLldpAction'
import { GetMetricDataAction, GetMetricDataActionParam } from '@/api/zstack/GetMetricDataAction'
import {
  GetPciDeviceCandidatesForAttachingVmAction,
  GetPciDeviceCandidatesForAttachingVmActionParam
} from '@/api/zstack/GetPciDeviceCandidatesForAttachingVmAction'
import {
  GetPciDeviceCandidatesForNewCreateVmAction,
  GetPciDeviceCandidatesForNewCreateVmActionParam
} from '@/api/zstack/GetPciDeviceCandidatesForNewCreateVmAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryHostNetworkInterfaceAction } from '@/api/zstack/QueryHostNetworkInterfaceAction'
import { QueryMdevDeviceAction } from '@/api/zstack/QueryMdevDeviceAction'
import { QueryPciDeviceAction } from '@/api/zstack/QueryPciDeviceAction'
import { QueryPciDeviceSpecAction } from '@/api/zstack/QueryPciDeviceSpecAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction, ZQLFn } from '@/common/zql/index'
import {
  ELLDPMode,
  PciDevice as IPciDevice,
  NicState,
  QueryPhysicalNicLLDPDeviceArgs
} from '@/hardware-resource/pci-device/pci-device.model'

import { HostStatus } from '../../../common/enum'

@Injectable()
export class PciDeviceQueryService {
  @Inject() zqlService: ZQLService
  @Inject() apiQueryHostAction: QueryHostAction
  @Inject() apiQueryPciDeviceAction: QueryPciDeviceAction
  @Inject() apiQueryMdevDeviceAction: QueryMdevDeviceAction
  @Inject() apiQueryPciDeviceSpecAction: QueryPciDeviceSpecAction
  @Inject() apiQueryVmInstanceAction: QueryVmInstanceAction
  @Inject() queryHostNetworkInterfaceAction: QueryHostNetworkInterfaceAction
  @Inject()
  getPciDeviceCandidatesForNewCreateVmAction: GetPciDeviceCandidatesForNewCreateVmAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction
  @Inject()
  getPciDeviceCandidatesForAttachingVmAction: GetPciDeviceCandidatesForAttachingVmAction
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject()
  getHostNetworkInterfaceLldpAction: GetHostNetworkInterfaceLldpAction
  @Inject() queryHostAction: QueryHostAction

  private pciDeviceSpecDataLoader
  private hostDataLoader
  private vmInstanceDataLoader
  private resolvedPciDeviceInfoDataLoader
  private hostNetworkInterfaceDataLoader
  private physicalNicDeviceMaxPartNumDataLoader
  private canDirectRestoreDataLoader
  private VfAvailableNumDataLoader

  private lLDPModeLoader
  private vSwitchDataloader
  private vmCountDataloader

  private pciDeviceSpecMap: any = {}
  private hostMap: any = {}
  private vmInstanceMap: any = {}
  private resolvedPciDeviceInfo: any = {}

  constructor() {
    this.pciDeviceSpecDataLoader = new DataLoader(this._getPciDeviceSpec)
    this.hostDataLoader = new DataLoader(this._getHost)
    this.vmInstanceDataLoader = new DataLoader(this._getVmInstance)
    this.resolvedPciDeviceInfoDataLoader = new DataLoader(this._getResolvedPciDeviceInfo)
    this.hostNetworkInterfaceDataLoader = new DataLoader(this._getHostNetworkInterface)
    this.physicalNicDeviceMaxPartNumDataLoader = new DataLoader(
      this._getPhysicalNicDeviceMaxPartNum
    )
    this.canDirectRestoreDataLoader = new DataLoader(this._getCanDirectRestore)
    this.VfAvailableNumDataLoader = new DataLoader(this._getVfAvailableNum)

    this.lLDPModeLoader = new DataLoader(this._getLLDPMode)
    this.vSwitchDataloader = new DataLoader(this._queryVSwitch)
    this.vmCountDataloader = new DataLoader(this._getVMCount)
  }

  async get(params: QueryAction) {
    const type = params.type
    let conditions: ICondition[] = []
    let zqlConditon = {}
    switch (type) {
      case 'gpu':
        conditions = conditions.concat([
          { key: 'virtStatus', op: Op.ne, value: 'SRIOV_VIRTUAL' },
          {
            key: 'type',
            op: Op.in,
            values: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        ])
        break
      case 'vgpu':
        conditions = conditions.concat([
          { key: 'virtStatus', op: Op.eq, value: 'SRIOV_VIRTUAL' },
          {
            key: 'type',
            op: Op.in,
            values: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        ])
        break
      case 'pci':
        conditions = conditions.concat([
          {
            key: 'type',
            op: Op.notIn,
            values: [
              'GPU_Video_Controller',
              'GPU_3D_Controller',
              'GPU_Audio_Controller',
              'GPU_USB_Controller',
              'GPU_Serial_Controller'
            ]
          }
        ])
        break
      case 'physicalNic':
        conditions = conditions.concat([
          { key: 'virtStatus', op: Op.ne, value: 'SRIOV_VIRTUAL' },
          { key: 'type', op: Op.in, values: ['Ethernet_Controller'] }
        ])
        break
      case 'candidateForAttachToVm':
        zqlConditon = await this.getCandidateForAttachVm(params.extraConditions)
        break
      case 'candidateForCreatingVm':
        zqlConditon = await this.getCandidateForCreateVm(params.extraConditions)
        break
    }
    params.conditions = params.conditions.concat(conditions)
    const zql = QueryConditionTranslator.mergeQueryAction(params, {
      tableName: 'PciDevice',
      condition: zqlConditon,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    })
    const zqls = ZQL.stringify(zql)
    const resp = await this.zqlService.call(zqls)

    return {
      list: resp?.results?.[0]?.inventories ?? [],
      total: resp?.results?.[0]?.total
    }
  }

  async getCandidateForAttachVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid', 'types']

    const candidateParams = _.pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceCandidatesForAttachingVmActionParam

    const zqlCondition: any = {}
    if (candidateParams?.types) {
      zqlCondition.types = {
        [ZOp.in]: candidateParams.types
      }
    }
    if (candidateParams?.vmInstanceUuid) {
      zqlCondition.vmInstanceUuid = candidateParams?.vmInstanceUuid
    }
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPciDeviceCandidatesForAttachingVm',
            output: 'inventories.uuid',
            condition: zqlCondition
          }
        }
      }
    }
  }

  async getCandidateForCreateVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['hostUuid', 'clusterUuids', 'types']
    const clustersCandidateKeys = [
      'defaultL3NetworkUuid',
      'imageUuid',
      'instanceOfferingUuid',
      'l3NetworkUuids',
      'rootDiskOfferingUuid',
      'cpuNum',
      'memorySize'
    ]

    const candidateParams = _.pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceCandidatesForNewCreateVmActionParam
    const clusterscandidateParams = _.pick(
      conditionsMap,
      clustersCandidateKeys
    ) as IGetCandidateZonesClustersHostsForCreatingVmActionParam

    // UI 没有传clusters参数时，通过getCandidateZonesClustersHostsForCreatingVmAction来获取可以用于创建云主机的clusters
    // 传递了hostUuid 就不需要使用clusterUuids
    if (
      !candidateParams.clusterUuids &&
      clusterscandidateParams.imageUuid &&
      !candidateParams.hostUuid
    ) {
      const clustersResp =
        await this.getCandidateZonesClustersHostsForCreatingVmAction.call(clusterscandidateParams)
      candidateParams.clusterUuids = clustersResp.clusters.map(item => item.uuid)
    }

    const zqlCondition: any = {}
    if (candidateParams?.types) {
      zqlCondition.types = {
        [ZOp.in]: candidateParams?.types
      }
    }
    // 当传有hostUuid时 直接食用hostUuid 不传递clusterUuids 否则后端会报错
    if (candidateParams?.hostUuid) {
      zqlCondition.hostUuid = candidateParams?.hostUuid
    } else {
      zqlCondition.clusterUuids = {
        [ZOp.in]: candidateParams?.clusterUuids
      }
    }
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPciDeviceCandidatesForNewCreateVm',
            output: 'inventories.uuid',
            condition: zqlCondition
          }
        }
      }
    }
  }

  async queryVPciDevice(params: IQueryParam) {
    const resp = await this.apiQueryMdevDeviceAction.call(params)
    return resp.inventories
  }

  getPciDeviceSpec(uuid, pciSpecUuid) {
    this.pciDeviceSpecMap[uuid] = {
      uuid,
      pciSpecUuid
    }
    return this.pciDeviceSpecDataLoader.load(uuid)
  }

  _getPciDeviceSpec = async (uuids: string[]) => {
    const pciSpecUuids = uuids.map(uuid => this.pciDeviceSpecMap[uuid].pciSpecUuid)
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: pciSpecUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryPciDeviceSpecAction.call(params)
    const pciDeviceSpecList = resp.inventories
    return uuids.map(uuid => {
      const pciDeviceSpec = pciDeviceSpecList.find(
        cluster => cluster.uuid === this.pciDeviceSpecMap[uuid].pciSpecUuid
      )
      if (pciDeviceSpec) {
        return pciDeviceSpec
      } else {
        return null
      }
    })
  }

  getHost(uuid, hostUuid) {
    this.hostMap[uuid] = {
      uuid,
      hostUuid
    }
    return this.hostDataLoader.load(uuid)
  }

  _getHost = async (uuids: string[]) => {
    const hostUuidList = uuids.map(uuid => this.hostMap[uuid].hostUuid)
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: hostUuidList }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryHostAction.call(params)
    const hostList = resp.inventories
    return uuids.map(uuid => {
      const host = hostList.find(host => host.uuid === this.hostMap[uuid].hostUuid)
      if (host) {
        return host
      } else {
        return null
      }
    })
  }

  getVmInstance(uuid, vmInstanceUuid) {
    if (vmInstanceUuid) {
      this.vmInstanceMap[uuid] = {
        uuid,
        vmInstanceUuid
      }
    }
    return this.vmInstanceDataLoader.load(uuid)
  }

  _getVmInstance = async (uuids: string[]) => {
    const vmInstanceUuids = _.compact(uuids.map(uuid => this.vmInstanceMap?.[uuid]?.vmInstanceUuid))
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: vmInstanceUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryVmInstanceAction.call(params)
    const vmInstanceList = resp.inventories
    return uuids.map(uuid => {
      const vmInstance = vmInstanceList.find(
        vmInstance => vmInstance.uuid === this.vmInstanceMap?.[uuid]?.vmInstanceUuid
      )
      if (vmInstance) {
        return vmInstance
      } else {
        return null
      }
    })
  }

  getResolvedPciDeviceInfo(uuid, pciDeviceUuid) {
    this.resolvedPciDeviceInfo[uuid] = {
      uuid,
      pciDeviceUuid
    }
    return this.resolvedPciDeviceInfoDataLoader.load(uuid)
  }

  _getResolvedPciDeviceInfo = async (uuids: string[]) => {
    const pciDeviceUuidList = uuids.map(uuid => this.resolvedPciDeviceInfo[uuid].pciDeviceUuid)
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: pciDeviceUuidList }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryPciDeviceAction.call(params)
    const pciDeviceList = resp.inventories
    return uuids.map(uuid => {
      const pciDevice = pciDeviceList.find(
        pciDevice => pciDevice.uuid === this.resolvedPciDeviceInfo[uuid].pciDeviceUuid
      )
      if (pciDevice) {
        return pciDevice
      } else {
        return null
      }
    })
  }

  // 获取物理网卡信息
  getHostNetworkInterface(pciDevice: IPciDevice) {
    return this.hostNetworkInterfaceDataLoader.load(pciDevice)
  }

  _getHostNetworkInterface = async (pciDeviceList: IPciDevice[] = []) => {
    const hostUuids = _.uniq(pciDeviceList.map(item => item.hostUuid))
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterface',
      condition: {
        hostUuid: {
          [ZOp.in]: hostUuids
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const results = _.get(resp, ['results', 0, 'inventories'], [])

    const metricParam: GetMetricDataActionParam = {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'PhysicalNetworkInterface'
    }
    const { data: metricList = [] } = await this.getMetricDataAction.call(metricParam)

    const parsedNicList = results.map(item => {
      const { interfaceName, hostUuid } = item
      const metircData = metricList.find(
        metricItem =>
          metricItem.labels?.HostUuid === hostUuid &&
          metricItem.labels?.InterfaceName === interfaceName
      )
      // 1表示物理网卡up，0为down
      let state = NicState.UP
      switch (metircData?.value) {
        case 1: {
          state = NicState.UP
          break
        }
        default: {
          state = NicState.DOWN
        }
      }
      return {
        ...item,
        state
      }
    })

    const hostNicObj = _.reduce(
      parsedNicList,
      (obj, item) => {
        if (!obj[item.hostUuid]) {
          obj[item.hostUuid] = {
            [item.pciDeviceAddress]: item
          }
        } else {
          obj[item.hostUuid][item.pciDeviceAddress] = item
        }
        return obj
      },
      {}
    )

    const nicList = pciDeviceList.map((uuid, index) => {
      return (
        hostNicObj[pciDeviceList[index].hostUuid][pciDeviceList[index].pciDeviceAddress] || null
      )
    })
    return nicList
  }

  // 获取网卡最大切分数量
  async getPhysicalNicDeviceMaxPartNum(pciDevice: IPciDevice) {
    return this.physicalNicDeviceMaxPartNumDataLoader.load(pciDevice)
  }

  private _getPhysicalNicDeviceMaxPartNum = async (pciDeviceList: IPciDevice[] = []) => {
    const uuids = pciDeviceList?.map(item => item?.pciSpecUuid)
    const zql = ZQL.stringify({
      tableName: 'pcidevicespec',
      fields: ['uuid', 'maxPartNum'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const results = _.get(resp, ['results', 0, 'inventories'], [])
    const maxPartNumObj = {}
    results &&
      _.forEach(results, it => {
        maxPartNumObj[it.uuid] = { maxPartNum: it.maxPartNum }
      })
    return _.map(pciDeviceList, item => {
      return _.get(maxPartNumObj, [item.pciSpecUuid, 'maxPartNum'], 0)
    })
  }

  // 判断网卡是否可直接进行还原
  async getCanDirectRestore(uuid: string) {
    return this.canDirectRestoreDataLoader.load(uuid)
  }

  private _getCanDirectRestore = async (pcideviceUuidList: string[] = []) => {
    const zql = ZQL.stringify({
      tableName: 'pcidevice',
      fields: ['parentUuid', 'status'],
      condition: {
        parentUuid: {
          [ZOp.in]: pcideviceUuidList
        },
        status: 'Attached'
      }
    })
    const resp = await this.zqlService.call(zql)
    const results = _.get(resp, ['results', 0, 'inventories'], [])
    const parentObj = {}
    results &&
      _.forEach(results, item => {
        if (!parentObj[item.parentUuid]) {
          parentObj[item.parentUuid] = {
            canDirectRestore: false,
            vmUuidList: [item.vmInstanceUuid]
          }
        } else {
          parentObj[item.parentUuid].vmUuidList.push(item.vmInstanceUuid)
        }
      })
    return _.map(pcideviceUuidList, uuid => {
      return (
        parentObj[uuid] || {
          canDirectRestore: true,
          vmUuidList: []
        }
      )
    })
  }

  // 获取已虚拟化网卡的VF可用量,VF总数
  async getVfAvailableNum(uuid: string) {
    return this.VfAvailableNumDataLoader.load(uuid)
  }

  private _getVfAvailableNum = async (pcideviceUuidList: string[] = []) => {
    const zql = ZQL.stringify({
      tableName: 'pcidevice',
      fields: ['parentUuid', 'status'],
      condition: {
        parentUuid: {
          [ZOp.in]: pcideviceUuidList
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const results = _.get(resp, ['results', 0, 'inventories'], [])
    const parentObj = {}
    results &&
      _.forEach(results, item => {
        if (!parentObj[item.parentUuid]) {
          parentObj[item.parentUuid] = {
            vfAvailableNum: !['Attached', 'Reserved'].includes(item.status) ? 1 : 0,
            vfTotalNum: 1
          }
        } else {
          if (!['Attached', 'Reserved'].includes(item.status)) {
            parentObj[item.parentUuid].vfAvailableNum++
          }
          parentObj[item.parentUuid].vfTotalNum++
        }
      })
    return _.map(pcideviceUuidList, uuid => {
      return (
        parentObj[uuid] || {
          vfAvailableNum: 0,
          vfTotalNum: 0
        }
      )
    })
  }

  /**
   * 获取物理机网卡LLDP模式信息
   * @param interfaceUuid
   */
  getLLDPMode = async (interfaceUuid: string) => {
    if (!interfaceUuid) {
      return null
    }
    return this.lLDPModeLoader.load(interfaceUuid)
  }

  _getLLDPMode = async uuids => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterfaceLldp',
      condition: {
        interfaceUuid: {
          [Op.in]: uuids
        }
      }
    })

    const resp = await this.zqlService.call(zql)

    const dataObj = _.keyBy(resp?.results?.[0]?.inventories, 'interfaceUuid')

    return uuids?.map(interfaceUuid => {
      return (
        dataObj[interfaceUuid] || {
          mode: ELLDPMode.rx_only,
          uuid: null
        }
      )
    })
  }

  /**
   * 获取网卡lldp对端信息
   * @param hostId
   * @param interfaceUuid
   * @param lldpUuid
   */
  getLLDPDeviceInfo = async ({
    hostId,
    interfaceUuid,
    lldpUuid
  }: QueryPhysicalNicLLDPDeviceArgs) => {
    // 网卡id 与主机id 必传
    if (!interfaceUuid || !hostId) {
      return null
    }

    try {
      // 查询主机的当前状态
      const host = await this.queryHostAction.call({
        conditions: [
          {
            key: 'uuid',
            value: hostId
          }
        ]
      })

      const isLostContact = [HostStatus.Connecting, HostStatus.Disconnected].includes(
        host?.inventories?.[0]?.status
      )

      // 如果是失联状态，查询数据库保存的信息
      if (isLostContact && lldpUuid) {
        const zql = ZQL.stringify({
          tableName: 'HostNetworkInterfaceLldpRef',
          condition: {
            lldpUuid: {
              [Op.eq]: lldpUuid
            }
          }
        })

        const resp = await this.zqlService.call(zql)
        return resp?.results?.[0]?.inventories?.[0]
      }

      // 如果lldp id不存在，说明是第一次，直接通过get接口获取最新信息
      const res = await this.getHostNetworkInterfaceLldpAction.call({
        interfaceUuid
      })
      return res?.lldp
    } catch {}
  }

  queryVSwitch = async (uuid: string, bondingUuid: string) => {
    return this.vSwitchDataloader.load({ uuid, bondingUuid })
  }

  _queryVSwitch = async (params: { uuid: string; bondingUuid: string }[]) => {
    const interfaceUuidList = params.map(it => it.uuid)
    const bondingUuidList = params.map(it => it.bondingUuid).filter(Boolean)

    const interfaceToBondingMap = _.reduce(
      params,
      (obj, curr) => {
        obj[curr.uuid] = curr.bondingUuid
        return obj
      },
      {} as any
    )

    const zql = ZQL.multStringify([
      {
        tableName: 'L2Network',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'UplinkGroup',
                fields: ['l2NetworkUuid'],
                condition: {
                  [ZOp.or]: [
                    {
                      interfaceUuid: {
                        [ZOp.in]: interfaceUuidList
                      }
                    },
                    {
                      bondingUuid: {
                        [ZOp.in]: bondingUuidList
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        tableName: 'UplinkGroup',
        fields: ['l2NetworkUuid', 'interfaceUuid', 'bondingUuid'],
        condition: {
          [ZOp.or]: [
            {
              interfaceUuid: {
                [ZOp.in]: interfaceUuidList
              }
            },
            {
              bondingUuid: {
                [ZOp.in]: bondingUuidList
              }
            }
          ]
        }
      }
    ])

    const { results } = await this.zqlService.call(zql)

    const vSwitchMap = _.reduce(
      results?.[0]?.inventories ?? [],
      (obj, curr) => {
        if (!obj[curr.uuid]) {
          obj[curr.uuid] = curr
        }
        return obj
      },
      {} as any
    )

    const uplinkGroupMap = _.reduce(
      results?.[1]?.inventories ?? [],
      (obj, curr) => {
        const key = curr.interfaceUuid || curr.bondingUuid

        if (!obj[key]) {
          obj[key] = curr.l2NetworkUuid
        }

        return obj
      },
      {} as any
    )

    return interfaceUuidList.map(interfaceUuid => {
      const uuid = interfaceToBondingMap[interfaceUuid] || interfaceUuid

      return vSwitchMap[uplinkGroupMap[uuid]]
    })
  }

  async getVMCount(uuid) {
    if (!uuid) {
      return null
    }
    return this.vmCountDataloader.load(uuid)
  }

  _getVMCount = async uuids => {
    const zql = ZQL.multStringify(
      _.map(uuids, uuid => {
        return {
          action: ZQLAction.COUNT,
          fnName: ZQLFn.distinct,
          tableName: 'vmVfNic',
          fields: ['vmInstanceUuid'],
          condition: {
            'pciDevice.parentUuid': {
              [Op.eq]: uuid
            },
            'pciDevice.status': 'Attached'
          },
          namedAs: uuid
        }
      })
    )

    const { results } = await this.zqlService.call(zql)
    const vmCountMap = _.reduce(
      results,
      (obj, item) => {
        obj[item.name] = item?.total || 0
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(vmCountMap, uuid, 0))
  }
}
