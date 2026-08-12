import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WidgetResourceStateResolver } from './widget-resource-state.resolver'
import { WidgetResourceStateService } from './widget-resource-state.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [WidgetResourceStateResolver, WidgetResourceStateService]
})
export class WidgetResourceStateModule {}
