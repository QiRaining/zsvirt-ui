import { Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { ActionResponseService } from '../common/action-subscription/action-response.service'
import type { ActionResp } from '../common/model/action-resp.model'
import { ZsEvent } from '../model/zs-event.model'
import { ZsSession } from '../model/zs-session.model'
import { genUuid } from '../utils'

export default abstract class ActionServiceBase {
  @Inject() actionResponseService: ActionResponseService
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject(CONTEXT) private readonly context

  protected name = 'action.base'

  async invoke(param) {
    let actionId = (this.context as any).req.headers['x-job-id']
    const sessionId = (this.context as any).req.headers['x-session-id']
    if (!actionId) {
      actionId = genUuid()
    }
    const actionResp: ActionResp = {
      actionId
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
        description: '',
        details: ''
      }
      if (e instanceof Error) {
        error.description = e.message
        error.details = e.stack
      } else {
        error.details = JSON.stringify(e)
      }
      console.error(error)
      return (actionResp.error = error)
    }
    try {
      const rt = await this.action(param, actionId)
      // this.actionResponseService.response(actionId, rt);
      actionResp.result = rt
      return actionResp
    } catch (exception) {
      console.error(JSON.stringify(exception, null, 2))
      let error
      if (exception instanceof Error) {
        error = {
          code: 'UI.1001',
          description: '',
          details: JSON.stringify({
            message: exception.message,
            stack: exception.stack
          })
        }
      } else {
        error = exception.error
      }
      return (actionResp.error = error)
      //  this.actionResponseService.response(actionId, null, error);
    }
  }

  abstract action(params, actionId): Promise<any>
}
