import { Injectable, Inject } from '@nestjs/common'
import { pick as _pick, omit as _omit, chunk as _chunk } from 'lodash'

import { Op, Condition as ICondition, conditionsToObject } from '@/api/zstack/base/query-base'
import {
  GetCandidateZonesClustersHostsForCreatingVmAction,
  GetCandidateZonesClustersHostsForCreatingVmActionParam as IGetCandidateZonesClustersHostsForCreatingVmActionParam
} from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import { GetMdevDeviceCandidatesAction } from '@/api/zstack/GetMdevDeviceCandidatesAction'
import {
  GetPciDeviceCandidatesForAttachingVmAction,
  GetPciDeviceCandidatesForAttachingVmActionParam as IGetPciDeviceCandidatesForAttachingVmActionParam,
  GetPciDeviceCandidatesForAttachingVmActionParam
} from '@/api/zstack/GetPciDeviceCandidatesForAttachingVmAction'
import {
  GetPciDeviceCandidatesForNewCreateVmAction,
  GetPciDeviceCandidatesForNewCreateVmActionParam
} from '@/api/zstack/GetPciDeviceCandidatesForNewCreateVmAction'
import { ActionService } from '@/base/action-service'
import { SortDirectionValidValues } from '@/common/model/action-query.model'
import { MdevDeviceQueryService } from '@/hardware-resource/mdev-device/mdev-device-query/mdev-device-query.service'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import { VGpuType, UpdateVGpuDeviceInput } from '@/hardware-resource/vgpu-device/vgpu-device.model'
@Injectable()
export class VGpuDeviceService extends ActionService {
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() mdevDeviceQueryService: MdevDeviceQueryService
  @Inject()
  getPciDeviceCandidatesForNewCreateVmAction: GetPciDeviceCandidatesForNewCreateVmAction
  @Inject() getMdevDeviceCandidatesAction: GetMdevDeviceCandidatesAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction
  @Inject()
  getPciDeviceCandidatesForAttachingVmAction: GetPciDeviceCandidatesForAttachingVmAction

  async queryVGpuDevice(params) {
    params = { replyWithCount: true, ...params }
    const { limit, start, sortBy, sortDirection } = params
    params = _omit(params, ['limit', 'start', 'sortBy', 'sortDirection'])
    let conditions: ICondition[] = []
    const type = params.type
    switch (type) {
      case 'candidateForCreateVm':
        conditions = conditions.concat(await this.getCandidateForCreateVm(params.extraConditions))
        break
      case 'candidateForAttachToVm':
        conditions = conditions.concat(await this.getCandidateForAttachToVm(params.extraConditions))
        break
    }
    params.conditions = params.conditions.concat(conditions)
    const pciDeviceResp = await this.pciDeviceQueryService.get({
      ...params,
      type: 'vgpu'
    })
    const mdevDeviceResp = await this.mdevDeviceQueryService.get(params)
    pciDeviceResp.list.forEach(item => {
      item.type = VGpuType.PciDevice
      item.specUuid = item.pciSpecUuid
      item.manufacturer = item.vendorId === '1002' ? 'amd' : 'nvidia'
    })
    mdevDeviceResp.list.forEach(item => {
      item.type = VGpuType.MdevDevice
      item.specUuid = item.mdevSpecUuid
      item.manufacturer = item.vendorId === '1002' ? 'amd' : 'nvidia'
    })

    let list = pciDeviceResp.list.concat(mdevDeviceResp.list)
    if (sortBy && sortDirection) {
      list = list.sort((a, b) => {
        const [p1, p2] =
          sortDirection === SortDirectionValidValues.asc
            ? [a[sortBy], b[sortBy]]
            : [b[sortBy], a[sortBy]]
        return p1 > p2 ? 1 : -1
      })
    }
    const _list = _chunk(list, limit)?.[(start ?? 0) / (limit ?? 10)] ?? []
    return {
      list: _list,
      total: pciDeviceResp.total + mdevDeviceResp.total
    }
  }

  async getCandidateForAttachToVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']

    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceCandidatesForAttachingVmActionParam

    let baseResp = await this.getMdevDeviceCandidatesAction.call(candidateParams)
    let uuidList = baseResp.inventories.map(item => item.uuid)
    candidateParams.types = ['GPU_Video_Controller', 'GPU_3D_Controller']
    baseResp = await this.getPciDeviceCandidatesForAttachingVmAction.call(candidateParams)
    uuidList = uuidList.concat(baseResp.inventories.map(item => item.uuid))
    return [{ key: 'uuid', op: Op.in, values: uuidList }]
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

    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceCandidatesForNewCreateVmActionParam
    const clusterscandidateParams = _pick(
      conditionsMap,
      clustersCandidateKeys
    ) as IGetCandidateZonesClustersHostsForCreatingVmActionParam

    // UI 没有传clusters参数时，通过getCandidateZonesClustersHostsForCreatingVmAction来获取可以用于创建云主机的clusters
    if (
      !candidateParams.clusterUuids?.length &&
      clusterscandidateParams.imageUuid &&
      !candidateParams.hostUuid
    ) {
      const clustersResp =
        await this.getCandidateZonesClustersHostsForCreatingVmAction.call(clusterscandidateParams)
      candidateParams.clusterUuids = clustersResp.clusters.map(item => item.uuid)
    }

    if (candidateParams.hostUuid && candidateParams.clusterUuids) {
      delete candidateParams.clusterUuids
    }

    let baseResp = await this.getPciDeviceCandidatesForNewCreateVmAction.call(candidateParams)
    let uuidList = baseResp.inventories.map(item => item.uuid)
    baseResp = await this.getMdevDeviceCandidatesAction.call(candidateParams)
    uuidList = uuidList.concat(baseResp.inventories.map(item => item.uuid))
    return [{ key: 'uuid', op: Op.in, values: uuidList }]
  }
}
