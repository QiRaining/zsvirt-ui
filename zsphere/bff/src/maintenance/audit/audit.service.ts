import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { Op, conditionsToObject, QueryParam as IQueryParam } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAuditDataAction } from '@/api/zstack/GetAuditDataAction'
import { GetCurrentTimeAction } from '@/api/zstack/GetCurrentTimeAction'
import { GetPlatformTimeZoneAction } from '@/api/zstack/GetPlatformTimeZoneAction'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { ActionService } from '@/base/action-service'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { QueryAuditArgs } from './audit.model'

@Injectable()
export class AuditService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() getAuditDataAction: GetAuditDataAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() getCurrentTimeAction: GetCurrentTimeAction
  @Inject() getPlatformTimeZoneAction: GetPlatformTimeZoneAction
  @Inject() getResourceNamesAction: GetResourceNamesAction

  private operatorDataLoader
  private currentResourceNameDataLoader
  private auditOperatorMap: any = {}

  constructor() {
    super()
    this.operatorDataLoader = new DataLoader(this._getOperators)
    this.currentResourceNameDataLoader = new DataLoader(this._getCurrentResourceName)
  }

  async queryAuditList(queryArg: QueryAuditArgs) {
    // resourceUuid 和搜索框数据保存在 conditions 数组中，其他保存在 extraConditions
    const { conditions = [], extraConditions = [] } = queryArg
    const extraConditionsMap = conditionsToObject(extraConditions)
    const specialConditionKeys = ['apiName', 'operatorAccountName', 'isError']
    const specialConditions = _.remove(conditions, condition =>
      specialConditionKeys.includes(condition.key)
    )
    const specialConditionMap = conditionsToObject(specialConditions)

    // APIName 搜索
    const searchConditions: any = []
    if (specialConditionMap['apiName']) {
      // apiName 字段格式为 org.zstack.XXXXX.YYYYY.API********Msg
      searchConditions.push({
        apiName: {
          [ZOp.like]: `%.API%${specialConditionMap['apiName']}%Msg`
        }
      })
    }

    if (specialConditionMap['operatorAccountName']) {
      searchConditions.push({
        operator: {
          [ZOp.like]: `%${specialConditionMap['operatorAccountName']}%`
        }
      })
    }

    // 任务结果 筛选
    if (specialConditionMap['isError']?.length === 1) {
      const val = specialConditionMap['isError'][0] === 'Success'
      searchConditions.push({
        success: {
          [ZOp.eq]: val
        }
      })
    }

    if (extraConditionsMap['startTime']) {
      searchConditions.push({
        createTime: {
          [ZOp.gte]: extraConditionsMap['startTime']
        }
      })
    }

    if (extraConditionsMap['endTime']) {
      searchConditions.push({
        createTime: {
          [ZOp.lte]: extraConditionsMap['endTime']
        }
      })
    }

    if (extraConditionsMap['auditType'] === 'Login') {
      searchConditions.push({
        resourceType: {
          [ZOp.eq]: 'SessionVO'
        }
      })
    } else {
      searchConditions.push({
        resourceType: {
          [ZOp.ne]: 'SessionVO'
        }
      })
    }

    const zqlCondition = QueryConditionTranslator.translate(conditions, searchConditions)

    const zqlObject: ZqlObject = {
      tableName: 'Audits',
      condition: zqlCondition,
      orderBy:
        !queryArg.sortBy || queryArg.sortBy === 'createDate' ? 'createTime' : queryArg.sortBy,
      orderDirection: queryArg.sortDirection ?? 'desc',
      limit: queryArg.limit,
      offset: queryArg.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const { inventories = [], total = 0 } = resp?.results?.[0] ?? {}

    // 处理当前页数据相关字段
    const list = inventories.map(item => {
      const response = JSON.parse(item.responseDump)
      item.responseUuid = response.id
      // 转换 isError 字段
      if (item.apiName === 'CreateResourceStack') {
        if (response.inventory.status === 'Rollbacked' && response.inventory.reason) {
          item.isError = true
          item.reason = response.inventory.reason // 错误消息
        }
      }
      if (!!item.error) {
        item.isError = true
      }
      // 转换 createTime 字段
      item.time = item.createTime
      item.createTime = item.time - item.duration
      // 转换apiName
      item.apiName = item.apiName.slice(item.apiName.indexOf('API') + 3, -3)
      return item
    })

    return { list, total }
  }

  /**
   * 审计列表子项的普通查询
   * @param operatorAccountUuid
   */
  getOperator(uuid, operatorAccountUuid) {
    this.auditOperatorMap[uuid] = {
      uuid,
      operatorAccountUuid
    }
    return this.operatorDataLoader.load(uuid)
  }

  private _getOperators = async (uuids: string[]) => {
    const operatorAccountUuids = _.chain(uuids)
      .map(uuid => this.auditOperatorMap[uuid].operatorAccountUuid)
      .uniq()
      .value()
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: operatorAccountUuids }],
      start: 0,
      limit: 1000
    }

    const accountResp = await this.queryAccountAction.call(params)

    const accounts = accountResp.inventories

    return uuids.map(uuid => {
      const account = accounts.find(
        account => account.uuid === this.auditOperatorMap[uuid].operatorAccountUuid
      )

      if (account) {
        return account?.name
      } else {
        return null
      }
    })
  }

  getCurrentResourceName(uuid: string) {
    return this.currentResourceNameDataLoader.load(uuid)
  }

  private _getCurrentResourceName = async (uuids: string[]) => {
    const result = await this.getResourceNamesAction.call({
      uuids: _.uniq(uuids)
    })
    const resourceNames = result?.inventories ?? []
    const resourceNameMap = new Map(resourceNames.map(item => [item.uuid, item]))
    return uuids.map(uuid => resourceNameMap.get(uuid))
  }

  async getCurrentTime() {
    const [{ currentTime }, b] = await Promise.all([
      this.getCurrentTimeAction.call({} as object),
      this.getPlatformTimeZoneAction.call({} as object)
    ])

    return {
      currentTime,
      ...b
    }
  }
}
