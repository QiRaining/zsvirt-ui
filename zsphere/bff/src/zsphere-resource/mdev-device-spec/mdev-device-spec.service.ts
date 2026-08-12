import { Injectable, Inject } from '@nestjs/common'
import { assign as _assign, cloneDeep as _cloneDeep } from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryMdevDeviceSpecAction } from '@/api/zstack/QueryMdevDeviceSpecAction'
import { UpdateMdevDeviceSpecAction } from '@/api/zstack/UpdateMdevDeviceSpecAction'
import { ActionService } from '@/base/action-service'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { mergeZqlObject } from '@/common/zql/queryConditionTranslator'

import { MdevDeviceSpecQueryType } from './mdev-device-spec.model'
@Injectable()
export class MdevDeviceSpecService extends ActionService {
  @Inject() queryMdevDeviceSpecAction: QueryMdevDeviceSpecAction
  @Inject() updateMdevDeviceSpecAction: UpdateMdevDeviceSpecAction
  @Inject() zqlService: ZQLService
  async queryMdevDeviceSpec(param) {
    const { type = MdevDeviceSpecQueryType.Normal } = param
    let shareTypeZqlCondition
    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(
      _cloneDeep(param.conditions),
      ['shareType']
    )

    if (conditionMap.shareType) {
      const { values = [] } = conditionMap.shareType
      shareTypeZqlCondition = QueryConditionTranslator.generateShareTypeZqlConditon(
        values,
        'MdevDeviceSpecVO'
      )
    }

    let zqlCondition = QueryConditionTranslator.translate(_conditions)
    switch (type) {
      case MdevDeviceSpecQueryType.Normal:
        zqlCondition = _assign(zqlCondition, {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'pcidevicemdevspecref',
                fields: 'mdevSpecUuid',
                condition: {
                  effective: true
                }
              }
            }
          }
        })
        break
      case MdevDeviceSpecQueryType.GetMdevDeviceCandidatesForGenerate:
      default:
        break
    }
    let zqlObject: any = {
      tableName: 'mdevDeviceSpec',
      condition: zqlCondition,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }

    if (shareTypeZqlCondition) {
      zqlObject = mergeZqlObject(zqlObject, {
        condition: shareTypeZqlCondition
      })
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    return {
      list: resp.results[0].inventories,
      total: resp.results[0].total
    }
  }
}
