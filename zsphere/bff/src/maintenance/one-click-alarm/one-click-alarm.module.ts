import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { EndPointModule } from '../zwatch-endpoint/zwatch-endpoint.module'
import { OneClickAlarmDataloader } from './one-click-alarm.dataloader'
import { OneClickAlarmResolver } from './one-click-alarm.resolver'
import { OneClickAlarmService } from './one-click-alarm.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    ZStackApiModule,
    EndPointModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [OneClickAlarmResolver, OneClickAlarmService, OneClickAlarmDataloader, QueryBase]
})
export class OneClickAlarmModule {}
