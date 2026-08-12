import { Injectable, Inject } from '@nestjs/common'

import { Op, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ActionService } from '@/base/action-service'

import { PrimaryStorageQueryService } from '../primary-storage/primary-storage-query/primary-storage-query.service'
import { QueryMdsArgs } from './cbd-mds.model'

@Injectable()
export class CbdMdsService extends ActionService {
  @Inject()
  queryPrimaryStorageService: PrimaryStorageQueryService
  async queryMdsList(queryArg: QueryMdsArgs) {
    const { conditions = [], start = 0, limit } = queryArg
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'primaryStorageUuid',
      'addr',
      'connection.status'
    ])

    const extraConditions: Array<(val: any) => boolean> = []

    const { list: psList } = await this.queryPrimaryStorageService.query({
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: extraConditionMap.primaryStorageUuid?.value
        }
      ]
    })

    const mdsInfoList = psList?.[0]?.addonInfo?.mdsInfos

    if (extraConditionMap.addr?.value) {
      const addr = extraConditionMap.addr.value.toLocaleLowerCase()
      extraConditions.push(val => val.addr.toLocaleLowerCase().includes(addr))
    }

    if (extraConditionMap['connection.status']?.values) {
      const statusArr = extraConditionMap['connection.status'].values
      extraConditions.push(val => statusArr.includes(val.status))
    }

    const data = mdsInfoList.filter(val => extraConditions.every(fn => fn(val)))
    const total = data.length
    const list = data.slice(start, limit ? start + limit : total).map(val => ({
      ...val
    }))
    return { list, total }
  }
}
