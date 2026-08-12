import { Injectable, Inject } from '@nestjs/common'

import { Condition as ICondition, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryZceXThirdPartyPlatformAlertRefAction } from '@/api/zstack/QueryZceXThirdPartyPlatformAlertRefAction'
import { EmergencyLevel } from '@/common/enum'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'

import { ThirdPartyAlertsQueryType } from './zwatch-third-party-alerts.model'

@Injectable()
export class ThirdPartyAlertsService {
  @Inject() zqlService: ZQLService
  @Inject()
  queryZceXThirdPartyPlatformAlertRefAction: QueryZceXThirdPartyPlatformAlertRefAction

  async queryList(params: IQueryAction) {
    const { type = ThirdPartyAlertsQueryType.Normal } = params
    let _extrazqlConditions
    switch (type) {
      case ThirdPartyAlertsQueryType.Normal:
        break

      // 报警器记录
      case ThirdPartyAlertsQueryType.AlarmRecord:
        _extrazqlConditions = await this.getAlarmRecordConditions(params.extraConditions)
        break
      // 通知对象记录
      case ThirdPartyAlertsQueryType.EndpointRecord:
        _extrazqlConditions = await this.getEndpointRecordConditions(params.extraConditions)
      case ThirdPartyAlertsQueryType.ZCEX:
        _extrazqlConditions = await this.getZcexConditions(params.extraConditions)
        break
      default:
        break
    }

    const _zqlCondition = QueryConditionTranslator.translate(params.conditions)

    const zqlCondition = _extrazqlConditions
      ? {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            _extrazqlConditions
          )
        }
      : _zqlCondition

    const zqlObject = {
      tableName: 'ThirdpartyOriginalAlert',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    // 总数
    const total = results?.[0]?.total ?? 0
    return {
      list,
      total,
      unreadCount: list?.filter(it => it.readStatus === 'unRead').length || 0
    }
  }

  async getAlarmSummary(zceXUuid: string) {
    const zceXConditions = await this.getZcexConditions([{ key: 'zceXUuid', value: zceXUuid }])
    const { results: [{ inventoryCounts = [] }] = [{}] } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'ThirdpartyOriginalAlert',
        action: ZQLAction.COUNT,
        groupBy: 'alertLevel',
        condition: {
          readStatus: {
            [ZOp.eq]: 'Unread'
          },
          ...zceXConditions
        }
      })
    )

    const getCount = (level: EmergencyLevel) => {
      return inventoryCounts.find(item => item[0]?.alertLevel === level)?.[1] ?? 0
    }

    return {
      emergent: getCount(EmergencyLevel.Emergent),
      important: getCount(EmergencyLevel.Important),
      normal: getCount(EmergencyLevel.Normal)
    }
  }

  /**
   * 报警器的报警记录
   * @param extraConditions ICondition[]
   */
  async getAlarmRecordConditions(extraConditions: ICondition[]) {
    const conditionsMap: any = conditionsToObject(extraConditions)
    const uuidCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SNSEndpointThirdpartyAlertHistory',
            fields: ['alertUuid'],
            condition: {
              subscriptionUuid: conditionsMap?.subscriptionUuid
            }
          }
        }
      }
    }
    return uuidCondition
  }

  /**
   * 通知对象的报警记录
   * @param extraConditions ICondition[]
   */
  async getEndpointRecordConditions(extraConditions: ICondition[]) {
    const conditionsMap: any = conditionsToObject(extraConditions)
    const uuidCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SNSEndpointThirdpartyAlertHistory',
            fields: ['alertUuid'],
            condition: {
              endpointUuid: conditionsMap?.endpointUuid
            }
          }
        }
      }
    }
    return uuidCondition
  }
  /**
   * ZCEX的报警记录
   * @param extraConditions ICondition[]
   */
  async getZcexConditions(extraConditions: ICondition[]) {
    const conditionsMap: any = conditionsToObject(extraConditions)
    const uuidCondition = {
      thirdpartyPlatformUuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'zceXThirdPartyPlatformAlertRef',
            fields: ['thirdPartyPlatformUuid'],
            condition: {
              zceXUuid: conditionsMap?.zceXUuid
            }
          }
        }
      }
    }
    return uuidCondition
  }
}
