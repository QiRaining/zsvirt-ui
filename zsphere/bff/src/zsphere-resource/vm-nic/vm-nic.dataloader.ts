import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'

import { QueryVmNicService } from './query/query.service'
import { QueryVmNicArgs } from './vm-nic.model'

@Injectable()
export class VmNicDataloader {
  @Inject() queryVmNicService: QueryVmNicService

  private vmNicDataloader: any

  private vmNicMap: any = {}
  private params: QueryVmNicArgs = {}

  constructor() {
    this.vmNicDataloader = new DataLoader(this._query)
  }

  query(uuid, vmNicUuid, params: QueryVmNicArgs = {}) {
    this.vmNicMap[uuid] = {
      uuid,
      vmNicUuid
    }
    this.params = params
    return this.vmNicDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const vmNicUuids = uuids.map(uuid => this.vmNicMap[uuid].vmNicUuid)

    const { conditions: _conditions = [], ..._params } = this.params
    const conditions = _conditions.concat([{ key: 'uuid', op: Op.in, values: vmNicUuids }])

    const params = {
      conditions,
      start: 0,
      limit: 1000,
      ..._params
    }

    const resp = await this.queryVmNicService.query(params)

    const vmNicList = resp.list
    return uuids.map(uuid => {
      const vmNic = vmNicList.find(_vmNic => _vmNic.uuid === this.vmNicMap[uuid].vmNicUuid)
      if (vmNic) {
        return vmNic
      } else {
        return null
      }
    })
  }
}
