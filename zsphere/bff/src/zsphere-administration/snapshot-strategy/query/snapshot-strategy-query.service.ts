import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { groupBy } from 'lodash'
import { uniq } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import {
  SchedulerJobType,
  SchedulerJobState
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'

import {
  QuerySnapshotStrategyArgs,
  SnapshotStrategyJob,
  SnapshotStrategyTrigger
} from '../snapshot-strategy.model'

@Injectable()
export class SnapshotStrategyQueryService {
  @Inject() private zqlService: ZQLService

  private snapshotStrategyJobDataloader: DataLoader<string, SnapshotStrategyJob[]>
  private snapshotStrategyTriggerDataloader: DataLoader<string, SnapshotStrategyTrigger[]>

  constructor() {
    this.snapshotStrategyJobDataloader = new DataLoader(this._querySnapshotStrategyJob)
    this.snapshotStrategyTriggerDataloader = new DataLoader(this._querySnapshotStrategyTrigger)
  }

  async query(params: QuerySnapshotStrategyArgs) {
    const zqlCondition = QueryConditionTranslator.translate(params.conditions, {
      jobType: {
        [ZOp.eq]: SchedulerJobType.volumeSnapshotGroup
      }
    })

    const zqlObject = {
      tableName: 'SchedulerJobGroup',
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
    const resp = await this.zqlService.call(zql)

    return {
      list: resp.results[0].inventories ?? [],
      total: resp.results[0].total ?? 0
    }
  }

  querySnapshotStrategyJob(uuid: string) {
    return this.snapshotStrategyJobDataloader.load(uuid)
  }

  _querySnapshotStrategyJob = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'SchedulerJob',
      condition: {
        schedulerJobGroupUuids: {
          [ZOp.in]: uniq(uuids)
        },
        state: {
          [ZOp.eq]: SchedulerJobState.Enabled
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const jobsList = resp.results?.[0]?.inventories ?? []
    const jobsMap = groupBy<SnapshotStrategyJob>(jobsList, item => item.schedulerJobGroupUuids[0])
    return uuids.map(uuid => jobsMap[uuid])
  }

  querySnapshotStrategyTrigger(uuid: string) {
    return this.snapshotStrategyTriggerDataloader.load(uuid)
  }

  _querySnapshotStrategyTrigger = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'SchedulerTrigger',
      condition: {
        uuid: {
          [ZOp.in]: uniq(uuids)
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const triggersList: SnapshotStrategyTrigger[] = resp.results?.[0]?.inventories ?? []
    const triggersMap = new Map(triggersList.map(item => [item.uuid, item]))
    return uuids.map(uuid => (triggersMap.has(uuid) ? [triggersMap.get(uuid)] : []))
  }
}
