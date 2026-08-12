import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { find as _find } from 'lodash'

import { QueryParam as IQueryParam, Condition, Op } from '@/api/zstack/base/query-base'
import {
  QueryHostAction,
  QueryHostActionParam as IQueryHostActionParam
} from '@/api/zstack/QueryHostAction'
import {
  QueryMdevDeviceAction,
  QueryMdevDeviceResult as IQueryMdevDeviceResult
} from '@/api/zstack/QueryMdevDeviceAction'
import {
  QueryMdevDeviceSpecAction,
  QueryMdevDeviceSpecResult as IQueryMdevDeviceSpecResult
} from '@/api/zstack/QueryMdevDeviceSpecAction'
import {
  QueryPciDeviceAction,
  QueryPciDeviceResult as IQueryPciDeviceResult
} from '@/api/zstack/QueryPciDeviceAction'
import {
  QueryVmInstanceAction,
  QueryVmInstanceActionParam as IQueryVmInstanceActionParam
} from '@/api/zstack/QueryVmInstanceAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'

@Injectable()
export class MdevDeviceQueryService {
  @Inject() apiQueryPciDeviceAction: QueryPciDeviceAction
  @Inject() apiQueryMdevDeviceAction: QueryMdevDeviceAction
  @Inject() apiQueryMdevDeviceSpecAction: QueryMdevDeviceSpecAction
  @Inject() apiQueryVmInstanceAction: QueryVmInstanceAction
  @Inject() apiQueryHostAction: QueryHostAction

  private mdevDeviceSpecDataLoader
  private hostDataLoader
  private vmInstanceDataLoader

  private mdevDeviceSpecMap: any = {}
  private hostMap: any = {}
  private vmInstanceMap: any = {}

  constructor() {
    this.mdevDeviceSpecDataLoader = new DataLoader(this._getMdevDeviceSpec)
    this.hostDataLoader = new DataLoader(this._getHost)
    this.vmInstanceDataLoader = new DataLoader(this._getVmInstance)
  }

  async get(params: IQueryAction) {
    return await this.queryMdevDevice(params)
  }

  async queryMdevDevice(params: IQueryParam) {
    const resp = await this.apiQueryMdevDeviceAction.call(params)
    return {
      list: resp.inventories ?? [],
      total: resp.total
    }
  }

  getMdevDeviceSpec(uuid, mdevSpecUuid) {
    this.mdevDeviceSpecMap[uuid] = {
      uuid,
      mdevSpecUuid
    }
    return this.mdevDeviceSpecDataLoader.load(uuid)
  }

  _getMdevDeviceSpec = async (uuids: string[]) => {
    const mdevSpecUuids = uuids.map(uuid => this.mdevDeviceSpecMap[uuid].mdevSpecUuid)
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: mdevSpecUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryMdevDeviceSpecAction.call(params)
    const mdevDeviceSpecList = resp.inventories
    return uuids.map(uuid => {
      const mdevDeviceSpec = mdevDeviceSpecList.find(
        mdevDeviceSpec => mdevDeviceSpec.uuid === this.mdevDeviceSpecMap[uuid].mdevSpecUuid
      )
      if (mdevDeviceSpec) {
        return mdevDeviceSpec
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
    this.vmInstanceMap[uuid] = {
      uuid,
      vmInstanceUuid
    }
    return this.vmInstanceDataLoader.load(uuid)
  }

  _getVmInstance = async (uuids: string[]) => {
    const vmInstanceUuids = uuids.map(uuid => this.vmInstanceMap[uuid].vmInstanceUuid)
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: vmInstanceUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.apiQueryVmInstanceAction.call(params)
    const vmInstanceList = resp.inventories
    return uuids.map(uuid => {
      const vmInstance = vmInstanceList.find(
        vmInstance => vmInstance.uuid === this.vmInstanceMap[uuid].vmInstanceUuid
      )
      if (vmInstance) {
        return vmInstance
      } else {
        return null
      }
    })
  }
}
