import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class FiberChannelLunQueryService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = 'NORMAL' } = params
    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case 'NORMAL':
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getFiberChannelLunList(params, zqlCondition)

    return _resultResp
  }

  async getFiberChannelLunList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY

    const zqlObject = {
      action,
      tableName: 'FiberChannelLun',
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
    const FiberChannelLuns = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: FiberChannelLuns,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__GetUsedLunByFiberChannelStorageUuids__', // 通过FiberChannelStorage，获取被使用过的FiberChannelLun
      '__GetUnUsedLunByFiberChannelStorageUuids__' // 通过FiberChannelStorage，获取未被使用过的FiberChannelLun
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'FiberChannelLunVO')
      )
    }

    if (_extraConditionMap['__GetUsedLunByFiberChannelStorageUuids__']) {
      const fiberChannelStorageUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByFiberChannelStorageUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByFiberChannelStorageUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                wwid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SharedBlock',
                      fields: ['diskUuid']
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'ScsiLunVmInstanceRef',
                      fields: ['scsiLunUuid']
                    }
                  }
                }
              }
            ]
          },
          {
            fiberChannelStorageUuid: {
              [ZOp.in]: fiberChannelStorageUuids
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByFiberChannelStorageUuids__']) {
      const fiberChannelStorageUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByFiberChannelStorageUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByFiberChannelStorageUuids__']?.values
        ])
      )

      specicalCondition.push({
        fiberChannelStorageUuid: {
          [ZOp.in]: fiberChannelStorageUuids
        },
        wwid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SharedBlock',
              fields: ['diskUuid']
            }
          }
        },
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ScsiLunVmInstanceRef',
              fields: ['scsiLunUuid']
            }
          }
        }
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }
}
