import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { FlowInstanceService } from '../flow/flow-instance/flow-instance.service'
import { PubSubService } from '../pub-sub/pub-sub.service'

@Injectable()
export class WorkFlowActionSubscriptionResponseService {
  @Inject() pubSubService: PubSubService
  @InjectModel(ZsEvent) private zsEvent: typeof ZsEvent
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() flowInstanceService: FlowInstanceService

  async action() {}
}
