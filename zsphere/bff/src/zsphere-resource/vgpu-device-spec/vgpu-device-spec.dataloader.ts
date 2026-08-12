import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
import { QueryMdevDeviceSpecAction } from '@/api/zstack/QueryMdevDeviceSpecAction'
import { QueryPciDeviceSpecAction } from '@/api/zstack/QueryPciDeviceSpecAction'
import { VGpuType } from '@/hardware-resource/vgpu-device/vgpu-device.model'

@Injectable()
export class VGpuDeviceSpecDataloader {
  @Inject() queryPciDeviceSpecAction: QueryPciDeviceSpecAction
  @Inject() queryMdevDeviceSpecAction: QueryMdevDeviceSpecAction

  private resolvedVGpuDeviceSpecMap: any = {}

  private resolvedVGpuDeviceSpecDataLoader

  constructor() {
    this.resolvedVGpuDeviceSpecDataLoader = new DataLoader(this._query)
  }

  query(uuid, vgpuDeviceSpecUuid, type) {
    this.resolvedVGpuDeviceSpecMap[uuid] = {
      uuid,
      vgpuDeviceSpecUuid,
      type
    }
    return this.resolvedVGpuDeviceSpecDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const mdevDeviceSpecUuidList = []
    const pciDeviceSpecUuidList = []
    uuids.forEach(uuid => {
      if (this.resolvedVGpuDeviceSpecMap[uuid].type === VGpuType.MdevDevice) {
        mdevDeviceSpecUuidList.push(this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid)
      } else {
        pciDeviceSpecUuidList.push(this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid)
      }
    })
    const pciDeviceSpecResp = await this.queryPciDeviceSpecAction.call({
      conditions: [{ key: 'uuid', op: Op.in, values: pciDeviceSpecUuidList }]
    })
    const mdevDeviceSpecResp = await this.queryMdevDeviceSpecAction.call({
      conditions: [{ key: 'uuid', op: Op.in, values: mdevDeviceSpecUuidList }]
    })
    return uuids.map(uuid => {
      const inventories =
        this.resolvedVGpuDeviceSpecMap[uuid].type === VGpuType.MdevDevice
          ? mdevDeviceSpecResp.inventories
          : pciDeviceSpecResp.inventories
      const specInfo = inventories.find(
        item => item.uuid === this.resolvedVGpuDeviceSpecMap[uuid].vgpuDeviceSpecUuid
      )
      return specInfo ? specInfo : null
    })
  }
}
