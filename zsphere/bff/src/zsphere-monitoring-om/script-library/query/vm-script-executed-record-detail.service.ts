import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { GuestVmScriptExecutedRecordDetailQueryType } from '../script-library.model'

@Injectable()
export class QueryGuestVmScriptExecutedRecordDetailService {
  @Inject() zqlService: ZQLService

  private vmDataLoader

  constructor() {
    this.vmDataLoader = new DataLoader(this._getVmInstance)
  }

  async queryList(params: IQueryAction) {
    const { type = GuestVmScriptExecutedRecordDetailQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case GuestVmScriptExecutedRecordDetailQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getGuestVmScriptExecutedRecordDetailList(params, zqlCondition)

    return _resultResp
  }

  async getGuestVmScriptExecutedRecordDetailList(
    param: IQueryAction,
    zqlCondition: ZqlObject['condition']
  ) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const sortBy = param?.sortBy === 'createDate' ? 'startTime' : param?.sortBy

    const zqlObject = {
      action,
      tableName: 'GuestVmScriptExecutedRecordDetail',
      condition: zqlCondition,
      orderBy: sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const guestVmScriptExecutedRecordDetails = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: guestVmScriptExecutedRecordDetails,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = []] = extractAndRemoveExtraCondition(conditions, [])

    const specicalCondition = []

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getVmInstance(uuid) {
    return this.vmDataLoader.load(uuid)
  }

  _getVmInstance = async (uuids: string[]) => {
    const vmInstanceUuids = _.chunk(_.uniq(uuids), 100)

    let vmInventories = []

    await Promise.all(
      _.map(vmInstanceUuids, async uuids => {
        const vmZql = {
          tableName: 'VmInstance',
          fields: ['uuid', 'name', 'state'],
          condition: {
            uuid: {
              [ZOp.in]: uuids
            }
          }
        }
        const zql = ZQL.stringify(vmZql)
        const { results } = await this.zqlService.call(zql)

        vmInventories = _.concat(vmInventories, _.get(results, ['0', 'inventories'], []))
      })
    )

    const vmMap = _.reduce(
      vmInventories,
      (obj, it) => {
        obj[it?.uuid] = it

        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(vmMap, uuid, null))
  }
}
