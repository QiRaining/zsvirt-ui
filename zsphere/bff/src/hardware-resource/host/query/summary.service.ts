import { Inject, Injectable } from '@nestjs/common'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { get as _get } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import {
  GetMetricDataAction,
  GetMetricDataActionParam as IGetMetricDataActionParam,
  GetMetricDataResult
} from '@/api/zstack/GetMetricDataAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryHostPhysicalMemoryAction } from '@/api/zstack/QueryHostPhysicalMemoryAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { HostStatus } from '@/common/enum'
import { QueryCPUArgs } from '@/hardware-resource/cpu/cpu.model'

import { HardwareState } from '../host.model'

@Injectable()
export class HardwareSummaryService {
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryHostPhysicalMemoryAction: QueryHostPhysicalMemoryAction

  async query(params: QueryCPUArgs): Promise<HardWareSummary> {
    const { hostUuid } = params
    const hostResp = await this.queryHostAction.call({
      conditions: [{ key: 'uuid', op: Op.eq, value: hostUuid }]
    })
    const currentHost = _get(hostResp, ['inventories', '0'], {})
    const cpuSockets = _get(currentHost, ['cpuSockets'], 2)
    const hostConnected = _get(currentHost, ['status'], '') === HostStatus.Connected

    const cpuResult = await this.getMetricDataAction.call(
      this.getQueryParam(hostUuid, { metricName: 'CpuStatus' })
    )
    const cpu = this.getStatus(cpuResult, hostConnected, {
      defaultTotal: cpuSockets
    })
    const temperatureSensor = cpu

    const memoryResult = await this.getMetricDataAction.call(
      this.getQueryParam(hostUuid, { metricName: 'PhysicalMemoryStatus' })
    )
    const momoryResp = await this.queryHostPhysicalMemoryAction.call({
      conditions: [{ key: 'hostUuid', op: Op.eq, value: hostUuid }],
      count: true
    })
    const memory = this.getStatus(memoryResult, hostConnected, {
      defaultTotal: momoryResp.total || 8
    })

    const fanResult = await this.getMetricDataAction.call(
      this.getQueryParam(hostUuid, { metricName: 'FanSpeedState' })
    )
    const fan = this.getStatus(fanResult, hostConnected)

    const powerResult = await this.getMetricDataAction.call(
      this.getQueryParam(hostUuid, { metricName: 'PowerSupply' })
    )
    const power = this.getStatus(powerResult, hostConnected, {
      error: 20
    })
    if (hostConnected) {
      power.error = 0
      power.noElectric = this.getCount(powerResult, 10)
    }

    const diskResult = await this.getMetricDataAction.call(
      this.getQueryParam(hostUuid, { metricName: 'PhysicalDiskState' })
    )
    const disk = this.getStatus<HardWareStatus>(diskResult, hostConnected, {
      error: 100
    })
    if (hostConnected) {
      disk.rebuild = this.getCount(diskResult, 5)
      disk.offline = this.getCount(diskResult, 10)
    }

    return {
      cpu,
      memory,
      disk,
      power,
      fan,
      temperatureSensor
    }
  }

  async getHostConnected(hostUuid: string): Promise<boolean> {
    const res = await this.queryHostAction.call({
      conditions: [{ key: 'uuid', op: Op.eq, value: hostUuid }],
      start: 0,
      limit: 1
    })
    const connected = _get(res, ['inventories', '0', 'status'], '') === HostStatus.Connected
    return connected
  }

  getQueryParam = (hostUuid: string, param: Partial<IGetMetricDataActionParam>) => {
    return {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'CpuStatus',
      labels: [`HostUuid=${hostUuid}`],
      ...param
    }
  }

  async getMetric(hostUuid: string, param: Partial<IGetMetricDataActionParam>) {
    return await this.getMetricDataAction.call(this.getQueryParam(hostUuid, param))
  }

  async getState(
    hostUuid: string,
    param: Partial<IGetMetricDataActionParam>,
    customMap?: Map<number, HardwareState>
  ) {
    const hostConnected = await this.getHostConnected(hostUuid)
    if (!hostConnected) {
      return HardwareState.Unknown
    }

    try {
      const metricResult = await this.getMetric(hostUuid, param)
      const stateMap =
        customMap ||
        new Map<number, HardwareState>([
          [0, HardwareState.Normal],
          [10, HardwareState.Abnormal],
          [20, HardwareState.Unknown]
        ])
      const key = metricResult.data?.[0]?.value ?? 20
      return stateMap.get(key)
    } catch (error) {
      return HardwareState.Unknown
    }
  }

  getCount = (result: GetMetricDataResult, value: any) => {
    return result.data.filter(item => item?.value === value).length
  }

  getStatus = <T extends HardWareStatus>(
    result: GetMetricDataResult,
    hostConnected?: boolean,
    config: {
      normal?: any
      error?: any
      unknown?: any
      defaultTotal?: number
    } = {}
  ): T => {
    const { normal = 0, error = 10, unknown = 20, defaultTotal = 0 } = config
    let total = defaultTotal
    // 物理机失联或监控数据为空是，直接返回未知状态
    if (!hostConnected || result.data.length === 0) {
      return {
        normal: 0,
        error: 0,
        unknown: total,
        total
      } as T
    }
    total = result.data.length
    const getCount = (value: any) => this.getCount(result, value)
    return {
      normal: getCount(normal),
      error: getCount(error),
      unknown: getCount(unknown),
      total
    } as T
  }
}

@ObjectType()
class HardWareStatus {
  @Field(() => Int, { nullable: true })
  normal?: number

  @Field(() => Int, { nullable: true })
  error?: number

  @Field(() => Int, { nullable: true })
  unknown?: number

  @Field(() => Int, { nullable: true })
  noElectric?: number

  @Field(() => Int, { nullable: true })
  rebuild?: number

  @Field(() => Int, { nullable: true })
  offline?: number

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class HardWareSummary {
  @Field(() => HardWareStatus, { nullable: true })
  cpu?: HardWareStatus

  @Field(() => HardWareStatus, { nullable: true })
  memory?: HardWareStatus

  // ，0表示正常，10表示未上电，20表示异常
  @Field(() => HardWareStatus, { nullable: true })
  fan?: HardWareStatus

  @Field(() => HardWareStatus, { nullable: true })
  power?: HardWareStatus

  @Field(() => HardWareStatus, { nullable: true })
  disk?: HardWareStatus

  @Field(() => HardWareStatus, { nullable: true })
  temperatureSensor?: HardWareStatus
}
