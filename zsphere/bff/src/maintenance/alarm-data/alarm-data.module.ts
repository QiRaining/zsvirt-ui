import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { AlarmDataResolver } from '@/maintenance/alarm-data/alarm-data.resolver'
import { AlarmDataService } from '@/maintenance/alarm-data/alarm-data.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

@Module({
  imports: [PubSubModule, FlowModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [AlarmDataService, AlarmDataResolver, QueryBase]
})
export class AlarmDataModule {}
