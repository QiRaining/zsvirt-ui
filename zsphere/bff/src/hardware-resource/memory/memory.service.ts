import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'

import { HardwareState } from '../host/host.model'
import { HardwareSummaryService } from '../host/query/summary.service'
import { QueryMemoryArgs, QueryMemoryResp, Memory } from './memory.model'

@Injectable()
export class MemoryService {
  @Inject() zqlService: ZQLService
  @Inject() hardwareSummaryService: HardwareSummaryService

  private stateLoader: DataLoader<Memory, string, string>

  constructor() {
    this.stateLoader = new DataLoader(this._getState, {
      cacheKeyFn: m => m.uuid
    })
  }

  async memoryList(params: QueryMemoryArgs): Promise<QueryMemoryResp> {
    const zqlCondition = QueryConditionTranslator.translate(params.conditions)
    return await this.getMemoryList(params, zqlCondition)
  }

  async getMemoryList(params: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'HostPhysicalMemory',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)

    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []

    const total = results?.[0]?.total ?? 0
    return {
      list,
      total
    }
  }

  async getState(memory: Memory) {
    return this.stateLoader.load(memory)
  }

  _getState = async (memories: Memory[]) => {
    const hostUuid = memories.find(memory => !!memory.hostUuid)?.hostUuid
    if (!hostUuid) {
      return memories.map(() => HardwareState.Unknown)
    }
    const { data = [] } = await this.hardwareSummaryService.getMetric(hostUuid, {
      metricName: 'IPMIPhysicalMemoryStatus'
    })
    const stateMap = new Map([
      [0, HardwareState.Normal],
      [10, HardwareState.Abnormal],
      [20, HardwareState.Unknown]
    ])
    return memories.map(({ locator }) => {
      if (!locator) {
        return HardwareState.Unknown
      }
      const value =
        data.find(({ labels }) => !!labels?.Name && locator.startsWith(labels.Name))?.value ?? 20
      return stateMap.get(value) ?? HardwareState.Unknown
    })
  }
}
