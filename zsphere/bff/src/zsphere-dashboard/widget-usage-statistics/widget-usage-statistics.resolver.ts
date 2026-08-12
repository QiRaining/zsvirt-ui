import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { MetriDataList } from './widget-usage-statistics.model'
import { WidgetUsageStatisticsService } from './widget-usage-statistics.service'
import { ZSVWidgetUsageStatisticsService } from './zsv-widget-usage-statistics.service'

@Resolver()
export class WidgetUsageStatisticsResolver {
  @Inject() widgetUsageStatisticsService: WidgetUsageStatisticsService
  @Inject() zsvWidgetUsageStatisticsService: ZSVWidgetUsageStatisticsService

  @Query(() => MetriDataList)
  async getUsageStatisticsData(
    @Args({ name: 'tableName', type: () => String }) tableName: string,
    @Args({ name: 'metricName', type: () => String, nullable: true })
    metricName: string,
    @Args({ name: 'zoneKey', type: () => String, nullable: true })
    zoneKey: string,
    @Args({ name: 'zoneUuid', type: () => String, nullable: true })
    zoneUuid: string,
    @Args({ name: 'resourceKey', type: () => String, nullable: true })
    resourceKey: string,
    @Args({ name: 'monitorItem', type: () => String, nullable: true })
    monitorItem: string,
    @Args({ name: 'accountUuid', type: () => String, nullable: true })
    accountUuid: string,
    @Args({ name: 'currentIdentity', type: () => String, nullable: true })
    currentIdentity: string,
    @Args({ name: 'hypervisorType', type: () => String, nullable: true })
    hypervisorType: string,
    @Args({ name: 'uuid', type: () => String, nullable: true })
    uuid: string
  ) {
    return this.widgetUsageStatisticsService.getMetricData({
      tableName,
      metricName,
      zoneKey,
      zoneUuid,
      resourceKey,
      monitorItem,
      accountUuid,
      currentIdentity,
      hypervisorType,
      uuid
    })
  }

  @Query(() => MetriDataList)
  async getZSVUsageStatisticsData(
    @Args({ name: 'tableName', type: () => String }) tableName: string,
    @Args({ name: 'metricName', type: () => String, nullable: true })
    metricName: string,
    @Args({ name: 'zoneKey', type: () => String, nullable: true })
    zoneKey: string,
    @Args({ name: 'zoneUuid', type: () => String, nullable: true })
    zoneUuid: string,
    @Args({ name: 'resourceKey', type: () => String, nullable: true })
    resourceKey: string,
    @Args({ name: 'monitorItem', type: () => String, nullable: true })
    monitorItem: string,
    @Args({ name: 'accountUuid', type: () => String, nullable: true })
    accountUuid: string,
    @Args({ name: 'currentIdentity', type: () => String, nullable: true })
    currentIdentity: string,
    @Args({ name: 'hypervisorType', type: () => String, nullable: true })
    hypervisorType: string,
    @Args({ name: 'uuid', type: () => String, nullable: true })
    uuid: string
  ) {
    return this.zsvWidgetUsageStatisticsService.getMetricData({
      tableName,
      metricName,
      zoneKey,
      zoneUuid,
      resourceKey,
      monitorItem,
      accountUuid,
      currentIdentity,
      hypervisorType,
      uuid
    })
  }
}
