import { Module, Scope } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import {
  AckDataResolver,
  AlarmHistoriesResolver,
  ResourceInAlarmHistoriesResolver
} from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.resolver'
import { AlarmHistoriesService } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'

import { AlarmHistoriesActionModule } from './action/_module'
import { AlertAckDataloader } from './query/alert-ack-data.dataloader'
import { GetAlarmHistogramService } from './query/getzwatch-alarm-histogram'
import { ResourceNameloader, IsVcenterResourceLoader } from './query/resource.dataloader'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    AlarmHistoriesActionModule,
    OwnerModule,
    TagModule
  ],
  providers: [
    SystemTagDataloader,
    AlarmHistoriesService,
    GetAlarmHistogramService,
    AlarmHistoriesResolver,
    QueryBase,
    AlertAckDataloader,
    AckDataResolver,
    ResourceNameloader,
    IsVcenterResourceLoader,
    ResourceInAlarmHistoriesResolver
  ]
})
export class AlarmHistoriesModule {}
