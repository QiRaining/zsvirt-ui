import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { pick as _pick, omit as _omit, chunk as _chunk, cloneDeep as _cloneDeep } from 'lodash'

import { Op, Condition as ICondition, conditionsToObject } from '@/api/zstack/base/query-base'
import {
  GetCandidateZonesClustersHostsForCreatingVmAction,
  GetCandidateZonesClustersHostsForCreatingVmActionParam as IGetCandidateZonesClustersHostsForCreatingVmActionParam
} from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import { GetMdevDeviceSpecCandidatesAction } from '@/api/zstack/GetMdevDeviceSpecCandidatesAction'
import {
  GetPciDeviceSpecCandidatesAction,
  GetPciDeviceSpecCandidatesActionParam as IGetPciDeviceSpecCandidatesActionParam
} from '@/api/zstack/GetPciDeviceSpecCandidatesAction'
import { ActionService } from '@/base/action-service'
import { SortDirectionValidValues } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { MdevDeviceSpecService } from '@/zsphere-resource/mdev-device-spec/mdev-device-spec.service'
import { PciDeviceSpecService } from '@/zsphere-resource/pci-device-spec/pci-device-spec.service'
import {
  UpdateVGpuDeviceSpecInput,
  VGpuDeviceType
} from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.model'

@Injectable()
export class VGpuDeviceSpecService extends ActionService {
  @Inject() pciDeviceSpecService: PciDeviceSpecService
  @Inject() mdevDeviceSpecService: MdevDeviceSpecService
  @Inject() getPciDeviceSpecCandidatesAction: GetPciDeviceSpecCandidatesAction
  @Inject()
  getMdevDeviceSpecCandidatesAction: GetMdevDeviceSpecCandidatesAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction

  private resolvedVGpuDeviceSpecMap: any = {}

  private resolvedVGpuDeviceSpecDataLoader

  constructor() {
    super()
    this.resolvedVGpuDeviceSpecDataLoader = new DataLoader(this._getResolvedVGpuDeviceSpecInfo)
  }

  async queryVGpuDeviceSpec(params) {
    params = { replyWithCount: true, ...params }
    const { limit = 10, start = 0, sortBy, sortDirection } = params
    _omit(params, ['limit', 'start', 'sortBy', 'sortDirection'])
    let conditions: ICondition[] = [
      {
        key: 'type',
        op: Op.in,
        values: ['GPU_Video_Controller', 'GPU_3D_Controller']
      }
    ]
    const type = params.type
    switch (type) {
      case 'candidateForVm':
        conditions = conditions.concat(await this.getCandidateForVm(params.extraConditions))
        break
    }
    params.conditions = params.conditions.concat(conditions)
    const mdevDeviceSpecResp = await this.mdevDeviceSpecService.queryMdevDeviceSpec(params)
    params.conditions.push({
      key: 'isVirtual',
      op: Op.eq,
      value: 'true'
    })
    const pciDeviceSpecResp = await this.pciDeviceSpecService.queryPciDeviceSpec({
      type: 'vgpu',
      ...params
    })
    pciDeviceSpecResp.list.forEach(item => {
      item.deviceType = VGpuDeviceType.PciDevice
      item.maxInstance = item.maxPartNum
      item.fbMemory = item.ramSize
      item.manufacturer = item.vendorId === '1002' ? 'amd' : 'nvidia'
    })
    mdevDeviceSpecResp.list.forEach((item, index) => {
      const specification = JSON.parse(item.specification)
      mdevDeviceSpecResp.list[index] = {
        deviceType: VGpuDeviceType.MdevDevice,
        manufacturer: item.vendorId === '1002' ? 'amd' : 'nvidia',
        fbMemory: specification['FB Memory'],
        maxInstance: specification['Max Instances'],
        frameRateLimit: specification['Frame Rate Limit'],
        deviceId: specification['Device ID'],
        subSystemId: specification['Sub System ID'],
        gridLicense: specification['GRID License'],
        maximumResolution: `${specification['Maximum X Resolution']}*${specification['Maximum Y Resolution']}`,
        ...item
      }
    })
    let list = pciDeviceSpecResp.list.concat(mdevDeviceSpecResp.list)
    if (sortBy && sortDirection) {
      list = list.sort((a, b) => {
        const [p1, p2] =
          sortDirection === SortDirectionValidValues.asc
            ? [a[sortBy], b[sortBy]]
            : [b[sortBy], a[sortBy]]
        return p1 > p2 ? 1 : -1
      })
    }

    return {
      list: _chunk(list, limit)[Math.floor(start / limit)],
      total: pciDeviceSpecResp.total + mdevDeviceSpecResp.total
    }
  }

