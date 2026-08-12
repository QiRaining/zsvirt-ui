import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { AlarmResourceInfo, WidgetAlarmInfo, WidgetAlarmInfoInput } from './widget-alarm-info.model'
import { WidgetAlarmInfoService } from './widget-alarm-info.service'

@Resolver('WidgetAlarmInfo')
export class WidgetAlarmInfoResolver {
  @Inject()
  widgetAlarmInfoService: WidgetAlarmInfoService

  @Query(() => WidgetAlarmInfo)
  async queryWidgetAlarmInfo(@Args() args: WidgetAlarmInfoInput) {
    return await this.widgetAlarmInfoService.getWidgetAlarmInfo(args.conditions)
  }
}

@Resolver(() => AlarmResourceInfo)
export class AlarmResourceInfoResolver {
  @Inject()
  private widgetAlarmInfoService: WidgetAlarmInfoService

  @ResolveField()
  async resourceInfo(@Parent() current: AlarmResourceInfo) {
    return this.widgetAlarmInfoService.getResourceInfo(current.uuid)
  }
}
