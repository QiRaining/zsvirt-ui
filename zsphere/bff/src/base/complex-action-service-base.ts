import { Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ActionResponseService } from '../common/action-subscription/action-response.service'
import type { TaskResult } from '../common/model/action-resp.model'
import { ZsEvent } from '../model/zs-event.model'
import { ZsSession } from '../model/zs-session.model'
import { genUuid } from '../utils'

export default abstract class ComplexActionServiceBase {
  @Inject() actionResponseService: ActionResponseService
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject(CONTEXT) private readonly context

  protected name = 'action.base'
  invoke(param) {
    // this.ctx.logger.info(`[${sessionId}]`, `[${actionId}]`, this.constructor.name, '\n', JSON.stringify(params, null, 2));
    try {
      this.actionWrapper(param)
      return {
        success: true
      }
    } catch (e) {
      // 注意这里是抓不到 actionWraper 里面的错误的。
      // 因为 actionWrapper 是异步的，而这里是同步调用的
      // 原因是调用之后要尽快返回，不会等结果。
      // 结果由 websocket 返回。
      console.error(e)
      return {
        success: false,
        error: JSON.stringify(e)
      }
    }
  }

  // async invoke(param) {
  async actionWrapper(param) {
    let actionId = (this.context as any).req.headers['x-job-id']
    const sessionId = (this.context as any).req.headers['x-session-id']
    if (!actionId) {
      actionId = genUuid()
    }
    try {
      const session = await this.zsSession.findOne({
        where: {
          sessionId
        }
      })
      if (!session) {
        throw Error(`Invalid sessionId [${sessionId}]`)
      }
      await this.zsEvent.create({
        uuid: actionId,
        ip: '',
        title: this.name,
        data: JSON.stringify({
          req: param
        }),
        zone: '',
        creator: session.accountId,
        status: 'UNDONE',
        creator_type: 'ACCOUNT',
        create_time: new Date(),
        update_time: null,
        project_uuid: null
      })
    } catch (e) {
      const error = {
        code: 'UI.1001',
        description: e.message,
        details: e.stack
      }
      this.actionResponseService.response(actionId, null, error)
      throw e
    }
    try {
      const rt = await this.action(param, actionId)
      this.actionResponseService.response(actionId, rt)
      return rt
    } catch (exception) {
      console.error(exception)
      let error
      if (exception instanceof Error) {
        error = {
          code: 'UI.1001',
          description: exception.message,
          details: exception.stack
        }
      } else {
        error = exception.error
      }
      this.actionResponseService.response(actionId, null, error)
    }
  }

  abstract action(params, actionId): Promise<TaskResult>
}
