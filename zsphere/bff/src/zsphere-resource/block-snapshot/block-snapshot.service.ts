import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVolumeSnapshotSizeAction } from '@/api/zstack/GetVolumeSnapshotSizeAction'
import { QueryVolumeSnapshotAction } from '@/api/zstack/QueryVolumeSnapshotAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'
import DataLoader = require('dataloader')

@Injectable()
export class BlockSnapshotService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() queryVolumeSnapshotAction: QueryVolumeSnapshotAction
  @Inject() getVolumeSnapshotSizeAction: GetVolumeSnapshotSizeAction

  async queryList(param: IQueryAction) {
    const zqlCondition = QueryConditionTranslator.translate(param.conditions)

    const zqlObject = {
      tableName: 'volumeSnapshot',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list,
      total
    }
  }

  // ceph存储下没法直接获取size 需采用此方法获取
  async getActualSize(uuid) {
    const result = await this.getVolumeSnapshotSizeAction.call({
      uuid
    })
    return result.actualSize
  }
}
