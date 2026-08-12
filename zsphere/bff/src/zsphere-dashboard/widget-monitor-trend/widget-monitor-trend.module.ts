import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WidgetMonitorTrendResolver } from './widget-monitor-trend.resolver'
import { WidgetMonitorTrendService } from './widget-monitor-trend.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [WidgetMonitorTrendService, WidgetMonitorTrendResolver]
})
export class WidgetMonitorTrendModule {}
