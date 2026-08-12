import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { AckAlarmDataService } from './ack-alarm'
import { UpdateAlarmDataAsReadService } from './mark-alarm-data-as-read'
import { UpdateAllAlarmHistoriesAsReadService } from './mark-all-as-read'
import { UpdateEventDataAsReadService } from './mark-event-data-as-read'
import { UpdateSingleAlarmHistoryAsReadService } from './mark-single-as-read'
import { UpdateAlertDataAckService } from './recover'

@Module({
  imports: [ZStackApiModule],
  providers: [
    UpdateEventDataAsReadService,
    UpdateAlarmDataAsReadService,
    UpdateAllAlarmHistoriesAsReadService,
    UpdateSingleAlarmHistoryAsReadService,
    AckAlarmDataService,
    UpdateAlertDataAckService
  ],
  exports: []
})
export class AlarmHistoriesActionModule {}
