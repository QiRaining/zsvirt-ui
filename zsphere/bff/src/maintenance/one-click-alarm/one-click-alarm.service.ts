import { Injectable, Inject } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetActiveAlarmStatusAction } from '@/api/zstack/GetActiveAlarmStatusAction'
import { QueryActiveAlarmTemplateAction } from '@/api/zstack/QueryActiveAlarmTemplateAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

import { genUuid } from '../../utils'
@Injectable()
export class OneClickAlarmService extends ActionService {
  @Inject() queryActiveAlarmTemplateAction: QueryActiveAlarmTemplateAction
  @Inject() getActiveAlarmStatusAction: GetActiveAlarmStatusAction
  @Inject() zqlService: ZQLService

  getActiveAlarmTemplate = async (params: QueryAction) => {
    const { inventories, total } = await this.queryActiveAlarmTemplateAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  getActiveAlarmStatus = async param => {
    const { statuses } = await this.getActiveAlarmStatusAction.call({
      accountUuid: param
    })
    //页面列表需要uuid
    statuses.forEach(element => {
      element['uuid'] = genUuid()
    })
    return {
      list: statuses
    }
  }
  getActiveAlarm = async params => {
    const zqlObject = {
      tableName: 'Alarm',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ActiveAlarm',
              fields: ['alarmUuid'],
              condition: {
                templateUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'ActiveAlarmTemplate',
                      fields: ['uuid'],
                      condition: {
                        namespace: {
                          [ZOp.in]: params
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return {
      list: results[0].inventories,
      total: results[0].inventories?.length
    }
  }
  queryActiveAlarmTemplate = async namespace => {
    const zqlObject = {
      tableName: 'ActiveAlarmTemplate',
      condition: {
        namespace
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return results?.[0].inventories
  }
  getResourceCount = async zoneUuid => {
    const { vmTotal } = await this._getVmCount(zoneUuid)
    const { hostTotal } = await this._getHostCount(zoneUuid)
    const { vpcRouterTotal } = await this._getVpcRouterCount(zoneUuid)
    return {
      vmTotal,
      hostTotal,
      vpcRouterTotal
    }
  }
  _getVmCount = async zoneUuid => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'vminstance',
      condition: {
        state: {
          [ZOp.ne]: 'Destroyed'
        },
        zoneUuid: {
          [ZOp.eq]: zoneUuid
        },
        type: {
          [ZOp.eq]: 'UserVm'
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return {
      vmTotal: results[0]?.total
    }
  }
  _getHostCount = async zoneUuid => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'host',
      condition: {
        hypervisorType: {
          [ZOp.notIn]: ['ESX', 'baremetal2']
        },
        zoneUuid: {
          [ZOp.eq]: zoneUuid
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return {
      hostTotal: results[0]?.total
    }
  }

  _getVpcRouterCount = async zoneUuid => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'VpcRouterVm',
      condition: {
        haStatus: {
          [ZOp.eq]: 'NoHa'
        },
        zoneUuid: {
          [ZOp.eq]: zoneUuid
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return {
      vpcRouterTotal: results[0]?.total
    }
  }
}
