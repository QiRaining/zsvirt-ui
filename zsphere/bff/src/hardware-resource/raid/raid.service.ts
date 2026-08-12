import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetMetricDataAction, GetMetricDataActionParam } from '@/api/zstack/GetMetricDataAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'

import { HardwareSummaryService } from '../host/query/summary.service'
import { RaidLevelState, QueryRaidArgs, QueryRaidResp } from './raid.model'

@Injectable()
export class RaidService {
  @Inject() zqlService: ZQLService
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() hardwareSummaryService: HardwareSummaryService

  async raidList(params: QueryRaidArgs): Promise<QueryRaidResp> {
    const zqlCondition = QueryConditionTranslator.translate(params.conditions)
    return await this.getRaidList(params, zqlCondition)
  }

  async getRaidList(params: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'RaidController',
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

    const hostUuid = params.conditions.find(item => item.key === 'hostUuid')?.value
    const hostConnected = await this.hardwareSummaryService.getHostConnected(hostUuid)

    const metricParam: GetMetricDataActionParam = {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'RaidState'
    }
    const { data: metricList = [] } = await this.getMetricDataAction.call(metricParam)

    const parsedList = list.map(item => {
      const { uuid, productName, raidPhysicalDrives = [] } = item
      const name = `raid-controller-${uuid.substr(-4)}`
      const model = productName
      const raidMetricList = metricList.filter(item => item.labels.HostUuid === hostUuid)
      const raidMap = new Map<
        string,
        {
          raidLevel: string
          raidLevelState: RaidLevelState
          relatedDisk: number[]
        }
      >()
      raidPhysicalDrives.forEach(drive => {
        const { diskGroup, raidLevel, slotNumber } = drive
        if (diskGroup !== undefined && raidLevel) {
          const key = `${diskGroup}-${raidLevel}`
          const _metirc = raidMetricList.find(metric => metric.labels.TargetId == diskGroup)
          let raidLevelState = RaidLevelState.Abnormal
          if (!hostConnected) {
            raidLevelState = RaidLevelState.Unknown
          } else {
            switch (_metirc?.value) {
              case 0: {
                raidLevelState = RaidLevelState.Normal
                break
              }
              case 5: {
                raidLevelState = RaidLevelState.Degraged
                break
              }
              case 10: {
                raidLevelState = RaidLevelState.Rebuild
                break
              }
            }
          }
          let relatedDisk = [slotNumber]
          if (raidMap.get(key)) {
            relatedDisk = relatedDisk.concat(raidMap.get(key).relatedDisk)
          }
          relatedDisk = relatedDisk.sort()
          raidMap.set(key, {
            raidLevel,
            raidLevelState,
            relatedDisk
          })
        }
      })
      const raidMapValues = [...raidMap.values()]
      const raidLevel = raidMapValues.map(val => val.raidLevel)
      const raidLevelState = raidMapValues.map(val => val.raidLevelState)
      const relatedDisk = raidMapValues.map(val => val.relatedDisk)

      return {
        uuid,
        name,
        model,
        raidLevel,
        raidLevelState,
        relatedDisk
      }
    })

    const total = results?.[0]?.total ?? 0
    return {
      list: parsedList,
      total
    }
  }
}
