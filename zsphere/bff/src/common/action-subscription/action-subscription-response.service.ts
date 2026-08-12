import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { PubSubService } from '../pub-sub/pub-sub.service'
@Injectable()
export class ActionSubscriptionResponseService {
  @Inject() pubSubService: PubSubService
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  async response(actionId: string, state: string, success: number, error: number, total: number) {}
}
