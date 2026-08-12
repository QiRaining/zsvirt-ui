import { Injectable, Inject } from '@nestjs/common'
import { Mutation, Args } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeHostStateAction } from '@/api/zstack/ChangeHostStateAction'
import { CheckKVMHostConfigFileAction } from '@/api/zstack/CheckKVMHostConfigFileAction'
import { DeleteHostAction } from '@/api/zstack/DeleteHostAction'
import { GetHostAllocatorStrategiesAction } from '@/api/zstack/GetHostAllocatorStrategiesAction'
import { GetHostWebSshUrlAction } from '@/api/zstack/GetHostWebSshUrlAction'
import { GetHypervisorTypesAction } from '@/api/zstack/GetHypervisorTypesAction'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryVpcRouterAction } from '@/api/zstack/QueryVpcRouterAction'
import { UpdateHostAction } from '@/api/zstack/UpdateHostAction'
import { UpdateHostIommuStateAction } from '@/api/zstack/UpdateHostIommuStateAction'
import { UpdateKVMHostAction } from '@/api/zstack/UpdateKVMHostAction'
import { ActionService } from '@/base/action-service'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import ZQL, { ZOp, ZQLAction, ZQLFn } from '@/common/zql/index'
import { HostQueryService } from '@/hardware-resource/host/query/host-query.service'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'

import { HostInterfaceService } from '../pci-device/pci-device-query/host-interface.service'
import { PciDeviceQueryService } from '../pci-device/pci-device-query/pci-device-query.service'
import { PciDevicePassThroughState } from '../pci-device/pci-device.model'
import { StorageAdapterService } from '../storage-adapter/storage-adapter.service'
import { HostRelatedSummary, HostPowerControlRelatedSummary } from './host.model'

@Injectable()
export class HostService extends ActionService {
  @Inject()
  queryHostAction: QueryHostAction
  @Inject() vGpuDeviceService: VGpuDeviceService
  @Inject()
  deleteHostAction: DeleteHostAction
  @Inject()
  updateHostAction: UpdateHostAction
  @Inject()
  updateKVMHostAction: UpdateKVMHostAction
  @Inject()
  changeHostStateAction: ChangeHostStateAction
  @Inject()
  updateHostIommuStateAction: UpdateHostIommuStateAction
  @Inject()
  getHypervisorTypesAction: GetHypervisorTypesAction
  @Inject()
  checkKVMHostConfigFileAction: CheckKVMHostConfigFileAction
  @Inject()
  getHostAllocatorStrategiesAction: GetHostAllocatorStrategiesAction
  @Inject()
  queryVpcRouterAction: QueryVpcRouterAction
  @Inject()
  getMetricDataAction: GetMetricDataAction
  @Inject()
  hostQueryService: HostQueryService
  @Inject()
  metricDataService: MetricDataService
  @Inject()
  zqlService: ZQLService
  @Inject()
  pciDeviceQueryService: PciDeviceQueryService
  @Inject()
  hostInterfaceService: HostInterfaceService
  @Inject()
  getHostWebSshUrlAction: GetHostWebSshUrlAction
  @Inject()
  storageAdapterService: StorageAdapterService

