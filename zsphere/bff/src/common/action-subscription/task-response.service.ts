import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { TaskResult } from '../model/action-resp.model'

@Injectable()
export class TaskResponseService {
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  async response(actionId: string, result: TaskResult, rawError: any = undefined) {
    let error
    if (rawError) {
      error = rawError
      while (error && !error.code) {
        error = error.error
      }
      if (!error) {
        error = {
          code: 'UI.1001',
          description: 'Internal Error',
          details: `${rawError.message}\n${rawError.stack}`
        }
      }
    }
  }
}
