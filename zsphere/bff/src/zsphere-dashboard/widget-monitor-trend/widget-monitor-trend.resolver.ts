import { Inject } from '@nestjs/common'
import { Args, Resolver, Query } from '@nestjs/graphql'

import { WidgetMonitorTrend, WidgetMonitorTrendInput } from './widget-monitor-trend.model'
import { WidgetMonitorTrendService } from './widget-monitor-trend.service'

@Resolver(() => WidgetMonitorTrend)
export class WidgetMonitorTrendResolver {
  @Inject() widgetMonitorTopService: WidgetMonitorTrendService

  @Query(() => WidgetMonitorTrend)
  async queryWidgetMonitorTrend(@Args() args: WidgetMonitorTrendInput): Promise<any> {
    return await this.widgetMonitorTopService.getMonitorTrend(
      args.namespace,
      args.metricNameList,
      args.offset,
      args.calculateType,
      args.zoneUuid,
      args.hypervisorType,
      args.metricConditions
    )
  }
}
