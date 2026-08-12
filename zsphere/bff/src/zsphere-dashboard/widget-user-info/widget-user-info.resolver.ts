import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import {
  SummaryUserInfo,
  WidgetUserInfo,
  QueryWidgetUserInfoArgs,
  QuerySummaryUserInfoArgs
} from './widget-user-info.model'
import { WidgetUserInfoService } from './widget-user-info.service'

@Resolver('WidgetUserInfo')
export class WidgetUserInfoResolver {
  @Inject()
  widgetUserInfoService: WidgetUserInfoService

  @Query(() => WidgetUserInfo)
  async queryWidgetUserInfo(@Args() queryArgs: QueryWidgetUserInfoArgs) {
    return await this.widgetUserInfoService.getWidgetUserInfo(queryArgs)
  }
}

@Resolver('SummaryUserInfo')
export class SummaryUserInfoResolver {
  @Inject()
  widgetUserInfoService: WidgetUserInfoService

  @Query(() => SummaryUserInfo)
  async querySummaryUserInfo(@Args() args: QuerySummaryUserInfoArgs) {
    return await this.widgetUserInfoService.getSummaryUserInfo(args)
  }
}
