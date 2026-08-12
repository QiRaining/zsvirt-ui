import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  groupBy,
  compact as _compact,
  flatten as _flatten,
  get as _get,
  map as _map,
  reduce as _reduce,
  uniq as _uniq
} from 'lodash'

import { Condition, extractAndRemoveExtraCondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { SchedulerJobGroup } from '@/zsphere-data-protection/backup-job/scheduler-job-group.model'

import { SchedulerJobQueryType, SchedulerJob } from '../scheduler-job.model'

@Injectable()
export class SchedulerJobQueryService {
  @Inject() zqlService: ZQLService

  private localBackupStorageDataLoader
  private remoteBackupStorageDataLoader
  private schedulerJobGroupJobRefsDataloader
  private schedulerJobGroupDataloader: DataLoader<SchedulerJob, SchedulerJobGroup[], string>

  private jobLocalBackupStorageMap: any = {}
  private jobRemoteBackupStorageMap: any = {}

  constructor() {
    this.localBackupStorageDataLoader = new DataLoader(this._getLocalBackupStorage)
    this.remoteBackupStorageDataLoader = new DataLoader(this._getRemoteBackupStorage)
    this.schedulerJobGroupJobRefsDataloader = new DataLoader(this._getSchedulerJobGroupJobRefs)
    this.schedulerJobGroupDataloader = new DataLoader(this._getSchedulerJobGroup, {
      cacheKeyFn: item => item.uuid
    })
  }

  private databaseResourceUuid = '7ae6456c0b01324dae6d4bef358a5772' // 数据库备份任务

  async queryList(params: IQueryAction) {
    const { type = SchedulerJobQueryType.Normal, conditions = [] } = params

    let _extraZqlConditions
    let _resultResp = null

    const baseConditons = {
      key: 'jobClassName',
      op: Op.notIn,
      values: [
        'org.zstack.storage.backup.CreateVolumeBackupJob',
        'org.zstack.storage.backup.CreateVmBackupJob',
        'org.zstack.scheduler.iam2.AddIAM2ProjectLoginExpiredJob',
        'org.zstack.scheduler.iam2.CancelIAM2ProjectLoginExpiredJob'
      ]
    }

    switch (type) {
      case SchedulerJobQueryType.Normal:
        break
      case SchedulerJobQueryType.DatabaseBackupJob:
        _extraZqlConditions = {
          targetResourceUuid: this.databaseResourceUuid
        }
        break
      case SchedulerJobQueryType.GetCandidateForScheduler:
        _extraZqlConditions = {
          uuid: {
            [ZOp.in]: "getapi(api='GetNoTriggerSchedulerJobs',output='inventories.uuid')"
          }
        }
        break
    }

    const zqlCondition = this.buildZqlCondition(
      conditions.concat(baseConditons),
      _extraZqlConditions
    )

    _resultResp = await this.getSchedulerJobList(params, zqlCondition)

    return _resultResp
  }

  async getSchedulerJobList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'SchedulerJob',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    console.log('zql::', zql)
    const { results } = await this.zqlService.call(zql)
    const schedulerJobs = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: schedulerJobs,
      total: total
    }
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      'jobType'
    ])

    const specicalCondition = []
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid = _extraConditionMap['zoneUuid'].value
      const targetResourceZqlCondition = {
        [ZOp.and]: {
          [ZOp.or]: [
            {
              targetResourceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'VmInstance',
                    fields: 'rootVolumeUuid',
                    condition: {
                      zoneUuid
                    }
                  }
                }
              }
            },
            {
              targetResourceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volume',
                    fields: 'uuid',
                    condition: {
                      'primaryStorage.zoneUuid': zoneUuid
                    }
                  }
                }
              }
            },
            {
              targetResourceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'VmInstance',
                    fields: 'uuid',
                    condition: {
                      zoneUuid
                    }
                  }
                }
              }
            }
          ],
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobGroupJobRef',
                fields: 'schedulerJobUuid',
                condition: {
                  schedulerJobGroupUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJobGroup',
                        fields: 'uuid',
                        condition: {
                          jobType: {
                            [ZOp.in]: [
                              'volumeBackup',
                              'rootVolumeBackup',
                              'vmBackup',
                              'databaseBackup'
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      specicalCondition.push(targetResourceZqlCondition)
    }

    // 过滤定时任务类型
    if (_extraConditionMap['jobType']) {
      const renderCondition = jobType => {
        // 'StopVmInstanceJob', 'StartVmInstanceJob', 'RebootVmInstanceJob'
        if (['StopVmInstanceJob', 'StartVmInstanceJob', 'RebootVmInstanceJob'].includes(jobType)) {
          return { jobClassName: `org.zstack.scheduler.vm.${jobType}` }
        }
        // 'CreateVolumeSnapshotJob'
        if (['CreateVolumeSnapshotJob'].includes(jobType)) {
          return {
            [ZOp.and]: {
              jobClassName: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob',
              targetResourceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volume',
                    fields: ['uuid'],
                    condition: {
                      type: jobType === 'CreateVmSnapshot' ? 'Root' : 'Data'
                    }
                  }
                }
              }
            }
          }
        }
        //'CreateVmSnapshot',
        /**
         *
         * 为什么CreateVMSnapShot里需要Zop.or一个CreateVolumeSnapshotGroupJob？
         * 这里是UED的设计习惯和后端数据结构冲突下的一个产物
         * 需要保证查询的时候单盘、快照组类型的定时任务都在‘云主机快照’下
         */
        if (['CreateVmSnapshot'].includes(jobType)) {
          return {
            [ZOp.and]: {
              jobClassName: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob',
              targetResourceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volume',
                    fields: ['uuid'],
                    condition: {
                      type: jobType === 'CreateVmSnapshot' ? 'Root' : 'Data'
                    }
                  }
                }
              }
            },
            [ZOp.or]: {
              jobClassName: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob'
            }
          }
        }
      }
      const jobClassNameList = _extraConditionMap['jobType']?.values
      if (jobClassNameList?.length) {
        specicalCondition.push({
          [ZOp.or]: jobClassNameList?.map(it => renderCondition(it))
        })
      }
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getLocalBackupStorage(job) {
    let jobData: any = {}
    try {
      jobData = JSON.parse(job?.jobData)
    } catch (error) {
      console.log(error)
    }
    this.jobLocalBackupStorageMap[job?.uuid] = {
      uuid: job?.uuid,
      backupStorageUuids: jobData?.backupStorageUuids
    }
    return this.localBackupStorageDataLoader.load(job?.uuid)
  }

  _getLocalBackupStorage = async (uuids: string[]) => {
    const bsUuidList: any[] = _flatten(
      uuids.map(uuid => _get(this.jobLocalBackupStorageMap, [uuid, 'backupStorageUuids'], []))
    )
    const zql = ZQL.stringify({
      tableName: 'BackupStorage',
      condition: {
        uuid: {
          [ZOp.in]: _uniq(bsUuidList)
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const backupStorages = results?.[0]?.inventories
    const backupStorageMap = _reduce(
      backupStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _compact(
        _map(
          _get(this.jobLocalBackupStorageMap, [uuid, 'backupStorageUuids'], []),
          backupStorageUuid => _get(backupStorageMap, backupStorageUuid, undefined)
        )
      )
    )
  }

  getRemoteBackupStorage(job) {
    let jobData: any = {}
    try {
      jobData = JSON.parse(job?.jobData)
    } catch (error) {
      console.log(error)
    }
    this.jobRemoteBackupStorageMap[job?.uuid] = {
      uuid: job?.uuid,
      remoteBackupStorageUuid: jobData?.remoteBackupStorageUuid
    }
    return this.remoteBackupStorageDataLoader.load(job?.uuid)
  }

  _getRemoteBackupStorage = async (uuids: string[]) => {
    const bsUuidList: any[] = uuids.map(uuid =>
      _get(this.jobRemoteBackupStorageMap, [uuid, 'remoteBackupStorageUuid'])
    )
    const zql = ZQL.stringify({
      tableName: 'BackupStorage',
      condition: {
        uuid: {
          [ZOp.in]: _uniq(bsUuidList)
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const backupStorages = results?.[0]?.inventories
    const backupStorageMap = _reduce(
      backupStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _get(
        backupStorageMap,
        _get(this.jobRemoteBackupStorageMap, [uuid, 'remoteBackupStorageUuid']),
        null
      )
    )
  }

  async getSchedulerJobGroupJobRefs(uuid: string) {
    return this.schedulerJobGroupJobRefsDataloader.load(uuid)
  }

  _getSchedulerJobGroupJobRefs = async (uuids: string[]) => {
    const zqlObj = {
      tableName: 'SchedulerJobGroupJobRef',
      condition: {
        schedulerJobUuid: {
          [ZOp.in]: _uniq(uuids)
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results = [] } = await this.zqlService.call(zql)
    const refList = results[0]?.inventories ?? []
    const refMap = groupBy(refList, 'schedulerJobUuid')
    return uuids.map(uuid => refMap[uuid])
  }

  async getSchedulerJobGroup(schedulerJob: SchedulerJob) {
    return this.schedulerJobGroupDataloader.load(schedulerJob)
  }

  _getSchedulerJobGroup = async (jobs: SchedulerJob[]) => {
    const jobGroupUuids = _uniq(_flatten(jobs.map(job => job.schedulerJobGroupUuids)))
    const zqlObj = {
      tableName: 'SchedulerJobGroup',
      condition: {
        uuid: {
          [ZOp.in]: jobGroupUuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results = [] } = await this.zqlService.call(zql)
    const resultList = results[0]?.inventories ?? []
    const resultMap = new Map(resultList.map(item => [item.uuid, item]))
    return jobs.map(job => {
      const res = []
      job.schedulerJobGroupUuids.forEach(uuid => {
        const group = resultMap.get(uuid)
        if (group) {
          res.push(group)
        }
      })
      return res
    })
  }
}
