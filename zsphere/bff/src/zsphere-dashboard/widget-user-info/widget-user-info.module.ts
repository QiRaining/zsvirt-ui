import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WidgetUserInfoResolver, SummaryUserInfoResolver } from './widget-user-info.resolver'
import { WidgetUserInfoService } from './widget-user-info.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [WidgetUserInfoResolver, SummaryUserInfoResolver, WidgetUserInfoService]
})
export class WidgetUserInfoModule {}
