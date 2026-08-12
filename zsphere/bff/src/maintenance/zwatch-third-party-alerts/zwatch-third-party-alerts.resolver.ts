import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import {
  ThirdPartyAlarmSummary,
  QueryThirdPartyAlertsResp,
  ThirdPartyAlerts,
  QueryThirdPartyAlertsArgs
} from '@/maintenance/zwatch-third-party-alerts/zwatch-third-party-alerts.model'
import { ThirdPartyAlertsService } from '@/maintenance/zwatch-third-party-alerts/zwatch-third-party-alerts.service'

import { ThirdpartyPlatformDataloader } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.dataloader'

@Resolver(() => ThirdPartyAlerts)
export class ThirdPartyAlertsResolver {
  @Inject() thirdPartyAlertsService: ThirdPartyAlertsService
  @Inject() thirdpartyPlatformDataloader: ThirdpartyPlatformDataloader

  @Query(() => QueryThirdPartyAlertsResp)
  async thirdPartyAlertsList(@Args() queryArgs: QueryThirdPartyAlertsArgs) {
    return this.thirdPartyAlertsService.queryList(queryArgs)
  }

  @Query(() => ThirdPartyAlerts)
  async thirdPartyAlert(@Args('uuid') uuid: string) {
    const res = await this.thirdPartyAlertsService.queryList({
      conditions: [
        {
          key: 'uuid',
          value: uuid
        }
      ]
    })
    return res?.list?.[0]
  }

  @Query(() => ThirdPartyAlarmSummary)
  async getThirdPartyAlarmSummary(@Args('zceXUuid') zceXUuid: string) {
    return this.thirdPartyAlertsService.getAlarmSummary(zceXUuid)
  }

  @ResolveField()
  async thirdpartyPlatform(@Parent() alarm: ThirdPartyAlerts) {
    return this.thirdpartyPlatformDataloader.query(
      alarm.thirdpartyPlatformUuid,
      alarm.thirdpartyPlatformUuid
    )
  }
}
