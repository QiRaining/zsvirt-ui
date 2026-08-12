import { Inject } from '@nestjs/common'
import { Args, Resolver, Query } from '@nestjs/graphql'

import { WidgetQuotaUsage, WidgetQuotaUsageInput } from './widget-quota-usage.model'
import { WidgetQuotaUsageService } from './widget-quota-usage.service'

@Resolver(() => WidgetQuotaUsage)
export class WidgetQuotaUsageResolver {
  @Inject() widgetQuotaUsageService: WidgetQuotaUsageService

  @Query(() => WidgetQuotaUsage)
  async queryWidgetQuotaUsage(@Args() args: WidgetQuotaUsageInput): Promise<WidgetQuotaUsage> {
    return await this.widgetQuotaUsageService.getQuota(args.uuid)
  }
}
