import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { conditionsToObject } from '@/api/zstack/base/query-base'
import { CleanUpTrashOnBackupStorageAction } from '@/api/zstack/CleanUpTrashOnBackupStorageAction'
import { CleanUpTrashOnPrimaryStorageAction } from '@/api/zstack/CleanUpTrashOnPrimaryStorageAction'
import { GetTrashOnBackupStorageAction } from '@/api/zstack/GetTrashOnBackupStorageAction'
import { GetTrashOnPrimaryStorageAction } from '@/api/zstack/GetTrashOnPrimaryStorageAction'
import { ActionService } from '@/base/action-service'

import { Trash as ITrash, TrashQueryType, QueryTrashArgs } from './trash.model'

@Injectable()
export class TrashService extends ActionService {
  @Inject() getTrashOnBackupStorageAction: GetTrashOnBackupStorageAction
  @Inject() getTrashOnPrimaryStorageAction: GetTrashOnPrimaryStorageAction
  @Inject()
  cleanUpTrashOnBackupStorageAction: CleanUpTrashOnBackupStorageAction
  @Inject()
  cleanUpTrashOnPrimaryStorageAction: CleanUpTrashOnPrimaryStorageAction

  constructor() {
    super()
  }

  async queryTrashList(queryArg: QueryTrashArgs) {
    const { type = TrashQueryType.PrimaryStorage } = queryArg
    const conditionsMap = conditionsToObject(queryArg.conditions) as {
      uuid: string
    }
    const uuid = conditionsMap.uuid
    let _resultResp = null
    switch (type) {
      // PrimaryStorage
      case TrashQueryType.PrimaryStorage:
        _resultResp = await this.getTrashOnPrimaryStorageAction.call({
          uuid
        } as GetTrashActionParam)
        break

      // BackupStorage
      case TrashQueryType.BackupStorage:
        _resultResp = await this.getTrashOnBackupStorageAction.call({
          uuid
        } as GetTrashActionParam)
        break

      default:
        break
    }
    const trashList = _.chunk(_resultResp.inventories, queryArg.limit)
    // 当前页数据
    let trashPageList = trashList[queryArg.start / queryArg.limit] as ITrash[]
    // 处理当前页数据相关字段
    trashPageList = trashPageList?.map(item => {
      item.uuid = item.trashId
      return item
    })
    return {
      list: trashPageList ?? [],
      total: _resultResp.inventories?.length ?? 0
    }
  }
}

export interface GetTrashActionParam {
  uuid: string
}

export interface CleanUpTrashActionParam {
  uuid: string
  trashId?: number
}

export interface ISize {
  size: number
}

export interface IRespList {
  result: ISize
}
