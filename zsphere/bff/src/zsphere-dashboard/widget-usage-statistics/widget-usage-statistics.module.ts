import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WidgetUsageStatisticsResolver } from './widget-usage-statistics.resolver'
import { WidgetUsageStatisticsService } from './widget-usage-statistics.service'
import { ZSVWidgetUsageStatisticsService } from './zsv-widget-usage-statistics.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    CapacityCalculationQueryService,
    WidgetUsageStatisticsResolver,
    WidgetUsageStatisticsService,
    ZSVWidgetUsageStatisticsService
  ],
  exports: [CapacityCalculationQueryService]
})
export class WidgetUsageStatisticsModule {}