  async getCandidateForVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['hostUuid', 'clusterUuids', 'vmInstanceUuid', 'vmInstanceUuids', 'types']
    const clustersCandidateKeys = [
      'defaultL3NetworkUuid',
      'imageUuid',
      'instanceOfferingUuid',
      'l3NetworkUuids',
      'rootDiskOfferingUuid'
    ]
    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as IGetPciDeviceSpecCandidatesActionParam

    const clusterscandidateParams = _pick(
      conditionsMap,
      clustersCandidateKeys
    ) as IGetCandidateZonesClustersHostsForCreatingVmActionParam

    if (candidateParams.vmInstanceUuid) {
      delete candidateParams.hostUuid
      delete candidateParams.clusterUuids
    } else if (candidateParams.clusterUuids) {
      delete candidateParams.vmInstanceUuid
    } else if (clusterscandidateParams.imageUuid) {
      const clustersResp =
        await this.getCandidateZonesClustersHostsForCreatingVmAction.call(clusterscandidateParams)
      candidateParams.clusterUuids = clustersResp.clusters.map(item => item.uuids)
      delete candidateParams.vmInstanceUuid
    }

    let baseResp = await this.getPciDeviceSpecCandidatesAction.call(candidateParams)
    let uuidList = baseResp.inventories.map(item => item.uuid)
    baseResp = await this.getMdevDeviceSpecCandidatesAction.call(candidateParams)
    uuidList = uuidList.concat(baseResp.inventories.map(item => item.uuid))
    return [{ key: 'uuid', op: Op.in, values: uuidList }]
  }

  getResolvedVGpuDeviceSpecInfo(uuid, vgpuDeviceSpecUuid, type) {
    this.resolvedVGpuDeviceSpecMap[uuid] = {
      uuid,
      vgpuDeviceSpecUuid,
      type
    }
    return this.resolvedVGpuDeviceSpecDataLoader.load(uuid)
  }

  _getResolvedVGpuDeviceSpecInfo = async (uuids: string[]) => {
    const mdevDeviceSpecUuidList = []
    const pciDeviceSpecUuidList = []
    uuids.forEach(uuid => {
      if (this.resolvedVGpuDeviceSpecMap[uuid].type === 'mdevDevice') {
        mdevDeviceSpecUuidList.push(this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid)
      } else {
        pciDeviceSpecUuidList.push(this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid)
      }
    })
    const pciDeviceSpecResp = await this.pciDeviceSpecService.queryPciDeviceSpec({
      conditions: [{ key: 'uuid', op: Op.in, values: pciDeviceSpecUuidList }]
    })
    const mdevDeviceSpecResp = await this.mdevDeviceSpecService.queryMdevDeviceSpec({
      conditions: [{ key: 'uuid', op: Op.in, values: mdevDeviceSpecUuidList }]
    })
    return uuids.map(uuid => {
      const inventories =
        this.resolvedVGpuDeviceSpecMap[uuid].deviceType === VGpuDeviceType.MdevDevice
          ? mdevDeviceSpecResp.list
          : pciDeviceSpecResp.list
      const specInfo = inventories.find(
        item => item.uuid === this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid
      )
      return specInfo ? specInfo : null
    })
  }
}
