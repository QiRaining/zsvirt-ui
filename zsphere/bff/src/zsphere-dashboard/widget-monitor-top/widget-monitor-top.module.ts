import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'

import {
  WidgetMonitorTopL3NetworkResolver,
  WidgetMonitorTopResolver
} from './widget-monitor-top.resolver'
import { WidgetMonitorTopService } from './widget-monitor-top.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession]), L3NetworkModule],
  providers: [WidgetMonitorTopService, WidgetMonitorTopResolver, WidgetMonitorTopL3NetworkResolver]
})
export class WidgetMonitorTopModule {}
