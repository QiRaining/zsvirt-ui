import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WidgetAlarmInfoResolver, AlarmResourceInfoResolver } from './widget-alarm-info.resolver'
import { WidgetAlarmInfoService } from './widget-alarm-info.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [WidgetAlarmInfoResolver, WidgetAlarmInfoService, AlarmResourceInfoResolver]
})
export class WidgetAlarmInfoModule {}
