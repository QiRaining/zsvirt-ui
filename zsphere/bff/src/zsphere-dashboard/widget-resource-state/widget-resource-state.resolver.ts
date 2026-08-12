import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import {
  WidgetResourceStateCount,
  WidgetResourceStateCountInput
} from './widget-resource-state.model'
import { WidgetResourceStateService } from './widget-resource-state.service'

@Resolver()
export class WidgetResourceStateResolver {
  @Inject() widgetResourceStateService: WidgetResourceStateService

  @Query(() => WidgetResourceStateCount)
  async queryWidgetResourceStateCount(@Args() queryArgs: WidgetResourceStateCountInput) {
    const { type } = queryArgs
    switch (type) {
      case 'vmInstance':
      case 'vpc':
        return this.widgetResourceStateService.getStateCount(queryArgs)
      case 'image':
      case 'cluster':
      case 'hostState':
        return this.widgetResourceStateService.getEnabledDisabledCount(queryArgs)
      case 'host':
      case 'primaryStorage':
      case 'backupStorage':
        return this.widgetResourceStateService.getStatusCount(queryArgs)
      case 'volume':
        return this.widgetResourceStateService.getVolumeStatusCount(queryArgs)
      case 'virtualGpu':
      case 'physicalGpu':
        return this.widgetResourceStateService.getGpuStatusCount(queryArgs)
      default:
        break
    }
  }
}
