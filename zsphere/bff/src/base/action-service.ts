import { Inject } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'
import { merge } from 'lodash'

import { NormalActionHelperService } from '@/common/action-subscription/normal-action-helper.service'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { FlowManagerService } from '@/common/flow/flow-manager/flow-manager.service'
import { Logger } from '@/common/logger/logger.decorator'
import type { ZSLoggerService } from '@/common/logger/logger.service'
import type { AbstractActionInput, ActionTaskResult } from '@/common/model/action.model'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsSession } from '@/model/zs-session.model'
import { genUuid } from '@/utils'

export class ActionService {
  @Inject(CONTEXT) protected readonly context
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZsAction) private _zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private _zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private _zsActionApi: typeof ZsActionApi
  @InjectModel(ZsLongJob) private _zsLongjob: typeof ZsLongJob
  @Inject() flowManagerService: FlowManagerService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() normalActionResponseService: NormalActionHelperService
  @Inject() pubSubService: PubSubService
  @Inject() recordActionService: RecordActionService
  // 用于通过moduleRef 获取全局实例
  @Inject() moduleRef: ModuleRef

  @Logger(ActionService.name) private logger: ZSLoggerService

  triggerName: string

  // @Inject() actionResponseService: ActionResponseService

  // 用于安全地从 context 获取指定的 HTTP 头部信息
  private getHeader(headerName: string): string | undefined {
    const headers = this.context?.req?.headers || this.context?.headers
    return headers?.[headerName]
  }

  protected getMainUuid(): string {
    return this.getHeader('x-job-id') || genUuid()
  }

  protected getSessionId(req?: any): string {
    const sessionId = _.get(req, ['headers', 'x-session-id']) || this.getHeader('x-session-id')
    return sessionId
  }

  protected getZsEvent() {
    return this.zsEvent
  }

  protected getZsSession() {
    return this.zsSession
  }

  protected getContext() {
    return this.context
  }

  /**
   * 当 fields 配置了某字段，但 inventory 中不存在对应字段时，前端 Apollo 更新缓存时，会出现白屏
   * 此函数通过分析 field 字段，然后补全 inventory 缺失字段，解决白屏问题
   */
  protected formatActionHelperCallbackResult(
    result: IActionHelperCallbackResult
  ): IActionHelperCallbackResult {
    const { fields, inventory } = result

    if (!fields || !inventory) {
      return result
    }

    try {
      const l1 = fields.replace(/(^,*)|\s|(,*$)/g, '')
      const l2 = l1.replace(/(?<=\w),/g, `:null,`)
      const l3 = l2.replace(/(?<=\w)}/g, `:null}`)
      let l4 = l3.replace(/(?<=\w){/g, `:{`)

      if (!l4.endsWith(':null') && !l4.endsWith('}')) {
        l4 += ':null'
      }

      l4 = l4.replace(/(\w+)(?=:)/g, a => `"${a}"`)

      const nullInventory = JSON.parse(`{${l4}}`)

      return {
        ...result,
        fields,
        inventory: merge({}, nullInventory, inventory)
      }
    } catch (e) {
      console.error(e)

      return result
    }
  }

  protected async actionHelper(
    input: AbstractActionInput,
    resourceType: string,
    fn: IActionHelperCallback,
    {
      record = true,
      req,
      listenerType,
      bundle = false,
      resourceUuids = []
    }: IActionHelperOptions = {}
  ) {
    const { payload, action } = input
    const { actionId, name: actionName } = action

    let payloadList = payload
    if (!_.isArray(payload)) {
      payloadList = [payload]
    }

    const total = payloadList.length
    let successCount = 0
    let errorCount = 0

    if (record) {
      try {
        await this.recordActionService.recordActionStart(payload, actionId, actionName, {
          req,
          resourceUuids: resourceUuids?.join(',')
        })
      } catch (e) {
        console.error(JSON.stringify(e))
      }
    }
    const tasks = payloadList.map(async p => {
      const taskId = genUuid()
      if (record) {
        await this.recordActionService.recordTaskStart(taskId, actionId)
      }
      let payload: ActionTaskResult
      // 并发调用 ZStack API
      try {
        const rt: IActionHelperCallbackResult = this.formatActionHelperCallbackResult(
          await fn(p, taskId)
        )
        successCount++
        if (record) {
          await this.recordActionService.recordTaskSuccess(taskId)
        }

        payload = {
          sessionId: this.getSessionId(req),
          actionId: actionId,
          state: ActionTaskState.success,
          type: resourceType,
          id: rt.id,
          fields: rt.fields,
          listenerType: listenerType,
          inventory: JSON.stringify(rt.inventory)
        }
      } catch (error) {
        if (error?.name !== 'apiTimeout' && error?.name !== 'apiError') {
          this._zsActionApi.create({
            apiId: genUuid(),
            taskId,
            name: 'RunTimeError',
            req: p || undefined,
            resp: JSON.stringify({
              error: error,
              message: _.isString(error?.message) ? error?.message : JSON.stringify(error?.message)
            }),
            status: 'Failed',
            createDate: new Date()
          })
        }
        if (record) {
          await this.recordActionService.recordTaskFailed(taskId)
        }
        errorCount++
        payload = {
          state: ActionTaskState.fail,
          sessionId: this.getSessionId(req),
          actionId: actionId,
          type: resourceType,
          listenerType: listenerType,
          error: JSON.stringify(error),
          id: p?.uuid
        }
        this.logger.error(error)
      } finally {
        this.pubSubService.response(payload)
        return
      }
    })
    // 收集数据写入数据库
    try {
      await Promise.all(tasks)
      if (record) {
        if (successCount === total) {
          await this.recordActionService.recordActionSuccess(actionId)
        } else if (successCount > 0 && successCount < total) {
          await this.recordActionService.recordActionException(actionId)
        } else {
          if (total === 1) {
            const action = await this._zsAction.findOne({
              where: { actionId },
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
                  model: this._zsActionTask,
                  as: 'operationTasks',
                  include: [
                    {
                      model: this._zsActionApi,
                      as: 'operationApis',
                      attributes: {
                        exclude: ['actionId']
                      },
                      include: [
                        {
                          model: this._zsLongjob,
                          as: 'longjob'
                        }
                      ]
                    }
                  ]
                }
              ]
            })
            const apis = action?.operationTasks?.[0]?.operationApis
            if (bundle) {
              let a = 1
              while (a < apis?.length) {
                if (apis[a].status !== apis[a - 1].status) {
                  await this.recordActionService.recordActionException(actionId)
                  return
                }
                a++
              }
            } else {
              let i = 1
              while (i < apis?.length) {
                const cur = apis[i].name
                const pre = apis[i - 1].name
                const success = apis[i].status === 'Success' || apis[i - 1].status === 'Success'
                i++
                if (pre === cur && success) {
                  await this.recordActionService.recordActionException(actionId)
                  return
                }
              }
            }
          }

          await this.recordActionService.recordActionFailed(actionId)
        }
      }
    } catch (error) {
      // 如果 Promise 中间出错统一认为是错误
      if (record) {
        await this.recordActionService.recordActionFailed(actionId)
      }
    } finally {
      // DB状态已更新完成，发送一次WS通知让前端刷新操作日志列表
      // 解决竞态：task的finally中WS消息先于DB状态更新到达前端，
      // 导致前端首次refreshTaskCount查到的仍是Running状态
      if (record) {
        this.pubSubService.response({
          sessionId: this.getSessionId(req),
          actionId,
          state: successCount === total ? ActionTaskState.success : ActionTaskState.fail,
          type: resourceType,
          listenerType
        })
      }
    }
  }

  protected async simpleAction(payload, fn) {
    let payloadList = payload
    if (!_.isArray(payload)) {
      payloadList = [payload]
    }

    const total = payloadList.length
    let successCount = 0
    let errorCount = 0

    const callList = []

    const tasks = payloadList.map(p => {
      // 并发调用 ZStack API
      return fn(p).then(
        resp => {
          successCount++
          callList.push({
            req: p,
            resp
          })
          // 发送消息
          this.normalActionResponseService.response({
            mainJobId: this.getMainUuid(),
            sessionId: this.getSessionId(),
            triggerName: this.triggerName,
            successCount,
            errorCount,
            total,
            inventory: resp.inventory
          })
        },
        error => {
          errorCount++
          callList.push({
            req: p,
            resp: {
              error
            }
          })
          this.normalActionResponseService.response({
            mainJobId: this.getMainUuid(),
            sessionId: this.getSessionId(),
            triggerName: this.triggerName,
            successCount,
            errorCount,
            total,
            error
          })
        }
      )
    })
    // 收集数据写入数据库
    await Promise.all(tasks)
    this.normalActionResponseService.record({
      actionId: this.getMainUuid(),
      callList
    })
  }
}

