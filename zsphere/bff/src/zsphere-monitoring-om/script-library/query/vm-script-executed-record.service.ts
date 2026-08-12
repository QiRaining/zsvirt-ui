import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { GuestVmScriptExecutedRecordQueryType } from '../script-library.model'

@Injectable()
export class QueryGuestVmScriptExecutedRecordService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = GuestVmScriptExecutedRecordQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case GuestVmScriptExecutedRecordQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getGuestVmScriptExecutedRecordList(params, zqlCondition)

    return _resultResp
  }

  async getGuestVmScriptExecutedRecordList(
    param: IQueryAction,
    zqlCondition: ZqlObject['condition']
  ) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const sortBy = param?.sortBy === 'createDate' ? 'startTime' : param?.sortBy

    const zqlObject = {
      action,
      tableName: 'GuestVmScriptExecutedRecord',
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
    const guestVmScriptExecutedRecords = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: guestVmScriptExecutedRecords,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'scriptType'
    ])

    const specicalCondition = []

    if (_extraConditionMap['scriptType']) {
      const scriptTypes = _.flatten(
        _.compact([_extraConditionMap['scriptType'].value, _extraConditionMap['scriptType'].values])
      )

      specicalCondition.push({
        scriptUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'GuestVmScript',
              fields: ['uuid'],
              condition: {
                scriptType: {
                  [ZOp.in]: scriptTypes
                }
              }
            }
          }
        }
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(_.concat(specicalCondition, extrazqlConditions))
    )

    return zqlCondition
  }
}
