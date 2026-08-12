import { Inject, Injectable } from '@nestjs/common'
import { get as _get } from 'lodash'

import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'

import { HostQueryService } from '../host/query/host-query.service'
import { QueryCPUArgs, QueryCPUResp, QueryHostPhysicalCpuArgs } from './cpu.model'

const findTagValue = (list: any[], name: string) => {
  const target = list.find(item => item.tag.includes(`${name}::`))
  const value = target?.tag?.split(`${name}::`)[1]
  return value || ''
}

@Injectable()
export class CPUService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() zqlService: ZQLService
  @Inject() hostQueryService: HostQueryService

  async list(params: QueryCPUArgs): Promise<QueryCPUResp> {
    const { hostUuid } = params
    const hostParams: QueryParam = {
      conditions: [{ key: 'uuid', op: Op.eq, value: hostUuid }],
      start: 0,
      limit: 1
    }
    const hostResp = await this.queryHostAction.call(hostParams)
    const currentHost = _get(hostResp, ['inventories', '0'], {})
    const architecture = _get(currentHost, ['architecture'], '')
    const cpuSockets = _get(currentHost, ['cpuSockets'], 2)
    const logicKernel = _get(currentHost, ['cpuNum'])

    const systemTagParams: QueryParam = {
      conditions: [{ key: 'resourceUuid', op: Op.eq, value: hostUuid }],
      start: 0,
      limit: 1000
    }
    const { inventories: tagList = [] } = await this.querySystemTagAction.call(systemTagParams)
    const model = findTagValue(tagList, 'hostCpuModelName')
    const physicalCores = findTagValue(tagList, 'cpuProcessorNum')
    const GHz = findTagValue(tagList, 'cpuGHz')
    const cache = findTagValue(tagList, 'cpuCache')
    const [level1Cache, level2Cache, level3Cache] = cache.split(',')

    const list = []
    for (let i = 0; i < cpuSockets; i++) {
      const CPUNum = `CPU${i}`
      list.push({
        id: CPUNum,
        name: CPUNum,
        model,
        architecture,
        logicKernel,
        physicalCores,
        GHz,
        level1Cache,
        level2Cache,
        level3Cache,
        hostUuid
      })
    }

    return {
      list,
      total: list.length
    }
  }

  async queryHostPhysicalCpuList(params: QueryHostPhysicalCpuArgs) {
    const hostUuid = params.conditions.find(item => item.key === 'hostUuid')?.value
    if (!hostUuid) {
      return { list: [], total: 0 }
    }

    const { cpuGHz, cpuSocketCoreThread, hostCpuModelName } =
      await this.hostQueryService.getSystemInfo(hostUuid)

    if (!cpuSocketCoreThread?.sockets) {
      return { list: [], total: 0 }
    }

    const currentSpeed = cpuGHz ? `${cpuGHz} GHz` : undefined
    const { sockets, coresPerSocket, threadsPerCore } = cpuSocketCoreThread
    const threadCount =
      coresPerSocket && threadsPerCore ? coresPerSocket * threadsPerCore : undefined
    const list = Array.from({ length: sockets }, (_, i) =>
      params.sortBy === 'socketDesignation' && params.sortDirection === 'desc' ? sockets - i - 1 : i
    ).map(i => ({
      uuid: `CPU ${i}`,
      socketDesignation: `CPU ${i}`,
      version: hostCpuModelName,
      coreCount: coresPerSocket,
      threadCount,
      hostUuid,
      currentSpeed
    }))

    return { list, total: list.length }
  }
}
