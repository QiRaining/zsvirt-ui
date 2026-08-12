import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { TaskResult, TaskError } from '../model/action-resp.model'

@Injectable()
export class ActionResponseService {
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  async response(actionId: string, result: TaskResult, error: TaskError = undefined) {
    await this.zsEvent.update(
      {
        status: error ? 'ERR' : 'OK',
        update_time: new Date()
      },
      { where: { uuid: actionId } }
    )
  }
}