  async getHostMetricData(
    uuid: string,
    startTime: number,
    endTime: number,
    period: number,
    metricNames: string[]
  ) {
    const namespace = 'ZStack/Host'
    const metricList = metricNames.map(metricName => {
      return {
        metricName,
        conditions: [
          {
            key: 'HostUuid',
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

  async getHostPowerControlRelatedSummary(
    uuids: string[]
  ): Promise<HostPowerControlRelatedSummary> {
    let zql = null
    let resp = null
    let vm = 0,
      vpcRouter = 0,
      volume = 0,
      loadbalance = 0,
      cephLocalStorage = 0
    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          [ZOp.or]: [
            {
              [ZOp.and]: {
                lastHostUuid: { [ZOp.in]: uuids },
                // state: 'Stopped',
                hostUuid: { [ZOp.is]: null }
              }
            },
            {
              'host.uuid': { [ZOp.in]: uuids }
            },
            {
              'rootVolume.localStorageHostRef.hostUuid': { [ZOp.in]: uuids }
            }
          ]
        }
      })
      resp = await this.zqlService.call(zql)
      vm = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      resp = await this.queryVpcRouterAction.call({
        count: true,
        conditions: [
          {
            key: 'hostUuid',
            op: Op.in,
            values: uuids
          }
        ]
      })
      vpcRouter = resp?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          'localStorageHostRef.hostUuid': { [ZOp.in]: uuids },
          type: 'Data'
        }
      })
      resp = await this.zqlService.call(zql)
      volume = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'appliancevm',
        condition: {
          applianceVmType: 'SLB',
          hostUuid: {
            [ZOp.in]: uuids
          }
        }
      })
      resp = await this.zqlService.call(zql)
      loadbalance = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'cephprimarystorage',
        condition: {
          'mons.hostname': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'host',
                fields: ['managementIp'],
                condition: {
                  uuid: { [ZOp.in]: uuids }
                }
              }
            }
          }
        }
      })
      resp = await this.zqlService.call(zql)
      cephLocalStorage = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    return {
      vm,
      vpcRouter,
      volume,
      loadbalance,
      cephLocalStorage
    }
  }

  async getHostRelatedSummary(uuid: string): Promise<HostRelatedSummary> {
    let zql = null
    let resp = null
    let [
      vm,
      scsiLun,
      nvmeLun,
      physicalNic,
      gpu,
      vGpu,
      usb,
      pci,
      pciPassthrough,
      memory,
      cpu,
      power,
      storageAdapter
    ] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          [ZOp.or]: [
            {
              [ZOp.and]: {
                lastHostUuid: uuid,
                hostUuid: { [ZOp.is]: null }
              }
            },
            {
              'host.uuid': uuid
            },
            {
              'rootVolume.localStorageHostRef.hostUuid': uuid
            }
          ]
        }
      })

      resp = await this.zqlService.call(zql)
      vm = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        fnName: ZQLFn.distinct,
        fields: ['wwid'],
        tableName: 'ScsiLun',
        condition: {
          'scsiLunHostRef.hostUuid': uuid
        }
      })

      resp = await this.zqlService.call(zql)
      scsiLun = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'nvmeLun',
        condition: {
          [ZOp.and]: [
            {
              'nvmeLunHostRef.hostUuid': uuid
            },
            {
              'nvmeLunHostRef.transport': {
                [ZOp.ne]: 'PCIE'
              }
            }
          ]
        }
      })

      resp = await this.zqlService.call(zql)
      nvmeLun = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      resp = await this.hostInterfaceService.query({
        conditions: [
          {
            key: 'hostUuid',
            op: Op.eq,
            value: uuid
          }
        ]
      })
      physicalNic = resp?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'pciDevice',
        condition: {
          hostUuid: uuid,
          virtStatus: {
            [ZOp.ne]: 'SRIOV_VIRTUAL'
          },
          type: {
            [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        }
      })

      resp = await this.zqlService.call(zql)
      gpu = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      resp = await this.vGpuDeviceService.queryVGpuDevice({
        count: true,
        conditions: [
          {
            key: 'hostUuid',
            value: uuid
          },
          {
            key: 'type',
            op: Op.in,
            values: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        ]
      })
      vGpu = resp?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'usbDevice',
        condition: {
          hostUuid: uuid
        }
      })

      resp = await this.zqlService.call(zql)
      usb = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'pciDevice',
        condition: {
          hostUuid: uuid,
          type: {
            [ZOp.notIn]: [
              'GPU_Video_Controller',
              'GPU_3D_Controller',
              'GPU_Audio_Controller',
              'GPU_USB_Controller',
              'GPU_Serial_Controller'
            ]
          }
        }
      })

      resp = await this.zqlService.call(zql)
      pci = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'pciDevice',
        condition: {
          hostUuid: uuid,
          passThroughState: PciDevicePassThroughState.Enabled,
          type: {
            [ZOp.notIn]: [
              'GPU_Video_Controller',
              'GPU_3D_Controller',
              'GPU_Audio_Controller',
              'GPU_USB_Controller',
              'GPU_Serial_Controller'
            ]
          }
        }
      })

      resp = await this.zqlService.call(zql)
      pciPassthrough = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'hostPhysicalMemory',
        condition: {
          hostUuid: uuid
        }
      })

      resp = await this.zqlService.call(zql)
      memory = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    try {
      resp = await this.hostQueryService.getSystemInfo(uuid)
      cpu = resp?.cpuSocketCoreThread?.sockets ?? 1
    } catch (e) {}

    try {
      resp = await this.getMetricDataAction.call({
        namespace: 'ZStack/Host',
        offsetAheadOfCurrentTime: 1,
        metricName: 'PowerSupply',
        labels: [`HostUuid=${uuid}`]
      })
      power = resp?.data.length ?? 0
    } catch (e) {}

    try {
      resp = await this.storageAdapterService.countStorageAdapter({
        conditions: [{ key: 'hostUuid', value: uuid }]
      })
      storageAdapter = resp?.total ?? 0
    } catch (e) {}

    return {
      vm,
      scsiLun,
      nvmeLun,
      physicalNic,
      gpu,
      vGpu,
      usb,
      pci,
      pciPassthrough,
      memory,
      cpu,
      power,
      storageAdapter
    }
  }

  @Mutation(() => ActionSendResp)
  async checkKVMHostConfigFileWithoutDoAction(@Args('hostInfo') hostInfo: string) {
    try {
      await this.checkKVMHostConfigFileAction.call({ hostInfo })
      return { success: true }
    } catch (error) {
      return { error: error?.message ?? error, success: false }
    }
  }

  async getHostWebSshUrl(hostUuid: string, username: string, password: string, https: boolean) {
    return await this.getHostWebSshUrlAction.call({
      uuid: hostUuid,
      userName: username,
      password,
      https
    })
  }
}