interface IComplexActionWrapperOption {
  actionId: string
  sessionId: string
  payload?: any
  action: Function
  actionName: string
}

async function complexActionWrapper(
  this: ActionService,
  { actionId, sessionId, payload, action, actionName }: IComplexActionWrapperOption
) {
  try {
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })

    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }

    await this.getZsEvent().create({
      uuid: actionId,
      ip: '',
      title: actionName,
      data: JSON.stringify({ req: payload }),
      zone: '',
      creator: session.accountId,
      status: 'UNDONE',
      creator_type: 'ACCOUNT',
      create_time: new Date(),
      update_time: null,
      project_uuid: null
    })
  } catch (e) {
    throw e
  }

  try {
    const rt = await action.call(this, payload, actionId, sessionId)

    // this.actionResponseService.response(actionId, rt)

    return rt
  } catch (exception) {
    console.error(exception)

    const error =
      exception instanceof Error
        ? {
            code: 'UI.1001',
            description: exception.message,
            details: exception.stack
          }
        : exception.error

    // this.actionResponseService.response(actionId, null, error)
  }
}

export interface IActionHelperCallbackResult {
  id: string
  fields?: string
  inventory?: any
}

export interface IActionHelperCallback {
  //定义函数的参数类型和返回值类型
  (payload: any, taskId: string): Promise<IActionHelperCallbackResult>
}

export interface IActionHelperOptions {
  record?: boolean
  req?: any
  listenerType?: string
  bundle?: boolean
  resourceUuids?: string[]
}
