import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { HardwareState } from '../host/host.model'
import { HardwareSummaryService } from '../host/query/summary.service'
import {
  CPU,
  QueryCPUArgs,
  QueryCPUResp,
  QueryHostPhysicalCpuArgs,
  QueryHostPhysicalCpuResp
} from './cpu.model'
import { CPUService } from './cpu.service'

@Resolver(() => CPU)
export class CPUResolver {
  @Inject() service: CPUService
  @Inject() hardwareSummaryService: HardwareSummaryService

  @Query(() => QueryCPUResp)
  async CPUList(@Args() args: QueryCPUArgs) {
    return this.service.list(args)
  }

  @ResolveField(() => HardwareState)
  async state(@Parent() cpu: CPU) {
    const { hostUuid, id } = cpu
    return await this.hardwareSummaryService.getState(hostUuid, {
      metricName: 'CpuStatus',
      labels: [`HostUuid=${hostUuid}`, `CPUNum=${id}`]
    })
  }

  @ResolveField(() => Number)
  async currentTemperature(@Parent() cpu: CPU) {
    const { hostUuid, id } = cpu
    const hostConnected = await this.hardwareSummaryService.getHostConnected(hostUuid)
    if (!hostConnected) {
      return ''
    }
    const metricResult = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'CpuTemperature',
      labels: [`HostUuid=${hostUuid}`, `CPUNum=${id}`]
    })
    return metricResult.data?.[0]?.value
  }

  @Query(() => QueryHostPhysicalCpuResp)
  async hostPhysicalCpuList(@Args() args: QueryHostPhysicalCpuArgs) {
    return this.service.queryHostPhysicalCpuList(args)
  }
}
