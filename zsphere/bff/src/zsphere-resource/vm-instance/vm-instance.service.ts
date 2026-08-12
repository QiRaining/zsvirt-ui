import { Inject, Injectable } from '@nestjs/common'
import { ApolloError } from 'apollo-server-errors'
import { get as _get, isEmpty as _isEmpty, orderBy as _orderBy, uniq as _uniq } from 'lodash'

import { AllocateHostResourceAction } from '@/api/zstack/AllocateHostResourceAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetHostNUMATopologyAction } from '@/api/zstack/GetHostNUMATopologyAction'
import { GetVmUptimeAction } from '@/api/zstack/GetVmUptimeAction'
import { GetVmvNUMATopologyAction } from '@/api/zstack/GetVmvNUMATopologyAction'
import { ActionService } from '@/base/action-service'
import { TaskResponseService } from '@/common/action-subscription/task-response.service'
import { PciDeviceType, PciDeviceVirtStatus } from '@/common/enum'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  GetHostNUMANodeArgs,
  GetMaxPCpuNumForVmCreateType,
  VmNicConfig as IVmNicConfig,
  NUMATopologyArgs
} from './vm-instance.model'

@Injectable()
export class VmInstanceService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() getVmvNUMATopologyAction: GetVmvNUMATopologyAction
  @Inject() getHostNUMATopologyAction: GetHostNUMATopologyAction
  @Inject() taskResponseService: TaskResponseService
  @Inject() metricDataService: MetricDataService
  @Inject() allocateHostResourceAction: AllocateHostResourceAction
  @Inject() GetVmUptimeAction: GetVmUptimeAction

  async getVmMetricDataList(
    uuid: string,

    startTime: number,
    endTime: number,
    period: number,
    metricNames: string[],
    namespace = 'ZStack/VM'
  ) {
    const metricList = metricNames.map(metricName => {
      return {
        metricName,
        conditions: [
          {
            key: 'VMUuid',
            value: uuid
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

  async storageMigrateVmInstancedepends(uuid) {
    const result = { uuid }
    const tasks = []
    const attachedScsiLunZqlObject = {
      tableName: 'scsiLunVmInstanceRef',
      condition: {
        vmInstanceUuid: uuid
      }
    }
    let p = this.zqlService.call(ZQL.stringify(attachedScsiLunZqlObject)).then(resp => {
      result['isAttachedScsiLunDevice'] = resp.results?.[0]?.inventories?.length > 0
    })
    tasks.push(p)

    const queryAttachedUsbDeviceZqlObjects = [
      {
        tableName: 'usbdevice',
        condition: {
          vmInstanceUuid: uuid
        }
      },
      {
        tableName: 'host',
        fields: ['uuid', 'state'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'usbdevice',
                fields: 'hostUuid',
                condition: {
                  vmInstanceUuid: uuid
                }
              }
            }
          },
          state: {
            [ZOp.ne]: 'Enabled'
          }
        }
      }
    ]
    p = this.zqlService.call(ZQL.multStringify(queryAttachedUsbDeviceZqlObjects)).then(resp => {
      const usbDevicesList = resp?.results?.[0]?.inventories
      const unConnectedHostList = resp?.results?.[1]?.inventories
      // 当云主机上挂载的USB设备type全为Redirect且其所在的物理机为连接中时，该云主机也可迁移
      result['hasUnavailableUsbDevice'] =
        usbDevicesList.length > 0 &&
        !(
          unConnectedHostList.length === 0 &&
          usbDevicesList.every(item => item.attachType === 'Redirect')
        )
    })
    tasks.push(p)

    const attachedPciDeviceZqlObject = {
      tableName: 'pciDevice',
      fields: ['uuid'],
      condition: {
        vmInstanceUuid: uuid,
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'VmVdpaNic.pciDeviceUuid',
                  condition: {
                    vmInstanceUuid: uuid
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'pciDevice',
                  fields: ['uuid'],
                  condition: {
                    type: {
                      [ZOp.in]: [PciDeviceType.Ethernet_Controller]
                    },
                    virtStatus: {
                      [ZOp.in]: [PciDeviceVirtStatus.SRIOV_VIRTUAL]
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
    p = this.zqlService.call(ZQL.stringify(attachedPciDeviceZqlObject)).then(resp => {
      result['hasPeripheralAttached'] = resp?.results?.[0]?.inventories?.length > 0
    })

    tasks.push(p)

    const attachedMdevDeviceZqlObject = {
      tableName: 'MdevDevice',
      fields: ['uuid'],
      condition: {
        vmInstanceUuid: uuid
      }
    }
    p = this.zqlService.call(ZQL.stringify(attachedMdevDeviceZqlObject)).then(resp => {
      result['hasMdevAttached'] = resp?.results?.[0]?.inventories?.length > 0
    })

    tasks.push(p)

    await Promise.all(tasks)
    result['hasPeripheralAttached'] =
      result['hasPeripheralAttached'] ||
      result['hasUnavailableUsbDevice'] ||
      result['hasMdevAttached']
    return result
  }

  async batchStorageMigrateVmInstancedepends(uuids) {
    const result = await Promise.all(uuids.map(t => this.storageMigrateVmInstancedepends(t)))

    return result
  }

  async getMaxPCpuNum(uuidList, type) {
    let zqlObj
    switch (type) {
      case GetMaxPCpuNumForVmCreateType.L2Network:
        zqlObj = {
          tableName: 'hostcapacity',
          fields: 'cpuNum',
          restrictBy: {
            'l2network.uuid': {
              [ZOp.in]: uuidList
            }
          },
          orderBy: 'cpuNum',
          orderDirection: 'desc',
          limit: 1
        }
        break
      case GetMaxPCpuNumForVmCreateType.Zone:
        zqlObj = {
          tableName: 'hostcapacity',
          fields: 'cpuNum',
          condition: {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'host',
                  fields: 'uuid',
                  condition: {
                    zoneUuid: {
                      [ZOp.in]: uuidList
                    }
                  }
                }
              }
            }
          },
          orderBy: 'cpuNum',
          orderDirection: 'desc',
          limit: 1
        }
        break
      default:
        break
    }
    const resp = await this.zqlService.call(ZQL.stringify(zqlObj))
    return _get(resp.results, [0, 'inventories', 0, 'cpuNum'], 0)
  }

  async getCdromConfigForVmCreate() {
    const zqlObj = {
      tableName: 'globalconfig',
      condition: {
        category: 'vm',
        name: {
          [ZOp.in]: ['maximumCdRomNum', 'vmDefaultCdRomNum']
        }
      }
    }
    const { results } = await this.zqlService.call(ZQL.stringify(zqlObj))
    const result = {}
    results[0].inventories.forEach(item => {
      result[item.name] = item.value
    })
    return result
  }

  async getHostResourceAllocation(params) {
    const { uuid, uuidType } = params
    let hostUuid = uuid
    if (uuidType === 'vm') {
      const zqlObj: ZqlObject = {
        tableName: 'VmInstance',
        condition: { uuid },
        fields: ['hostUuid']
      }
      const resp = await this.zqlService.call(ZQL.stringify(zqlObj))
      hostUuid = resp.results[0]?.inventories[0]?.hostUuid
    }

    const { vCPUPin } = await this.allocateHostResourceAction.call({
      ...params,
      uuid: hostUuid
    })
    return {
      vCPUPin
    }
  }

  async getVMNUMATopology(uuid) {
    const { topology } = await this.getVmvNUMATopologyAction.call({
      uuid
    })
    return topology?.length === 0 ? false : true
  }

  async getNUMATopology(params: NUMATopologyArgs) {
    const { hostUuid, vmUuid, sortByVmNode } = params
    const { topology: hostTopology } = await this.getHostNUMATopologyAction.call({
      uuid: hostUuid
    })
    const list = Object.keys(hostTopology).map(hostNodeId => {
      return {
        node: hostNodeId,
        VMsUuid: hostTopology[hostNodeId]?.VMsUuid || [],
        ...hostTopology[hostNodeId]
      }
    })
    let newHostTopology = []
    if (sortByVmNode) {
      const { topology, name: vmName } = await this.getVmvNUMATopologyAction.call({
        uuid: vmUuid
      })
      const vmTopology = _orderBy(topology, ['nodeID'], ['asc'])
      newHostTopology = vmTopology.map(cv => {
        const data = hostTopology[cv.phyNodeID]
        return {
          ...data,
          node: cv.phyNodeID
        }
      })
      return {
        vmName,
        vmUuid,
        vmTopology,
        hostTopology: sortByVmNode ? newHostTopology : _orderBy(list, ['node'], ['asc'])
      }
    }

    return {
      hostTopology: _orderBy(list, ['node'], ['asc'])
    }
  }

  async getHostNUMANode(params: GetHostNUMANodeArgs) {
    const { uuid, uuidType, withCPUUsedUtilization } = params
    let hostUuid = uuid
    if (uuidType === 'vm') {
      const zqlObj: ZqlObject = {
        tableName: 'VmInstance',
        condition: { uuid },
        fields: ['hostUuid']
      }
      const resp = await this.zqlService.call(ZQL.stringify(zqlObj))
      const vmInstance = resp.results[0]?.inventories[0]
      if (!vmInstance) {
        throw new ApolloError(`VM instance with uuid ${uuid} not found`, 'RESOURCE_NOT_FOUND', {
          code: 'SYS.1003',
          description: 'A resource can not be found',
          details: `VM instance[uuid:${uuid}, type:VmInstanceVO] not found`
        })
      }
      hostUuid = vmInstance.hostUuid
      if (!hostUuid) {
        throw new ApolloError(
          `VM instance ${uuid} does not have an associated host`,
          'RESOURCE_NOT_FOUND',
          {
            code: 'SYS.1003',
            description: 'A resource can not be found',
            details: `VM instance[uuid:${uuid}] does not have hostUuid, the VM may be stopped or not running on any host`
          }
        )
      }
    }

    if (!hostUuid) {
      throw new ApolloError(`Host uuid is required but not provided`, 'INVALID_INPUT', {
        code: 'SYS.1003',
        description: 'A resource can not be found',
        details: 'hostUuid is required but not provided'
      })
    }

    const { topology } = await this.getHostNUMATopologyAction.call({
      uuid: hostUuid
    })

    const numaNodeList = Object.keys(topology).map(numaNode => {
      return {
        numaNode,
        cpus: topology[numaNode].cpus
      }
    })

    let pCPUUsedList = []
    if (withCPUUsedUtilization) {
      const cpuNums = numaNodeList.reduce((pre, next) => [...pre, ...next.cpus], [])
      const { list } = await this.queryhostCPUUsedUtilization({
        ...params,
        cpuNums: _uniq(cpuNums),
        hostUuid
      })
      pCPUUsedList = list
    }

    return {
      numaNodeList,
      pCPUUsedList
    }
  }

  async queryhostCPUUsedUtilization(queryArgs) {
    const { startTime, endTime, isAverage, hostUuid, cpuNums } = queryArgs
    const period = (Number(endTime) - Number(startTime)) / 100
    const functions = []
    const labels = [`HostUuid=${hostUuid}`, `CPUNum=~${cpuNums.join('|')}`]
    if (isAverage) {
      functions.push('average(groupBy="CPUNum")')
    }

    const zqlObj: ZqlObject = {
      tableName: 'Host',
      fields: ['uuid'],
      returnWith: {
        total: true,
        zwatch: [
          {
            startTime: Number(startTime),
            endTime: Number(endTime),
            namespace: 'ZStack/Host',
            metricName: 'CPUUsedUtilization',
            period: period < 1 ? 1 : period,
            functions,
            labels,
            resultName: 'CPUUsedUtilization'
          }
        ]
      }
    }

    const zql = ZQL.stringify(zqlObj)
    const results = await this.zqlService.call(zql)

    const {
      results: [{ returnWith: metric = {} }]
    } = results
    const total = metric.CPUUsedUtilizationTotal
    const list = metric.CPUUsedUtilization?.map(item => {
      return {
        cpuNum: item.labels.CPUNum,
        value: item.value
      }
    })

    return {
      list,
      total
    }
  }

  async getMemorySnapshotByVm(uuid) {
    const zqlObj: ZqlObject = {
      tableName: 'VolumeSnapshotGroup',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmInstanceDeviceAddressGroup',
              fields: ['resourceUuid'],
              condition: {
                vmInstanceUuid: {
                  [ZOp.eq]: uuid
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObj)
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []

    return {
      isMemorySnapshot: !_isEmpty(list)
    }
  }

  async getVMUptime(uuid) {
    const { uptime } = await this.GetVmUptimeAction.call({
      uuid
    })
    return uptime
  }
}

export interface CreateVmInstanceActionParam {
  name: string
  description?: string
  imageUuid: string
  instanceOfferingUuid: string
  vmNicConfig: IVmNicConfig[]
  defaultL3NetworkUuid: string
  count: number
  systemTags?: string[]
  tagUuids?: string[]
}

export interface AttachTagToVolumeParam {
  tagUuid: string
}
