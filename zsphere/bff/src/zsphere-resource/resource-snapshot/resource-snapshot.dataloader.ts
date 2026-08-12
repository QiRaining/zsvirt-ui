import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get, sumBy } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CheckVolumeSnapshotGroupAvailabilityAction } from '@/api/zstack/CheckVolumeSnapshotGroupAvailabilityAction'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { RevertState } from './resource-snapshot.model'

@Injectable()
export class SnapshotGroupAvailabilityDataloader {
  @Inject() _action: CheckVolumeSnapshotGroupAvailabilityAction

  private _loader: any

  private _maper: any = {}

  constructor() {
    this._loader = new DataLoader(this._query)
  }
  query(uuid, groupUuid) {
    this._maper[uuid] = {
      uuid,
      groupUuid
    }
    return this._loader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const groupUuids = uuids.map(uuid => this._maper[uuid].groupUuid)
    const params = {
      uuids: groupUuids
    }
    const resp = await this._action.call(params)
    return uuids.map(uuid => {
      const result = resp.results.find(group => group.uuid === this._maper[uuid].groupUuid)
      return {
        revertState: result.available ? RevertState.Available : RevertState.Unable,
        reason: result.reason,
        uuid: result.uuid
      }
    })
  }
}

@Injectable()
export class SnapshotGroupDataloader {
  private _loader: any

  @Inject() zqlService: ZQLService

  constructor() {
    this._loader = new DataLoader(this._query)
  }

  query(uuid) {
    return this._loader.load(uuid)
  }

  _query = async (uuids: readonly string[]) => {
    const multZql: ZqlObject[] = uuids.map(uuid => {
      return {
        tableName: 'volumeSnapshotGroup',
        condition: {
          uuid: uuid
        },
        namedAs: uuid
      }
    })
    const zql = ZQL.multStringify(multZql)
    const { results } = await this.zqlService.call(zql)

    return uuids.map(uuid => {
      const resource = results?.find(_hy => _hy.name === uuid)
      const result = get(resource, 'inventories[0]', null)
      return result
    })
  }
}

@Injectable()
export class SnapshotGroupSizeDataloader {
  private _loader: any

  @Inject() zqlService: ZQLService

  constructor() {
    this._loader = new DataLoader(this._query)
  }

  query(uuid) {
    return this._loader.load(uuid)
  }

  _query = async (uuids: readonly string[]) => {
    const multZql: ZqlObject[] = uuids.map(uuid => {
      return {
        tableName: 'volumeSnapshot',
        condition: {
          groupUuid: uuid
        },
        namedAs: uuid
      }
    })
    const zql = ZQL.multStringify(multZql)
    const { results } = await this.zqlService.call(zql)

    return uuids.map(uuid => {
      const resource = results?.find(_hy => _hy.name === uuid)
      const inventories = get(resource, 'inventories', [])
      const total = sumBy(inventories, 'size')
      return total
    })
  }
}
