import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact } from 'lodash'
import { get as _get, reduce as _reduce, isEqual as _isEqual } from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { SchedulerJobHistoryQueryType } from '../scheduler-job-history.model'

@Injectable()
export class SchedulerJobHistoryQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceNamesAction: GetResourceNamesAction

  private databaseResourceUuid = '7ae6456c0b01324dae6d4bef358a5772' // 数据库备份任务
  private resourceInfoDataLoader

  private fireInstanceIdResourceMap: any = {}

  constructor() {
    this.resourceInfoDataLoader = new DataLoader(this._getResourceInfo)
  }

  async queryList(params: IQueryAction) {
    const { type = SchedulerJobHistoryQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case SchedulerJobHistoryQueryType.NORMAL:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getSchedulerJobHistoryList(params, zqlCondition)

    return _resultResp
  }

  async getSchedulerJobHistoryList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'SchedulerJobHistory',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      groupBy: param.groupBy,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const SchedulerJobHistorys = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: SchedulerJobHistorys,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__backupMode__',
      '__jobResult__'
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'SchedulerJobHistoryVO')
      )
    }

    if (_extraConditionMap['__backupMode__']) {
      const isIncrement = _isEqual(_extraConditionMap['__backupMode__'].value, 'increment')
      const isFull = _isEqual(_extraConditionMap['__backupMode__'].value, 'full')
      const isAll = _isEqual(_extraConditionMap['__backupMode__'].value, 'all')
      // 增量
      if (isIncrement) {
        specicalCondition.push({
          [ZOp.or]: [
            {
              requestDump: {
                [ZOp.like]: 'mode":"auto'
              }
            },
            {
              requestDump: {
                [ZOp.like]: 'mode":"incremental'
              }
            }
          ]
        })
      }
      // 全量
      if (isFull) {
        specicalCondition.push({
          requestDump: {
            [ZOp.like]: 'mode":"full'
          }
        })
      }

      if (isAll) {
      }
    }

    if (_extraConditionMap['__jobResult__']) {
      const isSuccess = _isEqual(_extraConditionMap['__jobResult__'].value, 'success')
      const isfail = _isEqual(_extraConditionMap['__jobResult__'].value, 'fail')
      const isBackuping = _isEqual(_extraConditionMap['__jobResult__'].value, 'backuping')
      const isAll = _isEqual(_extraConditionMap['__jobResult__'].value, 'all')

      if (isSuccess) {
        specicalCondition.push({
          success: 'true'
        })
      }

      if (isfail) {
        specicalCondition.push({
          success: {
            [ZOp.ne]: 'true'
          },
          resultDump: {
            [ZOp.ne]: 'Running'
          }
        })
      }

      if (isBackuping) {
        specicalCondition.push({
          resultDump: 'Running'
        })
      }

      if (isAll) {
      }
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getResourceInfo(fireInstanceIdId, row) {
    this.fireInstanceIdResourceMap[fireInstanceIdId] = {
      targetResourceUuid: row.targetResourceUuid,
      jobType: row.jobType
    }
    return this.resourceInfoDataLoader.load(fireInstanceIdId)
  }

  _getResourceInfo = async (uuids: string[]) => {
    const _uuids = uuids
      .map(uuid => {
        const { jobType } = this.fireInstanceIdResourceMap[uuid]
        if (jobType !== 'databaseBackup') {
          return uuid
        }
        return null
      })
      .filter(Boolean)

    const genZql = uuid => {
      const { targetResourceUuid, jobType } = this.fireInstanceIdResourceMap[uuid]
      if (jobType === 'vmBackup' || jobType === 'rootVolumeBackup') {
        return {
          tableName: 'VmInstance',
          fiedls: ['uuid', 'name'],
          condition: {
            rootVolumeUuid: targetResourceUuid
          },
          namedAs: uuid
        }
      }

      if (jobType === 'volumeBackup') {
        return {
          tableName: 'Volume',
          fiedls: ['uuid', 'name'],
          condition: {
            uuid: targetResourceUuid
          },
          namedAs: uuid
        }
      }
    }

    let map = {}
    if (_uuids?.length) {
      const zql = ZQL.multStringify(_uuids.map(uuid => genZql(uuid)))
      const { results = [] } = await this.zqlService.call(zql)
      map = _reduce(
        results,
        (obj, it) => {
          obj[it.name] = _get(it, ['inventories', 0])
          return obj
        },
        {}
      )
    }

    return uuids.map(uuid => {
      const obj = _get(map, uuid)
      if (obj) {
        return obj
      } else {
        const { targetResourceUuid, jobType } = this.fireInstanceIdResourceMap[uuid]
        if (jobType === 'databaseBackup' || targetResourceUuid === this.databaseResourceUuid) {
          return {
            uuid: targetResourceUuid,
            name: 'databaseBackup'
          }
        }
      }
    })
  }
}
