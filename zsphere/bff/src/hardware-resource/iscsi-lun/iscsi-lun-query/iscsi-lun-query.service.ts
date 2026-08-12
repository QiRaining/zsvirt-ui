import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class IscsiLunQueryService {
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

    _resultResp = await this.getIscsiLunList(params, zqlCondition)

    return _resultResp
  }

  async getIscsiLunList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY

    const zqlObject = {
      action,
      tableName: 'IscsiLun',
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
    const iscsiLuns = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: iscsiLuns,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__GetUsedLunByIscsiServerUuids__', // 通过IscsiServer，获取被使用过的iSCSI-LUN
      '__GetUnUsedLunByIscsiServerUuids__', // 通过IscsiServer，获取未被使用过的iSCSI-LUN
      '__GetUsedLunByIscsiTargetUuids__', // 通过iqn，获取被使用过的iSCSI-LUN
      '__GetUnUsedLunByIscsiTargetUuids__' // 通过iqn，获取未被使用过的iSCSI-LUN
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'IscsiLunVO')
      )
    }

    if (_extraConditionMap['__GetUsedLunByIscsiServerUuids__']) {
      const iscsiServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByIscsiServerUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByIscsiServerUuids__']?.values
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
            'iscsiTarget.iscsiServerUuid': {
              [ZOp.in]: iscsiServerUuids
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']) {
      const iscsiServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']?.values
        ])
      )

      specicalCondition.push({
        'iscsiTarget.iscsiServerUuid': {
          [ZOp.in]: iscsiServerUuids
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

    if (_extraConditionMap['__GetUsedLunByIscsiTargetUuids__']) {
      const iscsiTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByIscsiTargetUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByIscsiTargetUuids__']?.values
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
            iscsiTargetUuid: {
              [ZOp.in]: iscsiTargetUuids
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']) {
      const iscsiTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']?.values
        ])
      )

      specicalCondition.push({
        iscsiTargetUuid: {
          [ZOp.in]: iscsiTargetUuids
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
