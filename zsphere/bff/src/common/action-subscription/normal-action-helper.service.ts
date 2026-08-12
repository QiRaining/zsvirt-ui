import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize'
import { Op } from 'sequelize/types'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import type { ActionError } from '../model/action-resp.model'
import { ActionResp, TaskResult, TaskError, ActionRespTaskState } from '../model/action-resp.model'

@Injectable()
export class NormalActionHelperService {
  // @Inject() private sequelize: Sequelize;
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  // @InjectModel(ZsSession) private zsSession: typeof ZsSession;

  async response(param: INormalActionResponseParam) {
    const { mainJobId, sessionId, triggerName, successCount, errorCount, total, inventory, error } =
      param
    const payload = {
      inventory,
      error,
      action: {
        actionId: mainJobId,
        state: inventory ? ActionRespTaskState.Success : ActionRespTaskState.Error,
        success: successCount,
        error: errorCount,
        total: total
      }
    }

    // this.pubSubService.get().publish(triggerName, {
    //   payload,
    //   sessionId
    // })
  }

  async record(param: INormalActionRecordParam) {
    const { actionId, callList } = param

    const event = await this.zsEvent.findOne({
      where: {
        uuid: actionId
      }
    })

    const data = JSON.parse(event.data)
    data.callList = callList
    await this.zsEvent.update(
      {
        data: JSON.stringify(data),
        update_time: new Date()
      },
      { where: { uuid: actionId } }
    )
  }
}

export interface INormalActionResponseParam {
  mainJobId: string
  sessionId: string
  triggerName: string
  successCount: number
  errorCount: number
  total: number
  inventory?: any
  error?: ActionError
}

export interface INormalActionRecordParam {
  actionId: string
  callList: any[]
}
