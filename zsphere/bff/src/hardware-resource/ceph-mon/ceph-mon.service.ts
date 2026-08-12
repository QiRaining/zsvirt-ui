import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { AddMonToCephBackupStorageAction } from '@/api/zstack/AddMonToCephBackupStorageAction'
import { AddMonToCephPrimaryStorageAction } from '@/api/zstack/AddMonToCephPrimaryStorageAction'
import { Op, conditionsToObject, Condition as ICondition } from '@/api/zstack/base/query-base'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { RemoveMonFromCephBackupStorageAction } from '@/api/zstack/RemoveMonFromCephBackupStorageAction'
import { RemoveMonFromCephPrimaryStorageAction } from '@/api/zstack/RemoveMonFromCephPrimaryStorageAction'
import { UpdateCephBackupStorageMonAction } from '@/api/zstack/UpdateCephBackupStorageMonAction'
import { UpdateCephPrimaryStorageMonAction } from '@/api/zstack/UpdateCephPrimaryStorageMonAction'
import { ActionService } from '@/base/action-service'

import {
  CephMon as IMons,
  AddMonsInput,
  CephMonType,
  QueryMonsArgs,
  UpdateMonsInput,
  DeleteMonsInput
} from './ceph-mon.model'

@Injectable()
export class CephMonService extends ActionService {
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject() addMonToCephBackupStorageAction: AddMonToCephBackupStorageAction
  @Inject() addMonToCephPrimaryStorageAction: AddMonToCephPrimaryStorageAction
  @Inject() updateCephBackupStorageMonAction: UpdateCephBackupStorageMonAction
  @Inject()
  updateCephPrimaryStorageMonAction: UpdateCephPrimaryStorageMonAction
  @Inject()
  removeMonFromCephBackupStorageAction: RemoveMonFromCephBackupStorageAction
  @Inject()
  removeMonFromCephPrimaryStorageAction: RemoveMonFromCephPrimaryStorageAction

  constructor() {
    super()
  }

  async queryMonsList(queryArg: QueryMonsArgs) {
    const { type = CephMonType.PrimaryStorage } = queryArg
    const {
      uuid = '',
      monAddr,
      monUuid,
      status
    } = conditionsToObject(queryArg.conditions) as {
      uuid: string
      monAddr?: string
      monUuid?: string
      status?: string
    }
    const conditions: ICondition[] = [
      {
        key: 'uuid',
        op: Op.eq,
        value: uuid
      }
    ]

    let _resultResp = null
    switch (type) {
      // PrimaryStorage
      case CephMonType.PrimaryStorage:
        _resultResp = await this.queryPrimaryStorageAction.call({ conditions })
        break

      // BackupStorage
      case CephMonType.BackupStorage:
        _resultResp = await this.queryBackupStorageAction.call({ conditions })
        break

      default:
        break
    }

    let monsData: Array<IMons> = []
    if (status?.length > 0) {
      monsData = _resultResp?.inventories?.[0]?.mons?.filter((mon: IMons) =>
        status.includes(mon?.status)
      )
    } else {
      monsData = _resultResp?.inventories?.[0]?.mons
    }
    // 处理搜索monAddr和monUuid
    if (monAddr) {
      monsData = _resultResp?.inventories?.[0]?.mons?.filter((mon: IMons) =>
        mon?.monAddr?.includes(monAddr)
      )
    }
    if (monUuid) {
      monsData = _resultResp?.inventories?.[0]?.mons?.filter((mon: IMons) =>
        mon?.monUuid?.includes(monUuid)
      )
    }
    const monsList = _.chunk(monsData, queryArg.limit)
    // 当前页数据
    let monsPageList = monsList[queryArg.start / queryArg.limit] as IMons[]
    // 处理当前页数据相关字段
    monsPageList = monsPageList?.map(item => {
      item.uuid = item.monUuid
      return item
    })
    return {
      list: monsPageList ?? [],
      total: _resultResp?.inventories?.[0]?.mons?.length ?? 0
    }
  }
}

export interface RemoveMonFromCephActionParam {
  uuid: string
  monHostnames: string[]
}

export interface AddMonToCephActionParam {
  uuid: string
  monUrls: string[]
}

export interface UpdateCephMonActionParam {
  monUuid: string
  hostname?: string
  sshUsername?: string
  sshPassword?: string
  sshPort?: number
  monPort?: number
}
