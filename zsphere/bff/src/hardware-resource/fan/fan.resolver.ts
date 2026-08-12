import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'

import { HardwareState } from '../host/host.model'
import { HardwareSummaryService } from '../host/query/summary.service'
import { Fan, QueryFanArgs, QueryFanResp } from './fan.model'

@Resolver(() => Fan)
export class FanResolver {
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() hardwareSummaryService: HardwareSummaryService

  @Query(() => QueryFanResp)
  async fanList(@Args() args: QueryFanArgs) {
    const { hostUuid } = args
    const metricResult = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'FanSpeedRpm'
    })
    const list = metricResult.data.map(item => ({
      serialNumber: item.labels?.FanSpeedName,
      hostUuid
    }))
    return {
      list,
      total: list.length
    }
  }

  @ResolveField(() => HardwareState)
  async state(@Parent() fan: Fan) {
    const { hostUuid, serialNumber } = fan
    return await this.hardwareSummaryService.getState(hostUuid, {
      metricName: 'FanSpeedState',
      labels: [`HostUuid=${hostUuid}`, `FanSpeedName=${serialNumber}`]
    })
  }

  @ResolveField(() => Number)
  async rpm(@Parent() fan: Fan) {
    const { hostUuid, serialNumber } = fan
    const hostConnected = await this.hardwareSummaryService.getHostConnected(hostUuid)
    if (!hostConnected) {
      return ''
    }
    const metricResult = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'FanSpeedRpm',
      labels: [`HostUuid=${hostUuid}`, `FanSpeedName=${serialNumber}`]
    })
    return metricResult.data?.[0]?.value
  }
}
