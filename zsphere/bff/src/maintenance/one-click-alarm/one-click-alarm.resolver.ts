import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { OneClickAlarmDataloader } from './one-click-alarm.dataloader'
import {
  OneClickAlarmResp,
  OneClickAlarm,
  ActiveAlarmResp,
  OneClickAlarmTemplate,
  OneClickAlarmResourceCountResp
} from './one-click-alarm.model'
import { OneClickAlarmService } from './one-click-alarm.service'

@Resolver(() => OneClickAlarm)
export class OneClickAlarmResolver {
  @Inject() oneClickAlarmService: OneClickAlarmService
  @Inject() oneClickAlarmDataloader: OneClickAlarmDataloader

  @Query(() => OneClickAlarmResp)
  async getActiveAlarm(@Args('accountUuid') accountUuid: string): Promise<OneClickAlarmResp> {
    return this.oneClickAlarmService.getActiveAlarmStatus(accountUuid) as Promise<OneClickAlarmResp>
  }

  @ResolveField(() => [OneClickAlarmTemplate])
  async oneClickAlarmTemplate(@Parent() oneClickAlarm: OneClickAlarm) {
    return await this.oneClickAlarmDataloader.query(oneClickAlarm.uuid, oneClickAlarm.namespace)
  }

  @ResolveField(() => [OneClickAlarmTemplate])
  async activeAlarmTemplate(@Parent() oneClickAlarm: OneClickAlarm) {
    return this.oneClickAlarmService.queryActiveAlarmTemplate(oneClickAlarm.namespace)
  }

  @Query(() => OneClickAlarmResourceCountResp)
  async getOneClickAlarmResourceCount(
    @Args('zoneUuid') zoneUuid: string
  ): Promise<OneClickAlarmResourceCountResp> {
    return this.oneClickAlarmService.getResourceCount(
      zoneUuid
    ) as Promise<OneClickAlarmResourceCountResp>
  }
}
