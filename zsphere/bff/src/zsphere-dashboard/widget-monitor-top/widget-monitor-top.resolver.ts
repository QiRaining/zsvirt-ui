import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, ResolveField, Parent } from '@nestjs/graphql'

import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'

import {
  WidgetMonitorL3NetworkTop,
  WidgetMonitorTop,
  WidgetMonitorTopInput,
  WidgetMonitorTopL3Network
} from './widget-monitor-top.model'
import { WidgetMonitorTopService } from './widget-monitor-top.service'

@Resolver(() => WidgetMonitorTop)
export class WidgetMonitorTopResolver {
  @Inject() widgetMonitorTopService: WidgetMonitorTopService

  @Query(() => WidgetMonitorTop)
  async queryWidgetMonitorTop(@Args() args: WidgetMonitorTopInput): Promise<WidgetMonitorTop> {
    return await this.widgetMonitorTopService.getTopList(
      args.namespace,
      args.metricName,
      args.limit,
      args.zoneUuid,
      args.hypervisorType,
      args.offsetAheadOfCurrentTime
    )
  }

  @Query(() => WidgetMonitorL3NetworkTop)
  async queryWidgetMonitorL3NetworkTop(
    @Args() args: WidgetMonitorTopInput
  ): Promise<WidgetMonitorTop> {
    return await this.widgetMonitorTopService.getTopList(
      args.namespace,
      args.metricName,
      args.limit,
      args.zoneUuid,
      args.hypervisorType
    )
  }
}

@Resolver(() => WidgetMonitorTopL3Network)
export class WidgetMonitorTopL3NetworkResolver {
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @ResolveField(() => L3Network)
  async l3Network(@Parent() resource: WidgetMonitorTopL3Network) {
    return await this.l3NetworkDataloader.query(resource.uuid, resource.uuid)
  }
}
