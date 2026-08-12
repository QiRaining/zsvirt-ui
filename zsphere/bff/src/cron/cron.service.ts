import * as https from 'https'

import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'
import { Op } from 'sequelize'

import { GetTaskProgressActionBase } from '@/api/zstack/GetTaskProgressActionBase'
import { QueryLongJobActionBase } from '@/api/zstack/QueryLongJobActionBase'
import {
  ValidateSessionActionBase,
  ValidateSessionActionParam
} from '@/api/zstack/ValidateSessionActionBase'
import { LongJobState } from '@/common/enum'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubServiceBase } from '@/common/pub-sub/pub-sub-base.service'
import { RecordActionServiceBase } from '@/common/record-action/record-action-base.service'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsKv } from '@/model/zs-kv.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsUIConfig } from '@/model/zs-ui-config.model'

import ErrorCatch from '../common/catch-decorate'
import { Logger } from '../common/logger/logger.decorator'
import { ZSLoggerService } from '../common/logger/logger.service'
import { ZsSession } from '../model/zs-session.model'
import { ApplicationContext } from './application.context.service'

const errorCatchGenerator = jobName => {
  return function (error, ctx) {
    const job = ctx.schedulerRegistry.getCronJob(jobName)
    ctx.logger.error(`${jobName} ${error}`)
    job.start()
  }
}

const ADMIN_UUID = '36c27e8ff05c4780bf6d2fa65700f22e'
/**
 * If there a Inject(context) in the service, the service's constructor would be call until first request coming
 * since the context is request scope. So we use @Inject() to inject dependencies instead of constructor.
 * refer to https://github.com/nestjs/nest/issues/6625#issuecomment-797286408
 */
