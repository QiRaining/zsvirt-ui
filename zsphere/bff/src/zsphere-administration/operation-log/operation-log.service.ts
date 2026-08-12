import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAuditDataAction } from '@/api/zstack/GetAuditDataAction'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { Condition, QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql'
import { AuditService } from '@/maintenance/audit/audit.service'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

dayjs.extend(utc)
dayjs.extend(timezone)
import { Op as SOp } from 'sequelize'

import { GlobalIdentityEnum } from '@/global/global.model'

import { OperationLog } from './operation-log.model'

@Injectable()
export class OperationLogService extends ActionService {
  @InjectModel(ZsAction) private zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsLongJob) private zsLongjob: typeof ZsLongJob
  @Inject() getResourceNameAction: GetResourceNamesAction
  @Inject() getAuditDataAction: GetAuditDataAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() ZqlService: ZQLService
  @Inject() dataProtectionService: DataProtectionService
  @Inject() auditService: AuditService

  private _queryAlarmZhName = async (uuids: string[]) => {
    if (uuids.length === 0) {
      return new Map()
    }
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'name::cn::%'
        }
      }
    })
    const resp = await this.ZqlService.call(zql)
    const list = resp.results?.[0]?.inventories ?? []
    return new Map(list.map(({ resourceUuid, tag }) => [resourceUuid, tag.split('::')[2]]))
  }

  private _queryResourceName = async (params: { apiId: string; locale: string }[]) => {
    const apiIds = params.map(item => item.apiId)

    // todo 后端暂不支持批量查询 4.1.1
    const zql = ZQL.stringify({
      tableName: 'audits',
      condition: {
        requestUuid: {
          [ZOp.in]: apiIds
        }
      }
    })

    const { results } = await this.ZqlService.call(zql)

    const resourceUuids = results[0]?.inventories
      .flat(Infinity)
      .filter(cv => cv?.resourceUuid)
      .map(cv => cv.resourceUuid)
    if (resourceUuids.length === 0) {
      return apiIds.map(() => null)
    }
    const { inventories } = await this.getResourceNameAction.call({
      uuids: resourceUuids
    })

    return apiIds.map(apiId => {
      const targetIds = results[0]?.inventories
        .flat(Infinity)
        .filter(cv => cv?.requestUuid === apiId)
        ?.map(cv => cv?.resourceUuid)
      if (targetIds.length) {
        return (
          inventories
            .filter(cv => targetIds.includes(cv.uuid))
            ?.map(item => item.resourceName)
            // 不展示没有resourceName的资源
            ?.filter(cv => cv)
            .join('/')
        )
      }
      return null
    })
  }
  private _queryUserName = async (userIds: string[]) => {
    const { inventories } = await this.getResourceNameAction.call({
      uuids: userIds
    })
    return userIds.map(id => {
      for (const i of inventories) {
        if (i.uuid === id) {
          return i.resourceName
        }
      }
      return null
    })
  }

  _queryResourceNameForAction = async (resourceUuidsArray: string[][]) => {
    const resourceUuids = _.flatten(resourceUuidsArray)
    const { inventories } = await this.getResourceNameAction.call({
      uuids: resourceUuids
    })
    return resourceUuidsArray.map(uuids => {
      const result = inventories
        .filter(it => uuids.indexOf(it.uuid) > -1)
        .map(it => it.resourceName)
      return result
    })
  }

  private resourceNameDataloader = new DataLoader<{ apiId: string; locale: string }, any, string>(
    this._queryResourceName,
    { cacheKeyFn: item => item.apiId }
  )
  private userNameDataloader = new DataLoader(this._queryUserName)
  private resourceNameForActionDataloader = new DataLoader(this._queryResourceNameForAction)

  transformConditions = (conditions: Condition[]): any => {
    const options = conditions.reduce(
      (opt, cv) => {
        const { key, value, values, op = Op.eq } = cv
        const getConditionValue = value => {
          if (op === Op.like || op === Op.notLike) {
            return `%${value.replace(/(_|%)/g, '\\$1')}%`
          }
          return value
        }
        opt[SOp.and].push({
          [key]: {
            [SOp[op]]: getConditionValue(value) ?? values
          }
        })
        return opt
      },
      {
        [SOp.and]: []
      }
    )
    return options
  }

  async queryAction(queryParams: QueryAction) {
    const { conditions, sortBy = 'createDate', sortDirection = 'desc', start, limit } = queryParams

    const transformCondition = conditions.map(ele => {
      if (ele.key === 'accountName' && ele.value === GlobalIdentityEnum.ADMIN_UUID) {
        return { op: ele.op, key: 'userId', value: ele.value }
      } else {
        return ele
      }
    })
    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(transformCondition, [
      'accountName',
      'createDateDuration'
    ])
    if (conditionMap.accountName) {
      const zql = ZQL.stringify({
        action: ZQLAction.QUERY,
        tableName: 'IAM2VirtualID',
        fields: ['uuid'],
        condition: {
          name: {
            [ZOp.like]: conditionMap.accountName.value
          }
        }
      })
      const [
        { inventories: accounts },
        {
          results: [{ inventories: iam2Accounts }]
        }
      ] = await Promise.all([
        this.queryAccountAction.call({
          conditions: [
            {
              key: 'name',
              value: conditionMap.accountName.value,
              op: Op.like
            }
          ],
          fields: ['uuid']
        }),
        this.ZqlService.call(zql) // 走zql防止没权限报错
      ])
      const uuids = accounts.concat(iam2Accounts).map(cv => cv.uuid)
      transformCondition.push({
        key: 'userId',
        values: uuids,
        op: Op.in
      })
    }
    if (conditionMap.createDateDuration) {
      const [amount, unit] = JSON.parse(conditionMap.createDateDuration.value)
      const timezone = (await this.auditService.getCurrentTime()).timezone
      const startTime = (timezone ? dayjs().tz(timezone) : dayjs()).subtract(amount, unit)
      const endTime = timezone ? dayjs().tz(timezone) : dayjs()

      transformCondition.push(
        {
          key: 'createDate',
          op: Op.gte,
          value: startTime.format('YYYY-MM-DD HH:mm:ss')
        },
        {
          key: 'createDate',
          op: Op.lte,
          value: endTime.format('YYYY-MM-DD HH:mm:ss')
        }
      )
    }
    const whereOpt = this.transformConditions(transformCondition)
    let list = []
    let total = 0
    try {
      const { rows, count } = await this.zsAction.findAndCountAll({
        where: whereOpt,
        limit,
        offset: start,
        order: [[sortBy, sortDirection]],
        // raw: true,
        // 取消内联查询导致的重复数据
        distinct: true,
        attributes: [
          'id',
          'actionId',
          'key',
          'name',
          'userName',
          'resourceUuids',
          'loginIp',
          'status',
          'userId',
          'createDate',
          'lastOpDate',
          'progress'
        ],
        include: [
          {
            model: this.zsLongjob,
            as: 'longjobs',
            attributes: {
              exclude: ['actionId']
            }
          },
          {
            model: this.zsActionTask,
            as: 'operationTasks',
            include: [
              {
                model: this.zsActionApi,
                as: 'operationApis',
                attributes: {
                  exclude: ['actionId', 'resources']
                },
                include: [
                  {
                    model: this.zsLongjob,
                    as: 'longjob',
                    attributes: {
                      exclude: ['actionId']
                    }
                  }
                ]
              }
            ]
          }
        ]
      })
      list = rows.map(cv => cv.toJSON())
      list.forEach(item => {
        const apiWithLongJob = []
        item?.operationTasks?.forEach(_item => {
          _item.operationApis?.forEach(__item => {
            const lb = __item?.longjob
            if (lb) {
              apiWithLongJob.push(lb)
            }
          })
        })
        item.longjobs = item.longjobs.concat(apiWithLongJob)
      })
      total = count
    } catch (e) {
      console.log(e)
    }
    return {
      list: list.map(action => ({
        ...action,
        accountName: action.userName
      })),
      total
    }
  }

  async queryActionTask(queryParams: QueryAction) {
    const { conditions, sortBy = 'createDate', sortDirection = 'desc', start, limit } = queryParams
    const whereOpt = this.transformConditions(conditions)
    const { rows, count: total } = await this.zsActionTask.findAndCountAll({
      where: whereOpt,
      distinct: true,
      limit,
      offset: start,
      order: [[sortBy, sortDirection]],
      include: [
        {
          model: this.zsActionApi,
          as: 'operationApis'
        }
      ]
    })
    return {
      list: rows.map(cv => cv.toJSON()),
      total
    }
  }

  async queryActionApi(queryParams: QueryAction) {
    const { conditions, sortBy = 'createDate', sortDirection = 'desc', start, limit } = queryParams
    const whereOpt = this.transformConditions(conditions)
    const { rows, count: total } = await this.zsActionApi.findAndCountAll({
      where: whereOpt,
      distinct: true,
      limit,
      offset: start,
      order: [[sortBy, sortDirection]]
    })
    return {
      list: rows.map(cv => cv.toJSON()),
      total
    }
  }

  async queryLongjob(queryParams: QueryAction) {
    const { conditions, sortBy = 'createDate', sortDirection = 'desc', start, limit } = queryParams
    const whereOpt = this.transformConditions(conditions)
    const { rows, count: total } = await this.zsLongjob.findAndCountAll({
      where: whereOpt,
      limit,
      offset: start,
      order: [[sortBy, sortDirection]]
    })
    return {
      list: rows.map(cv => cv.toJSON()),
      total
    }
  }

  async queryResourceName(apiId: string, locale = 'zh-CN') {
    return await this.resourceNameDataloader.load({ apiId, locale })
  }
  async queryUserName(userId: string) {
    return await this.userNameDataloader.load(userId)
  }

  async queryResourceNameForAction(resourceUuids: string[]) {
    return await this.resourceNameForActionDataloader.load(resourceUuids)
  }

  async checkDataIntegrity(operationLog: OperationLog) {
    const { enabled } = this.dataProtectionService.get()
    if (!enabled) {
      return true
    }
    const sessionId = this.getSessionId()

    const { startDays = 0 } = await this.dataProtectionService.buildDataProtectRangeWhereOpt({
      uiConfigName: 'cryptocompliance.dataprotection.operationLogDays'
    })

    const apis = _.flatten(operationLog?.operationTasks.map(task => task.operationApis))
    let isValid = true
    await Promise.all(
      apis.map(async api => {
        try {
          if (
            startDays > 0 &&
            dayjs(api.createDate).valueOf() < dayjs().subtract(startDays, 'days').valueOf()
          ) {
            return
          } // 不在时间范围内，不进行数据保护

          const resp = api.resp as any
          if (
            (api.name !== 'SubmitLongJobAction' &&
              ['Success', 'Failed', 'Canceled', 'Unknown'].indexOf(api.status) === -1) ||
            (api.name === 'SubmitLongJobAction' &&
              ['Succeeded', 'Failed', 'Canceled'].indexOf(resp?.state) === -1)
          ) {
            return
          } // 操作还没有完成，不进行数据保护
          const signedText = await this.dataProtectionService.protectDataAction(
            JSON.stringify(api.req) + JSON.stringify(api.resp),
            sessionId
          )
          if (!api?.signedText) {
            await this.zsActionApi.update(
              {
                signedText
              },
              {
                where: { apiId: api.apiId }
              }
            )
          } else if (signedText !== api?.signedText) {
            isValid = false
          }
        } catch (e) {
          isValid = false
          console.error(`[Error] protectDataAction Failed ${e}`)
        }
      })
    )
    return isValid
  }
}
