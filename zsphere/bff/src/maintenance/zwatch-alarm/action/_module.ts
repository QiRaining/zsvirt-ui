import { Module } from '@nestjs/common'

import { AddActionToAlarmService } from './add-action-to-alarm'
import { AddActionToEventSubscriptionService } from './add-action-to-event-subscription'
import { ChangeEventAlarmStateService } from './change-event-alarm-state'
import { CreateAlarmService } from './create-alarm'
import { DeleteZWatchAlarmService } from './delete-alarms'
import { DisableZWatchAlarmService } from './disable-alarms'
import { EnableZWatchAlarmService } from './enable-alarms'
import { RemoveActionFromAlarmService } from './remove-action-from-alarm'
import { RemoveActionFromEventSubscriptionService } from './remove-action-from-event-subscription'
import { SubscribeEventService } from './subscribe-event'
import { UnsubscribeEventService } from './unsubscribe-event'
import { UpdateAlarmService } from './update-alarm'
import { UpdateAlarmLabelService } from './update-alarm-label'
import { UpdateSubscribeEventService } from './update-subscribe-event'

@Module({
  providers: [
    UpdateAlarmService,
    CreateAlarmService,
    SubscribeEventService,
    UnsubscribeEventService,
    UpdateAlarmLabelService,
    AddActionToAlarmService,
    EnableZWatchAlarmService,
    DeleteZWatchAlarmService,
    DisableZWatchAlarmService,
    UpdateSubscribeEventService,
    RemoveActionFromAlarmService,
    AddActionToEventSubscriptionService,
    RemoveActionFromEventSubscriptionService,
    ChangeEventAlarmStateService
  ],
  exports: []
})
export class ZWatchAlarmActionModule {}
