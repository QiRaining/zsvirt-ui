import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'
import { Op as SOp } from 'sequelize'

import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { Condition, QueryAction } from '@/common/model/action-query.model'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsLogCollect } from '@/model/zs-log-collect.model'

@Injectable()
export class LogCollectService extends ActionService {
  @InjectModel(ZsLogCollect) private zsLogCollect: typeof ZsLogCollect
  @Inject() configService: ConfigService
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi

  async query(queryParams: QueryAction) {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }

    if (['Admin', 'PlatformAdmin'].indexOf(session.identity) === -1) {
      throw Error(`current api is admin only`)
    }

    const { conditions, sortBy = 'createDate', sortDirection = 'desc', start, limit } = queryParams
    const whereOpt = this.transformConditions(conditions)
    const { rows: logs, count: total } = await this.zsLogCollect.findAndCountAll({
      where: whereOpt,
      limit,
      offset: start,
      order: [[sortBy, sortDirection]]
    })
    const runningLogs = logs.filter(item => item.state === 'RUNNING')
    if (runningLogs.length > 0) {
      const runningLogUuids = runningLogs.map(item => item.uuid)
      const actions = await this.zsActionApi.findAll({
        where: {
          apiId: {
            [SOp.or]: runningLogUuids
          }
        }
      })
      const failedActions = actions.filter(item => !['Running', 'Success'].includes(item.status))
      if (failedActions.length > 0) {
        const failedActionApiIds = failedActions.map(item => item.apiId)
        console.log('Tasks with inconsistent states exist.')
        await this.zsLogCollect.update(
          {
            state: 'FAILED'
          },
          {
            where: {
              uuid: {
                [SOp.or]: failedActionApiIds
              }
            }
          }
        )
      }
    }
    return {
      list: logs.map(cv => cv.toJSON()),
      total
    }
  }

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
}
