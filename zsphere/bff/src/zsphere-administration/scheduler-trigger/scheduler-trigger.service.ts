import { Injectable, Inject } from '@nestjs/common'
import DataLoader = require('dataloader')
import * as _ from 'lodash'

import { Condition as ICondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAvailableTriggersAction } from '@/api/zstack/GetAvailableTriggersAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QuerySchedulerJobAction } from '@/api/zstack/QuerySchedulerJobAction'
import { QuerySchedulerTriggerAction } from '@/api/zstack/QuerySchedulerTriggerAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'

import { SchedulerTriggerQueryType } from './scheduler-trigger.model'

@Injectable()
export class SchedulerTriggerService extends ActionService {
  @Inject() querySchedulerTriggerAction: QuerySchedulerTriggerAction
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() zqlService: ZQLService
  @Inject() querySchedulerJobAction: QuerySchedulerJobAction
  @Inject() getAvailableTriggersAction: GetAvailableTriggersAction

  private accountDataloader

  private accountMap: any = {}

  constructor() {
    super()
    this.accountDataloader = new DataLoader(this._getAccount)
  }

  async schedulerTriggerList(params: QueryAction) {
    const { type = SchedulerTriggerQueryType.Normal } = params
    let finalConditions: ICondition[] = []
    switch (type) {
      case SchedulerTriggerQueryType.CandidateForCreatingSchedulerJob:
        finalConditions = params.conditions.concat(finalConditions)
        break
      default:
        finalConditions = params.conditions
    }
    params.conditions = finalConditions
    const { total, inventories } = await this.querySchedulerTriggerAction.call(params)
    return {
      total,
      list: inventories
    }
  }

  getAccount(uuid) {
    this.accountMap[uuid] = {
      uuid
    }
    return this.accountDataloader.load(uuid)
  }

  _getAccount = async (uuids: string[]) => {
    const accountResp = await this.getResourceAccountAction.call({
      resourceUuids: uuids
    })
    const accounts = accountResp.inventories

    return uuids.map(uuid => {
      let account
      for (const key in accounts) {
        if (key === this.accountMap[uuid].uuid) {
          account = accounts[key]
        }
      }
      if (account) {
        return account
      } else {
        return null
      }
    })
  }

  async getNotBackupTriggerUuids() {
    const allJobs = await this.querySchedulerJobAction.call({})
    const backupJobs = allJobs.inventories.filter(v => _.includes(v.jobClassName, 'Backup'))
    const zql = ZQL.stringify({
      tableName: 'SchedulerTrigger',
      fields: ['uuid'],
      condition: {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SchedulerJobGroupSchedulerTriggerRef',
              fields: ['schedulerTriggerUuid'],
              condition: {
                schedulerJobGroupUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SchedulerJobGroup',
                      fields: 'uuid',
                      condition: {
                        jobType: {
                          [ZOp.in]: [
                            'volumeBackup',
                            'rootVolumeBackup',
                            'vmBackup',
                            'databaseBackup'
                          ]
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
    })
    const resp = await this.zqlService.call(zql)
    const notInBackupGroups = resp.results[0].inventories.map(v => v.uuid)
    const filterUuid = uuid => !backupJobs.some(job => _.includes(job.triggersUuid, uuid))
    return notInBackupGroups.filter(filterUuid)
  }

  async getUuids() {
    const notBackupTriggerUuids = await this.getNotBackupTriggerUuids()
    const { inventories } = await this.getAvailableTriggersAction.call({})
    const notFilterUuids = inventories.map(v => v.uuid)
    return { notFilterUuids, notBackupTriggerUuids }
  }
  // 获取运行中定时器
  async schedulerAvaliableTriggerList(params: QueryAction) {
    const clonedParams = JSON.parse(JSON.stringify(params))
    const baseConditions = clonedParams.conditions ? clonedParams.conditions : []
    const { notFilterUuids, notBackupTriggerUuids } = await this.getUuids()
    const availableUuids = _.intersection(notFilterUuids, notBackupTriggerUuids)
    const availableConditions = baseConditions.concat([
      { key: 'uuid', values: availableUuids, op: 'in' }
    ])
    params.conditions = availableConditions
    const { total, inventories } = await this.querySchedulerTriggerList(params)
    return {
      total,
      list: inventories
    }
  }
  // 获取已完成定时器
  async schedulerDoneTriggerList(params: QueryAction) {
    const clonedParams = JSON.parse(JSON.stringify(params))
    const baseConditions = clonedParams.conditions ? clonedParams.conditions : []
    const { notFilterUuids } = await this.getUuids()
    const doneConditions = baseConditions.concat([
      { key: 'uuid', values: notFilterUuids, op: 'notIn' }
    ])
    params.conditions = doneConditions
    const { total, inventories } = await this.querySchedulerTriggerList(params)
    return {
      total,
      list: inventories
    }
  }

  querySchedulerTriggerList = async param => {
    const { conditions } = param
    const zqlCondition = QueryConditionTranslator.translate(conditions, {
      uuid: {
        // 过滤掉弹性伸缩组周期策略创建的定时器,uuid not in的方式避免过滤掉没有添加定时任务的定时器
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SchedulerTrigger.uuid',
            condition: {
              'job.targetResourceUuid': {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'AutoScalingRule.uuid'
                  }
                }
              }
            }
          }
        }
      }
    })

    const zqlObject = {
      tableName: 'SchedulerTrigger',
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
    const schedulerJobs = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      inventories: schedulerJobs,
      total: total
    }
  }
}
