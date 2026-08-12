import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { QueryParam as IQueryParam, Op } from '@/api/zstack/base/query-base'
import { QueryPciDeviceAction } from '@/api/zstack/QueryPciDeviceAction'

@Injectable()
export class PciDeviceDataloader {
  @Inject() apiQueryPciDeviceAction: QueryPciDeviceAction

  private resolvedPciDeviceInfoDataLoader

  private resolvedPciDeviceInfo: any = {}

  constructor() {
    this.resolvedPciDeviceInfoDataLoader = new DataLoader(this._query)
  }

  query(uuid, pciDeviceUuid) {
    this.resolvedPciDeviceInfo[uuid] = {
      uuid,
      pciDeviceUuid
    }
    return this.resolvedPciDeviceInfoDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
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
}
