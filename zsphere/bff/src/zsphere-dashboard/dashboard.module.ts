import { Module } from '@nestjs/common'

import { HomepageModule } from './homepage/homepage.module'
import { TagCloudModule } from './tag-cloud/tag-cloud.module'
import { WidgetAlarmInfoModule } from './widget-alarm-info/widget-alarm-info.module'
import { WidgetMonitorTopModule } from './widget-monitor-top/widget-monitor-top.module'
import { WidgetMonitorTrendModule } from './widget-monitor-trend/widget-monitor-trend.module'
import { WidgetQuotaUsageModule } from './widget-quota-usage/widget-quota-usage.module'
import { WidgetResourceStateModule } from './widget-resource-state/widget-resource-state.module'
import { WidgetUsageStatisticsModule } from './widget-usage-statistics/widget-usage-statistics.module'
import { WidgetUserInfoModule } from './widget-user-info/widget-user-info.module'

@Module({
  imports: [
    HomepageModule,
    WidgetAlarmInfoModule,
    WidgetUserInfoModule,
    WidgetResourceStateModule,
    WidgetMonitorTopModule,
    WidgetUsageStatisticsModule,
    WidgetMonitorTrendModule,
    WidgetQuotaUsageModule,
    TagCloudModule
  ],
  providers: []
})
export class DashboardModule {}
