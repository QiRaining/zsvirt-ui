import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { HardwareState } from '../host/host.model'
import { HardwareSummaryService } from '../host/query/summary.service'
import { PowerSupply, QueryPowerSupplyArgs, QueryPowerSupplyResp } from './power-supply.model'
import { PowerSupplyService } from './power-supply.service'

@Resolver(() => PowerSupply)
export class PowerSupplyResolver {
  @Inject() service: PowerSupplyService
  @Inject() hardwareSummaryService: HardwareSummaryService

  @Query(() => QueryPowerSupplyResp)
  async powerSupplyList(@Args() args: QueryPowerSupplyArgs) {
    const { hostUuid } = args
    const metricResult = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'PowerSupply'
    })
    const { manufacturer, model, ratedPower } = await this.service.getTags(hostUuid)
    const list = metricResult.data.map(item => ({
      id: item.labels?.PowerSupplyId,
      name: item.labels?.PowerSupplyId?.toUpperCase(),
      manufacturer,
      model,
      ratedPower,
      hostUuid
    }))
    return {
      list,
      total: list.length
    }
  }

  @ResolveField(() => HardwareState)
  async state(@Parent() power: PowerSupply) {
    const { hostUuid, id } = power
    const stateMap = new Map([
      [0, HardwareState.Normal],
      [10, HardwareState.NoElectric],
      [20, HardwareState.Abnormal]
    ])
    return await this.hardwareSummaryService.getState(
      hostUuid,
      {
        metricName: 'PowerSupply',
        labels: [`HostUuid=${hostUuid}`, `PowerSupplyId=${id}`]
      },
      stateMap
    )
  }

  @ResolveField(() => Number)
  async currentPower(@Parent() power: PowerSupply) {
    const { hostUuid, id } = power
    const hostConnected = await this.hardwareSummaryService.getHostConnected(hostUuid)
    if (!hostConnected) {
      return ''
    }
    const metricResult = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'PowerSupplyCurrentOutputPower',
      labels: [`HostUuid=${hostUuid}`, `PowerSupplyId=${id}`]
    })
    return metricResult.data?.[0]?.value
  }
}
