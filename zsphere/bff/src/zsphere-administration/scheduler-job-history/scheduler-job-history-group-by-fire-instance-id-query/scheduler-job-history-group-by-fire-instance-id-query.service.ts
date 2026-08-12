import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact } from 'lodash'
import {
  map as _map,
  reduce as _reduce,
  get as _get,
  uniq as _uniq,
  max as _max,
  min as _min,
  isEqual as _isEqual
} from 'lodash'

import { extractAndRemoveExtraCondition, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { Op } from '@/common/enum'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction, ZQLFn } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { databaseResourceUuid } from '@/zsphere-data-protection/local-backup-storage/query/local-backup-storage-query'

import { SchedulerJobHistoryGroupByFireInstanceIdQueryType } from '../scheduler-job-history.model'

@Injectable()
export class SchedulerJobHistoryGroupByFireInstanceIdQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceNamesAction: GetResourceNamesAction

  private resourceCountDataLoader
  private executeTimeDataLoader
  private endTimeDataLoader
  private startTimeDataLoader
  private schedulerNameDataLoader
  private successCountDataLoader
  private failCountDataLoader
  private runningCountDataLoader

  private fireInstanceIdExecuteTimeMap: any = {}
  private fireInstanceIdEndTimeMap: any = {}
  private fireInstanceIdStartTimeMap: any = {}
  private fireInstanceIdSchedulerNameMap: any = {}

  constructor() {
    this.resourceCountDataLoader = new DataLoader(this._getResourceCount)
    this.executeTimeDataLoader = new DataLoader(this._getExecuteTime)
    this.endTimeDataLoader = new DataLoader(this._getEndTime)
    this.startTimeDataLoader = new DataLoader(this._getStartTime)
    this.schedulerNameDataLoader = new DataLoader(this._getSchedulerName)
    this.successCountDataLoader = new DataLoader(this._getSuccessCount)
    this.failCountDataLoader = new DataLoader(this._getFailCount)
    this.runningCountDataLoader = new DataLoader(this._getRunningCount)
  }

  async queryList(params: IQueryAction) {
    const { type = SchedulerJobHistoryGroupByFireInstanceIdQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case SchedulerJobHistoryGroupByFireInstanceIdQueryType.NORMAL:
        break

      case SchedulerJobHistoryGroupByFireInstanceIdQueryType.OVERVIEW:
        _extrazqlConditions = this.genOverviewZqlCondition(params)
        break
    }

    if (params.conditions.filter(t => t.key === 'jobType' && t.value === 'vmBackup').length !== 0) {
      params.conditions = params.conditions
        .filter(t => t.key !== 'jobType')
        .concat([
          {
            key: 'jobType',
            op: Op.in,
            values: ['vmBackup', 'rootVolumeBackup']
          }
        ])
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getSchedulerJobHistoryList(params, zqlCondition)

    return _resultResp
  }

  async getSchedulerJobHistoryList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    // 根据 fireInstanceId 去重, groupBy 有默认值
    const zqlObject = {
      tableName: 'SchedulerJobHistory',
      condition: zqlCondition,
      orderBy: param.sortBy === 'startExecutionTime' ? 'fireInstanceId' : param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      groupBy: param.groupBy,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.multStringify([
      zqlObject,
      {
        ...zqlObject,
        fnName: ZQLFn.distinct,
        fields: ['fireInstanceId'],
        action: ZQLAction.COUNT
      }
    ])
    const { results } = await this.zqlService.call(zql)
    const SchedulerJobHistorys = results?.[0]?.inventories ?? []
    const total = results?.[1]?.total ?? 0

    return {
      list: SchedulerJobHistorys,
      total: total
    }
  }

  genOverviewZqlCondition(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const minId = extraConditionsMap['minId']
    const minStartTime = extraConditionsMap['minStartTime']
    const startTime = extraConditionsMap['startTime']
    const endTime = extraConditionsMap['endTime']
    const JobTypes = extraConditionsMap['JobType']

    let baseCondition = Object.create(null)
    if (minId && minStartTime) {
      baseCondition = {
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                [ZOp.and]: [
                  {
                    startTime: {
                      [ZOp.gte]: minStartTime
                    }
                  },
                  {
                    id: {
                      [ZOp.lt]: minId
                    }
                  },
                  {
                    startTime: {
                      [ZOp.gte]: startTime
                    }
                  },
                  {
                    startTime: {
                      [ZOp.lte]: endTime
                    }
                  }
                ]
              },
              {
                [ZOp.and]: [
                  {
                    startTime: {
                      [ZOp.lt]: minStartTime
                    }
                  },
                  {
                    id: {
                      [ZOp.lt]: minId
                    }
                  },
                  {
                    startTime: {
                      [ZOp.gte]: startTime
                    }
                  },
                  {
                    startTime: {
                      [ZOp.lte]: endTime
                    }
                  }
                ]
              }
            ]
          },
          {
            jobType: {
              [ZOp.in]:
                !JobTypes || JobTypes.length === 0
                  ? ['vmBackup', 'volumeBackup', 'rootVolumeBackup', 'databaseBackup']
                  : JobTypes
            }
          }
        ]
      }
    } else {
      baseCondition = {
        [ZOp.and]: [
          {
            startTime: {
              [ZOp.gte]: startTime
            }
          },
          {
            startTime: {
              [ZOp.lte]: endTime
            }
          },
          {
            jobType: {
              [ZOp.in]:
                !JobTypes || JobTypes.length === 0
                  ? ['vmBackup', 'volumeBackup', 'rootVolumeBackup', 'databaseBackup']
                  : JobTypes
            }
          }
        ]
      }
    }
    return baseCondition
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
      const isIncrement = _isEqual(_extraConditionMap['__backupMode__'].value, 'incremental')
      const isFull = _isEqual(_extraConditionMap['__backupMode__'].value, 'full')
      const isAll = _isEqual(_extraConditionMap['__backupMode__'].value, 'all')
      // 增量
      if (isIncrement) {
        specicalCondition.push({
          fireInstanceId: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobHistory',
                fields: ['fireInstanceId'],
                condition: {
                  resultDump: {
                    [ZOp.like]: 'mode":"full'
                  }
                }
              }
            }
          },
          targetResourceUuid: {
            [ZOp.ne]: databaseResourceUuid
          }
        })
      }
      // 全量
      if (isFull) {
        specicalCondition.push({
          [ZOp.or]: [
            {
              resultDump: {
                [ZOp.like]: 'mode":"full'
              }
            },
            {
              targetResourceUuid: databaseResourceUuid
            }
          ]
        })
      }

      if (isAll) {
      }
    }

    if (_extraConditionMap['__jobResult__']) {
      const isSuccess = _isEqual(_extraConditionMap['__jobResult__'].value, 'success')
      const isfail = _isEqual(_extraConditionMap['__jobResult__'].value, 'fail')
      const someSuccess = _isEqual(_extraConditionMap['__jobResult__'].value, 'someSuccess')
      const isBackuping = _isEqual(_extraConditionMap['__jobResult__'].value, 'backuping')
      const isAll = _isEqual(_extraConditionMap['__jobResult__'].value, 'all')

      if (isSuccess) {
        specicalCondition.push({
          success: 'true',
          fireInstanceId: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobHistory',
                fields: ['fireInstanceId'],
                condition: {
                  success: 'false'
                }
              }
            }
          }
        })
      }

      if (isfail) {
        specicalCondition.push({
          success: 'false',
          [ZOp.and]: [
            {
              fireInstanceId: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJobHistory',
                    fields: ['fireInstanceId'],
                    condition: {
                      success: 'true'
                    }
                  }
                }
              }
            },
            {
              fireInstanceId: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJobHistory',
                    fields: ['fireInstanceId'],
                    condition: {
                      resultDump: 'Running'
                    }
                  }
                }
              }
            }
          ]
        })
      }

      if (someSuccess) {
        specicalCondition.push({
          [ZOp.and]: [
            {
              fireInstanceId: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'SchedulerJobHistory',
                      fields: ['fireInstanceId'],
                      condition: {
                        success: 'true',
                        fireInstanceId: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'SchedulerJobHistory',
                              fields: ['fireInstanceId'],
                              condition: {
                                success: 'false'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              fireInstanceId: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJobHistory',
                    fields: ['fireInstanceId'],
                    condition: {
                      success: 'false',
                      fireInstanceId: {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'SchedulerJobHistory',
                            fields: ['fireInstanceId'],
                            condition: {
                              success: 'true'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
          // fireInstanceId: {
          //   [ZOp.in]: {
          //     [ZOp.query]: {
          //       tableName: 'SchedulerJobHistory',
          //       fields: ['fireInstanceId'],
          //       condition: {
          //         resultDump: 'Running'
          //       }
          //     }
          //   }
          // }
        })
      }

      if (isBackuping) {
        specicalCondition.push({
          fireInstanceId: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobHistory',
                fields: ['fireInstanceId'],
                condition: {
                  resultDump: 'Running'
                }
              }
            }
          }
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

  getStartExecutionTime(fireInstanceId) {
    this.fireInstanceIdStartTimeMap[fireInstanceId] = fireInstanceId
    return this.startTimeDataLoader.load(fireInstanceId)
  }

  _getStartTime = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SchedulerJobHistory',
      fields: ['fireInstanceId', 'startTime'],
      condition: {
        fireInstanceId: {
          [ZOp.in]: _uniq(uuids)
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []

    const firstStartTimeMap = _reduce(
      inventories,
      (obj, it) => {
        obj[it.fireInstanceId] = _min([
          Date.parse(it.startTime),
          _get(obj, it.fireInstanceId, 0) || Number.MAX_VALUE
        ])
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(firstStartTimeMap, fireInstanceId, 0))
  }

  getEndTime(fireInstanceId) {
    this.fireInstanceIdEndTimeMap[fireInstanceId] = fireInstanceId
    return this.endTimeDataLoader.load(fireInstanceId)
  }

  _getEndTime = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SchedulerJobHistory',
      fields: ['executeTime', 'fireInstanceId', 'startTime'],
      condition: {
        fireInstanceId: {
          [ZOp.in]: _uniq(uuids)
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []

    const maxExecuteTimeMap = _reduce(
      inventories,
      (obj, it) => {
        obj[it.fireInstanceId] = _max([it.executeTime, _get(obj, it.fireInstanceId, 0)])
        return obj
      },
      {}
    )
    const lastStartTimeMap = _reduce(
      inventories,
      (obj, it) => {
        obj[it.fireInstanceId] = _max([Date.parse(it.startTime), _get(obj, it.fireInstanceId, 0)])
        return obj
      },
      {}
    )
    return uuids.map(
      fireInstanceId =>
        _get(lastStartTimeMap, fireInstanceId, 0) +
        _get(maxExecuteTimeMap, fireInstanceId, 0) * 1000
    )
  }

  getExecuteTime(fireInstanceId) {
    this.fireInstanceIdExecuteTimeMap[fireInstanceId] = fireInstanceId
    return this.executeTimeDataLoader.load(fireInstanceId)
  }

  _getExecuteTime = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SchedulerJobHistory',
      fields: ['executeTime', 'fireInstanceId'],
      condition: {
        fireInstanceId: {
          [ZOp.in]: _uniq(uuids)
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []

    const maxExecuteTimeMap = _reduce(
      inventories,
      (obj, it) => {
        obj[it.fireInstanceId] = _max([it.executeTime, _get(obj, it.fireInstanceId, 0)])
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(maxExecuteTimeMap, fireInstanceId, 0))
  }

  getRunningCount(fireInstanceId) {
    return this.runningCountDataLoader.load(fireInstanceId)
  }

  _getRunningCount = async (uuids: string[]) => {
    const zqlObject = _map(uuids, fireInstanceId => ({
      action: ZQLAction.COUNT,
      tableName: 'SchedulerJobHistory',
      condition: {
        fireInstanceId: fireInstanceId,
        resultDump: {
          [ZOp.eq]: 'Running'
        }
      },
      namedAs: fireInstanceId
    }))
    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const historyMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(historyMap, fireInstanceId, 0))
  }

  getFailCount(fireInstanceId) {
    return this.failCountDataLoader.load(fireInstanceId)
  }

  _getFailCount = async (uuids: string[]) => {
    const zqlObject = _map(uuids, fireInstanceId => ({
      action: ZQLAction.COUNT,
      tableName: 'SchedulerJobHistory',
      condition: {
        fireInstanceId: fireInstanceId,
        success: {
          [ZOp.ne]: 'true'
        },
        resultDump: {
          [ZOp.ne]: 'Running'
        }
      },
      namedAs: fireInstanceId
    }))
    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const historyMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(historyMap, fireInstanceId, 0))
  }

  getSuccessCount(fireInstanceId) {
    return this.successCountDataLoader.load(fireInstanceId)
  }

  _getSuccessCount = async (uuids: string[]) => {
    const zqlObject = _map(uuids, fireInstanceId => ({
      action: ZQLAction.COUNT,
      tableName: 'SchedulerJobHistory',
      condition: {
        fireInstanceId: fireInstanceId,
        success: 'true'
      },
      namedAs: fireInstanceId
    }))
    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const historyMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(historyMap, fireInstanceId, 0))
  }

  getResourceCount(fireInstanceId) {
    return this.resourceCountDataLoader.load(fireInstanceId)
  }

  _getResourceCount = async (uuids: string[]) => {
    const zqlObject = _map(uuids, fireInstanceId => ({
      action: ZQLAction.COUNT,
      tableName: 'SchedulerJobHistory',
      condition: {
        fireInstanceId: fireInstanceId
      },
      namedAs: fireInstanceId
    }))
    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const historyMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )
    return uuids.map(fireInstanceId => _get(historyMap, fireInstanceId, 0))
  }

  getSchedulerName(history) {
    this.fireInstanceIdSchedulerNameMap[history.fireInstanceId] = _get(
      history,
      'schedulerJobGroupUuid',
      _get(history, 'schedulerJobUuid')
    )
    return this.schedulerNameDataLoader.load(history.fireInstanceId)
  }

  _getSchedulerName = async (uuids: string[]) => {
    const jobUuidList = _map(uuids, fireInstanceId =>
      _get(this.fireInstanceIdSchedulerNameMap, fireInstanceId)
    )
    const { inventories } = await this.getResourceNamesAction.call({
      uuids: _uniq(jobUuidList)
    })

    const schedulerNameMap = _reduce(
      inventories,
      (obj, item) => {
        obj[item.uuid] = item.resourceName
        return obj
      },
      {}
    )

    return uuids.map(fireInstanceId =>
      _get(schedulerNameMap, _get(this.fireInstanceIdSchedulerNameMap, fireInstanceId), null)
    )
  }

  getbackupCapacityTotalSize(schedulerJobHistorys: any[]) {
    return (
      schedulerJobHistorys?.reduce((pre, current) => {
        let resultDumps: any[] = []

        //失败的是  0
        if (!current?.success) {
          return pre + 0
        }
        try {
          const result = JSON.parse(current?.resultDump ?? '{}')
          resultDumps = result?.inventory ? result?.inventory : (result?.inventories ?? [])
        } catch (err) {}
        resultDumps = Array.isArray(resultDumps) ? resultDumps : [resultDumps]

        const totalSize = resultDumps?.reduce((pre, current) => {
          return pre + (current?.size ?? 0)
        }, 0) as number

        return pre + totalSize
      }, 0) ?? 0
    )
  }
  backupCapacityForSchedulerJobHistoryGroup = async fireInstanceId => {
    let offset = 0
    const limit = 1000
    let total = offset
    let backupCapacityForSchedulerJobHistoryGroup = 0
    do {
      const zqlObject = {
        tableName: 'SchedulerJobHistory',
        condition: {
          fireInstanceId
        },
        fields: ['resultDump', 'success'],
        limit,
        offset,
        returnWith: {
          total: true
        }
      }
      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)

      const schedulerJobHistorys = results?.[0]?.inventories ?? []
      backupCapacityForSchedulerJobHistoryGroup +=
        this.getbackupCapacityTotalSize(schedulerJobHistorys)
      total = results?.[1]?.total ?? 0
      offset += limit
    } while (total > offset)

    return (backupCapacityForSchedulerJobHistoryGroup ?? 0).toString()
  }
}