@Injectable()
export class CronService {
  @Inject() private schedulerRegistry: SchedulerRegistry
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZsKv) private zsKv: typeof ZsKv
  @InjectModel(ZsLongJob) private zsLongJob: typeof ZsLongJob
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig
  @InjectModel(ZsAction) private zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @Inject() validateSessionAction: ValidateSessionActionBase
  @Inject() getTaskProgressAction: GetTaskProgressActionBase
  @Inject() pubSubService: PubSubServiceBase
  @Inject() queryLongJobAction: QueryLongJobActionBase
  @Inject() recordActionService: RecordActionServiceBase
  @Inject() configService: ConfigService
  @Inject() httpService: HttpService
  // @Inject() dataProtectionService: DataProtectionService;
  @Logger(CronService.name) logger: ZSLoggerService

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'validateSession'
  })
  @ErrorCatch(errorCatchGenerator('validateSession'))
  async validateSession() {
    // 外部传入的可能是字符0，也可能是数字0
    if (parseInt(process.env.INSTANCE_ID) !== 0) {
      return
    }
    const isVIP = await this.activeNode()
    if (!isVIP) {
      return
    }
    const job = this.schedulerRegistry.getCronJob('validateSession')
    job.stop() // 防止下面没做完，定时器又触发了
    const sessions = await this.zsSession.findAll()
    for (const session of sessions) {
      const param: ValidateSessionActionParam = {
        sessionUuid: session.sessionId
      }
      const rt = await this.validateSessionAction.call(param)
      if (!rt.valid) {
        session.destroy()
      }
    }
    job.start()
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'cleanOperationRecord'
  })
  @ErrorCatch(errorCatchGenerator('cleanOperationRecord'))
  async cleanOperationRecord() {
    // 外部传入的可能是字符0，也可能是数字0
    if (parseInt(process.env.INSTANCE_ID) !== 0) {
      return
    }
    const isVIP = await this.activeNode()
    if (!isVIP) {
      return
    }
    const job = this.schedulerRegistry.getCronJob('cleanOperationRecord')
    job.stop() // 防止下面没做完，定时器又触发了
    const row = await this.zsUIConfig.findOne({
      where: { name: 'operation.max.history' }
    })
    const maxHistoryMs = parseInt(row.value)
    this.zsAction.destroy({
      where: {
        createDate: {
          [Op.lte]: new Date().getTime() - maxHistoryMs
        }
      }
    })
    this.zsActionTask.destroy({
      where: {
        createDate: {
          [Op.lte]: new Date().getTime() - maxHistoryMs
        }
      }
    })
    this.zsActionApi.destroy({
      where: {
        createDate: {
          [Op.lte]: new Date().getTime() - maxHistoryMs
        }
      }
    })
    job.start()
  }

  /***
   * detect does current node is the master node in double node mn
   * if no VIP, it's a single node. otherwise it is a double node
   */
  async activeNode() {
    try {
      const VIP = this.configService.get<string>('VIP')
      // single Node, do the cron
      if (!VIP) {
        return true
      }
      const nodeID = this.configService.get<string>('NODE_ID')
      const resp = await this.httpService
        .get(`${VIP}/api/nodeid`, {
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        })
        .toPromise()
      return nodeID === resp.data
    } catch (e) {
      this.logger.error('[activeNode error]', e)
      // by default, do the cron
      return true
    }
  }

  private getAffectedRows(updateResult: unknown): number | undefined {
    if (Array.isArray(updateResult) && typeof updateResult[0] === 'number') {
      return updateResult[0]
    }
    return undefined
  }

  private logUploadResume(stage: string, payload: Record<string, unknown>): void {
    this.logger.debugJson({
      type: 'uploadResume',
      stage,
      ...payload
    })
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'refreshLongJob'
  })
  @ErrorCatch(errorCatchGenerator('refreshLongJob'))
  async refreshLongJob() {
    // 外部传入的可能是字符0，也可能是数字0
    // this.logger.timing('longjob begin')
    if (parseInt(process.env.INSTANCE_ID) !== 0) {
      return
    }
    const isVIP = await this.activeNode()
    if (!isVIP) {
      return
    }
    const job = this.schedulerRegistry.getCronJob('refreshLongJob')
    job.stop() // 防止下面没做完，定时器又触发了
    const allLongJobs = await this.zsLongJob.findAll({
      where: {
        state: {
          [Op.in]: ['RUNNING', 'CANCELING', 'SUSPENDED']
        }
      }
    })
    // this.logger.timing(allLongJobs)
    for (const longJob of allLongJobs) {
      const sessions = await this.zsSession.findAll({
        where: { userId: longJob.userId }
      })
      const adminSession = await this.zsSession.findOne({
        // 当admin用户登录时，需要查询到所有的longjob.若项目用户登录只查询自己创建的longjob即可。
        where: { userId: ADMIN_UUID }
      })
      const state = longJob.state
      const currSession = sessions[0] || adminSession
      try {
        const longJobResp = await this.queryLongJobAction.call(
          { conditions: [{ key: 'uuid', value: longJob.longJobUuid }] },
          { sessionId: currSession.sessionId }
        )
        // this.logger.timing('after query logjob')
        let payload

        // 查询的longjob已经被删除了
        if (!longJobResp?.inventories?.length) {
          this.logUploadResume('longjob-missing', {
            actionId: longJob.clientJobUuid,
            longJobUuid: longJob.longJobUuid,
            jobName: longJob.jobName,
            localState: state
          })
          await this.recordActionService.recordActionException(longJob.clientJobUuid)
          await this.recordActionService.recordTaskException(longJob.clientJobUuid)
          await this.recordActionService.recordApiFailed(longJob.clientJobUuid)
          const longJobUpdateResult = await this.zsLongJob.update(
            {
              progress: 100,
              state:
                longJob.jobName === 'APIConvertVmFromForeignHypervisorMsg' ? 'SUCCESS' : 'UNKNOWN'
            },
            { where: { id: longJob.id } }
          )
          this.logUploadResume('longjob-missing-synced', {
            actionId: longJob.clientJobUuid,
            longJobUuid: longJob.longJobUuid,
            jobName: longJob.jobName,
            localState: state,
            longJobRows: this.getAffectedRows(longJobUpdateResult)
          })
          payload = {
            id: longJob.clientJobUuid,
            actionId: longJob.clientJobUuid,
            state: ActionTaskState.success,
            type: longJob.resourceType
          }
        }
        const longJobInventory = longJobResp?.inventories?.[0] ?? {}
        this.logUploadResume('longjob-polled', {
          actionId: longJob.clientJobUuid,
          longJobUuid: longJob.longJobUuid,
          jobName: longJob.jobName,
          localState: state,
          remoteState: longJobInventory.state,
          apiId: longJobInventory.apiId,
          hasInventory: Boolean(longJobResp?.inventories?.length),
          jobResult:
            typeof longJobInventory.jobResult === 'string'
              ? longJobInventory.jobResult.slice(0, 500)
              : undefined
        })
        const isSucceeded = longJobInventory.state === LongJobState.Succeeded
        const isFailed = longJobInventory.state === LongJobState.Failed
        const isCanceling = longJobInventory.state === LongJobState.Canceling
        const isCanceled = longJobInventory.state === LongJobState.Canceled
        const isSuspended = longJobInventory.state === LongJobState.Suspended
        const isRunning = longJobInventory.state === LongJobState.Running
        if (isSuspended || isSucceeded || isFailed || isCanceled || isRunning) {
          let hasError = false
          if (isSucceeded) {
            try {
              let result = JSON.parse(longJobInventory?.jobResult)
              if (!Array.isArray(result)) {
                result = [result]
              }
              hasError = result.find(
                (item: any) => item.success === false || item.success === 'false' || item.error
              )
            } catch (e) {
              this.logger.error('[parse longjob]', e)
            }
          }
          if (isSucceeded && !hasError) {
            this.logger.debugJson({
              type: 'uploadResume',
              stage: 'operation-status-sync',
              status: 'Success',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state
            })
            this.logger.debugJson({
              type: 'operationLog',
              status: 'Success',
              actionId: longJob.clientJobUuid,
              accountUuid: currSession?.accountId,
              lastOpDate: new Date()
            })
            const apiUpdateResult = await this.zsActionApi.update(
              { resp: longJobInventory },
              { where: { apiId: longJobInventory.apiId } }
            )
            const longJobUpdateResult = await this.zsLongJob.update(
              { progress: 100, state: 'SUCCESS' },
              { where: { id: longJob.id } }
            )
            await this.recordActionService.recordActionSuccess(longJob.clientJobUuid)
            await this.recordActionService.recordTaskSuccess(longJob.clientJobUuid)
            await this.recordActionService.recordApiSuccess(longJob.clientJobUuid)
            this.logUploadResume('operation-status-synced', {
              status: 'Success',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              apiRows: this.getAffectedRows(apiUpdateResult),
              longJobRows: this.getAffectedRows(longJobUpdateResult)
            })
            payload = {
              // id - 参照 action.model 文件的ActionTaskResult类型定义
              id: longJob.clientJobUuid,
              actionId: longJob.clientJobUuid,
              state: ActionTaskState.success,
              type: longJob.resourceType
            }
          }
          // Keep outer operation status aligned with the actual LongJob status.
          if (isSuspended && !hasError) {
            this.logger.debugJson({
              type: 'uploadResume',
              stage: 'operation-status-sync',
              status: 'Suspended',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state
            })
            this.logger.debugJson({
              type: 'operationLog',
              status: 'Suspended',
              actionId: longJob.clientJobUuid,
              accountUuid: currSession?.accountId,
              lastOpDate: new Date()
            })
            const apiUpdateResult = await this.zsActionApi.update(
              { resp: longJobInventory },
              { where: { apiId: longJobInventory.apiId } }
            )
            const longJobUpdateResult = await this.zsLongJob.update(
              { state: 'SUSPENDED' },
              { where: { id: longJob.id } }
            )
            await this.recordActionService.recordActionSuspended(longJob.clientJobUuid)
            await this.recordActionService.recordApiSuspended(longJob.clientJobUuid)
            await this.recordActionService.recordTaskSuspended(longJob.clientJobUuid)
            this.logUploadResume('operation-status-synced', {
              status: 'Suspended',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              apiRows: this.getAffectedRows(apiUpdateResult),
              longJobRows: this.getAffectedRows(longJobUpdateResult)
            })
            payload = {
              // id - 参照 action.model 文件的ActionTaskResult类型定义
              id: longJob.clientJobUuid,
              actionId: longJob.clientJobUuid,
              state: ActionTaskState.suspended,
              type: longJob.resourceType
            }
          }
          // from suspended state to running state
          if (isRunning && state === 'SUSPENDED' && !hasError) {
            this.logger.debugJson({
              type: 'uploadResume',
              stage: 'operation-status-sync',
              status: 'Running',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state
            })
            this.logger.debugJson({
              type: 'operationLog',
              status: 'Running',
              actionId: longJob.clientJobUuid,
              accountUuid: currSession?.accountId,
              lastOpDate: new Date()
            })
            const apiUpdateResult = await this.zsActionApi.update(
              { resp: longJobInventory },
              { where: { apiId: longJobInventory.apiId } }
            )
            const longJobUpdateResult = await this.zsLongJob.update(
              { state: 'RUNNING' },
              { where: { id: longJob.id } }
            )
            await this.recordActionService.recordActionResume(longJob.clientJobUuid)
            await this.recordActionService.recordApiResume(longJob.clientJobUuid)
            await this.recordActionService.recordTaskResume(longJob.clientJobUuid)
            this.logUploadResume('operation-status-synced', {
              status: 'Running',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              apiRows: this.getAffectedRows(apiUpdateResult),
              longJobRows: this.getAffectedRows(longJobUpdateResult)
            })
            payload = {
              // id - 参照 action.model 文件的ActionTaskResult类型定义
              id: longJob.clientJobUuid,
              actionId: longJob.clientJobUuid,
              state: ActionTaskState.running,
              type: longJob.resourceType
            }
          }

          if (isFailed || hasError) {
            this.logger.debugJson({
              type: 'uploadResume',
              stage: 'operation-status-sync',
              status: 'Failed',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              hasError
            })
            this.logger.debugJson({
              type: 'operationLog',
              status: 'Failed',
              actionId: longJob.clientJobUuid,
              accountUuid: currSession?.accountId,
              lastOpDate: new Date()
            })
            const apiUpdateResult = await this.zsActionApi.update(
              { resp: longJobInventory },
              { where: { apiId: longJobInventory.apiId } }
            )
            const longJobUpdateResult = await this.zsLongJob.update(
              { progress: 0, state: 'FAILED' },
              { where: { id: longJob.id } }
            )
            await this.recordActionService.recordActionFailed(longJob.clientJobUuid)
            await this.recordActionService.recordTaskFailed(longJob.clientJobUuid)
            await this.recordActionService.recordApiFailed(longJob.clientJobUuid)
            this.logUploadResume('operation-status-synced', {
              status: 'Failed',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              hasError,
              apiRows: this.getAffectedRows(apiUpdateResult),
              longJobRows: this.getAffectedRows(longJobUpdateResult)
            })
            payload = {
              // id - 参照 action.model 文件的ActionTaskResult类型定义
              id: longJob.clientJobUuid,
              actionId: longJob.clientJobUuid,
              state: ActionTaskState.fail,
              type: longJob.resourceType,
              error: _.isString(longJobInventory.jobResult)
                ? longJobInventory.jobResult
                : JSON.stringify(longJobInventory.jobResult)
            }
          }

          if (isCanceled) {
            this.logUploadResume('operation-status-sync', {
              status: 'Canceled',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state
            })
            this.logger.debugJson({
              type: 'operationLog',
              status: 'Canceled',
              actionId: longJob.clientJobUuid,
              accountUuid: currSession?.accountId,
              lastOpDate: new Date()
            })
            const apiUpdateResult = await this.zsActionApi.update(
              { resp: longJobInventory },
              { where: { apiId: longJobInventory.apiId } }
            )
            const longJobUpdateResult = await this.zsLongJob.update(
              { progress: 100, state: 'CANCELED' },
              { where: { id: longJob.id } }
            )
            await this.recordActionService.recordActionCanceled(longJob.clientJobUuid)
            await this.recordActionService.recordTaskCanceled(longJob.clientJobUuid)
            await this.recordActionService.recordApiCanceled(longJob.clientJobUuid)
            this.logUploadResume('operation-status-synced', {
              status: 'Canceled',
              actionId: longJob.clientJobUuid,
              longJobUuid: longJob.longJobUuid,
              jobName: longJob.jobName,
              localState: state,
              remoteState: longJobInventory.state,
              apiRows: this.getAffectedRows(apiUpdateResult),
              longJobRows: this.getAffectedRows(longJobUpdateResult)
            })
            payload = {
              // id - 参照 action.model 文件的ActionTaskResult类型定义
              id: longJob.clientJobUuid,
              actionId: longJob.clientJobUuid,
              state: ActionTaskState.fail,
              type: longJob.resourceType,
              error: _.isString(longJobInventory.jobResult)
                ? longJobInventory.jobResult
                : JSON.stringify(longJobInventory.jobResult)
            }
          }
        } else if (isCanceling) {
          await this.zsLongJob.update({ state: 'CANCELING' }, { where: { id: longJob.id } })
          await this.recordActionService.recordActionCanceling(longJob.clientJobUuid)
          await this.recordActionService.recordTaskCanceling(longJob.clientJobUuid)
          await this.recordActionService.recordApiCanceling(longJob.clientJobUuid)
        }
        if (isRunning && longJobResp?.inventories?.length) {
          const taskProgress = await this.getTaskProgressAction.call(
            { apiId: longJobResp?.inventories?.[0]?.apiId, all: true },
            { sessionId: currSession.sessionId }
          )

          const lastTaskInfo = taskProgress?.inventories?.find(
            item => item.content === 'main-progress'
          )
          if (lastTaskInfo) {
            await this.zsLongJob.update(
              {
                progress: Math.floor((lastTaskInfo.currentStep / lastTaskInfo.totalStep) * 100)
              },
              { where: { id: longJob.id } }
            )
          }
        }
        if (payload) {
          const context = ApplicationContext.getInstance()
          const pro = context.get(longJob.clientJobUuid)
          if (pro !== undefined) {
            pro?.resolve(payload)
          } else {
            for (const session of sessions) {
              const _payload = _.cloneDeep(payload)
              _payload.sessionId = session.sessionId
              this.pubSubService.response(_payload)
            }
          }
        }
      } catch (e) {
        this.logger.error(e)
      }
    }
    job.start()
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'refreshOpreationLog'
  })
  @ErrorCatch(errorCatchGenerator('refreshOpreationLog'))
  async refreshOpreationLog() {
    if (parseInt(process.env.INSTANCE_ID) !== 0) {
      return
    }
    const isVIP = await this.activeNode()
    if (!isVIP) {
      return
    }
    const job = this.schedulerRegistry.getCronJob('refreshOpreationLog')
    job.stop() // 防止下面没做完，定时器又触发了
    const allActions = await this.zsAction.findAll({
      where: {
        status: 'Running'
      },
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
          model: this.zsLongJob,
          as: 'longjobs'
        },
        {
          model: this.zsActionTask,
          as: 'operationTasks',
          include: [
            {
              model: this.zsActionApi,
              as: 'operationApis',
              attributes: {
                exclude: ['actionId']
              },
              include: [
                {
                  model: this.zsLongJob,
                  as: 'longjob'
                }
              ]
            }
          ]
        }
      ]
    })
    // this.logger.timing(allLongJobs)
    for (const action of allActions) {
      action.longjobs = []
      const apiWithLongJob = []
      action?.operationTasks?.forEach(_item => {
        _item.operationApis?.forEach(__item => {
          const lb = __item?.longjob
          if (lb) {
            apiWithLongJob.push(lb)
          }
        })
      })
      action.longjobs = action.longjobs.concat(apiWithLongJob)

      if (action.longjobs?.length > 0) {
        action.progress =
          _.sumBy(
            action.longjobs,
            longjob => _.toNumber(longjob?.progress || 0) / action.longjobs.length
          ) ?? 0
      } else {
        const { createDate, operationTasks } = action
        const baseProgress = operationTasks?.filter(cv => cv.status !== 'Running')?.length || 0
        const simulateProgress = operationTasks?.filter(cv => cv.status === 'Running')?.length || 0
        const basePercent = (baseProgress / operationTasks.length) * 100 // 基础进度
        // 模拟进度 n/n+1
        const getSingleProgress = () => {
          return (
            (Date.now() - _.toNumber(createDate)) / (Date.now() - _.toNumber(createDate) + 1 * 1000)
          )
        }
        const simulatePercent = simulateProgress
          ? ((100 - basePercent) * getSingleProgress()) / simulateProgress
          : 0
        action.progress = _.floor(basePercent + simulatePercent, 2)
      }

      await this.zsAction.update(
        {
          progress: action.progress
        },
        {
          where: {
            id: action.id
          }
        }
      )
    }
    job.start()
  }

  // TODO: 这个之后放到数据保护的模块中动态启动
  // @Cron(CronExpression.EVERY_5_SECONDS, {
  //   name: 'checkDataProtectionStatus',
  // })
  // @ErrorCatch(errorCatchGenerator('checkDataProtectionStatus'))
  // async checkDataProtectionStatus() {
  //   this.dataProtectionService.protectOldActionApi();
  //   const job = this.schedulerRegistry.getCronJob('checkDataProtectionStatus');
  //   job.stop();
  // }

  /**
   *
   * 每5分钟查一次context中的数据，如果有数据，就去数据库中查一下，如果有数据就resolve，没有就reject
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'refreshDoLogjobAction'
  })
  async refreshDoLogjobAction() {
    const job = this.schedulerRegistry.getCronJob('refreshDoLogjobAction')
    job.stop() // 防止下面没做完，定时器又触发了
    const context = ApplicationContext.getInstance()
    const jobMap = context.getAll()
    // 当context中有数据的时候才处理
    if (jobMap.size > 0) {
      console.log('[debug] refreshDoLogjobAction keys', [...jobMap.keys()])
      const allLongJobs = await this.zsLongJob.findAll({
        where: {
          clientJobUuid: {
            [Op.in]: [...jobMap.keys()]
          },
          state: {
            // 处理成功\失败\取消的状态
            [Op.in]: ['SUCCESS', 'FAILED', 'CANCELED']
          }
        }
      })
      console.log('[debug] refreshDoLogjobAction allLongJobs', allLongJobs)
      for (const apiLongJob of allLongJobs) {
        const { clientJobUuid } = apiLongJob
        const { resolve, reject } = jobMap.get(clientJobUuid)
        if (resolve && reject) {
          if (apiLongJob.state === 'SUCCESS') {
            resolve(apiLongJob.data)
          } else {
            reject(apiLongJob.data)
          }
        }
        context.delete(clientJobUuid)
      }
    }
    job.start()
  }
}
