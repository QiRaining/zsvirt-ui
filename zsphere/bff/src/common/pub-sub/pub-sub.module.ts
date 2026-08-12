import { Module, Global } from '@nestjs/common'

import { ActionResponseService } from '../action-subscription/action-response.service'
import { ActionSubscriptionResponseService } from '../action-subscription/action-subscription-response.service'
import { ActionSubscriptionResolver } from '../action-subscription/action-subscription.resolver'
import { NormalActionHelperService } from '../action-subscription/normal-action-helper.service'
import { TaskResponseService } from '../action-subscription/task-response.service'
import { WorkFlowActionSubscriptionResponseService } from '../action-subscription/work-flow-action-subscription-response.service'
import { PubSubServiceBase } from './pub-sub-base.service'
import { PubSubService } from './pub-sub.service'

@Global()
@Module({
  providers: [
    PubSubServiceBase,
    PubSubService,
    ActionSubscriptionResolver,
    ActionResponseService,
    TaskResponseService,
    ActionSubscriptionResponseService,
    WorkFlowActionSubscriptionResponseService,
    NormalActionHelperService
  ],
  exports: [
    PubSubServiceBase,
    PubSubService,
    ActionSubscriptionResolver,
    ActionResponseService,
    TaskResponseService,
    ActionSubscriptionResponseService,
    WorkFlowActionSubscriptionResponseService,
    NormalActionHelperService
  ]
})
export class PubSubModule {}
