import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  SchedulerJobGroupQueryType,
  SchedulerJobGroupType,
  SchedulerJobGroup
} from '../scheduler-job-group.model'

@Injectable()
export class SchedulerJobGroupQueryService {
  @Inject() zqlService: ZQLService

  private localBackupStorageDataLoader
  private remoteBackupStorageDataLoader
  private triggerDataLoader
  private groupBackupStatusDataLoader
  private lastJobResultDataloader
  private jobsDataloader

  private groupLocalBackupStorageMap: any = {}
  private groupRemoteBackupStorageMap: any = {}
  private groupTriggerMap: any = {}

  constructor() {
    this.localBackupStorageDataLoader = new DataLoader(this._getLocalBackupStorage)
    this.remoteBackupStorageDataLoader = new DataLoader(this._getRemoteBackupStorage)
    this.triggerDataLoader = new DataLoader(this._getTriggers)
    this.groupBackupStatusDataLoader = new DataLoader(this._getBackupStatus)
    this.lastJobResultDataloader = new DataLoader(this._getLastJobResult)
    this.jobsDataloader = new DataLoader(this._getJobs, {
      cacheKeyFn: current => current.uuid
    })
  }

  async queryList(params: IQueryAction) {
    const { type = SchedulerJobGroupQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case SchedulerJobGroupQueryType.NORMAL:
        _extrazqlConditions = undefined
        break
      case SchedulerJobGroupQueryType.GetVMAttachableBackupJob:
        _extrazqlConditions = await this.getBackupJobAttachableVM(params.extraConditions)
        break
      case SchedulerJobGroupQueryType.GetVolumeAttachableBackupJob:
        _extrazqlConditions = await this.getBackupJobAttachableVolume(params.extraConditions)
        break
      case SchedulerJobGroupQueryType.GetVmByZoneAndDatabase:
        _extrazqlConditions = this.getVmByZoneAndDatabase(params.extraConditions)
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getSchedulerJobGroupList(params, _zqlCondition)

    return _resultResp
  }

  async getSchedulerJobGroupList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'SchedulerJobGroup',
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
    const { results } = await this.zqlService.call(zql)
    const SchedulerJobGroups = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: SchedulerJobGroups,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      '__jobType__',
      '__VmInstanceUuids__'
    ])

    const specicalCondition = []

    if (_extraConditionMap['__jobType__']) {
      const isVmInstance = _.isEqual(_extraConditionMap['__jobType__'].values, ['vmInstance'])
      const isVolume = _.isEqual(_extraConditionMap['__jobType__'].values, ['volume'])
      const isVmAndVolume = _.isEqual(
        _extraConditionMap['__jobType__']?.values?.sort(),
        ['vmInstance', 'volume'].sort()
      )

      if (isVmInstance) {
        specicalCondition.push({
          jobType: {
            [ZOp.in]: ['vmBackup', 'rootVolumeBackup']
          }
        })
      } else if (isVolume) {
        specicalCondition.push({
          jobType: 'volumeBackup'
        })
      } else if (isVmAndVolume) {
      }
    }

    // 依据 vm 的 uuid，查询 vm 实例下绑定的备份任务，实质是通过相关联的表找到 SchedulerJobGroup 的 uuid
    if (_extraConditionMap['__VmInstanceUuids__']) {
      const VmInstanceUuids = _.compact(
        _.flatten([
          _extraConditionMap['__VmInstanceUuids__'].value ||
            _extraConditionMap['__VmInstanceUuids__'].values
        ])
      )
      const targetResourceZqlCondition: ZqlObject['condition'] = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SchedulerJobGroupJobRef',
              fields: ['schedulerJobGroupUuid'],
              condition: {
                schedulerJobUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SchedulerJob',
                      fields: ['uuid'],
                      condition: {
                        [ZOp.or]: [
                          {
                            targetResourceUuid: {
                              [ZOp.in]: VmInstanceUuids
                            }
                          },
                          {
                            targetResourceUuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'Volume',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'Root',
                                    vmInstanceUuid: {
                                      [ZOp.in]: VmInstanceUuids
                                    }
                                  }
                                }
                              }
                            }
                          }
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

      specicalCondition.push(targetResourceZqlCondition)
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getVmByZoneAndDatabase(extraConditions) {
    const conditionsMap: any = conditionsToObject(extraConditions)
    const zoneUuid = conditionsMap.zoneUuid
    return {
      [ZOp.or]: [
        { jobType: SchedulerJobGroupType.databaseBackup },
        {
          [ZOp.and]: [{ jobType: SchedulerJobGroupType.vmBackup }, { zoneUuid }]
        }
      ]
    }
  }

  async getBackupJobAttachableVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['volumeUuidList']
    const params = _.pick(conditionsMap, candidateKeys) as {
      volumeUuidList: string[] | string
    }

    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobGroupJobRef',
                fields: ['schedulerJobGroupUuid'],
                condition: {
                  schedulerJobUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJob',
                        fields: ['uuid'],
                        condition: {
                          jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob',
                          targetResourceUuid: {
                            [ZOp.in]: _.flatten([params?.volumeUuidList])
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
          // 相同的用户
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'SchedulerJobGroupVO',
                  accountUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'AccountResourceRef',
                        fields: ['accountUuid'],
                        condition: {
                          resourceType: 'VolumeVO',
                          resourceUuid: {
                            [ZOp.in]: _.flatten([params?.volumeUuidList])
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
      ]
    }

    return zqlCondition
  }

  async getBackupJobAttachableVM(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmUuidList']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmUuidList: string[] | string
    }

    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJobGroupJobRef',
                fields: ['schedulerJobGroupUuid'],
                condition: {
                  schedulerJobUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJob',
                        fields: ['uuid'],
                        condition: {
                          jobClassName: {
                            [ZOp.like]: 'org.zstack.storage.backup.Create%BackupJob'
                          },
                          targetResourceUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'Volume', // 云主机对应云盘如果有备份任务，则也不让创建备份任务。
                                fields: ['uuid'],
                                condition: {
                                  vmInstanceUuid: {
                                    [ZOp.in]: _.flatten([params?.vmUuidList])
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
            }
          }
        },
        {
          // 相同的用户
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'SchedulerJobGroupVO',
                  accountUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'AccountResourceRef',
                        fields: ['accountUuid'],
                        condition: {
                          resourceType: 'VmInstanceVO',
                          resourceUuid: {
                            [ZOp.in]: _.flatten([params?.vmUuidList])
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
      ]
    }

    return zqlCondition
  }

  getBackupStatus(uuid) {
    return this.groupBackupStatusDataLoader.load(uuid)
  }

  _getBackupStatus = async (uuids: string[]) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'LongJob',
        condition: {
          targetResourceUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'SchedulerJob',
                fields: ['targetResourceUuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJobGroupJobRef',
                        fields: ['schedulerJobUuid'],
                        condition: {
                          schedulerJobGroupUuid: uuid
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          jobName: {
            [ZOp.like]: 'Backup'
          },
          state: 'Running'
        },
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const volumeMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', 'length']) > 0 ? 'BackingUp' : 'Ready'
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(volumeMap, uuid, 'Ready'))
  }

  getLastJobResult(uuid: string) {
    return this.lastJobResultDataloader.load(uuid)
  }

  _getLastJobResult = async (uuids: string[]) => {
    const zqlObjs = uuids.map(uuid => ({
      tableName: 'SchedulerJobHistory',
      condition: {
        schedulerJobGroupUuid: {
          [ZOp.eq]: uuid
        }
      },
      orderBy: 'startTime',
      orderDirection: 'desc' as const,
      limit: 1,
      groupBy: 'fireInstanceId'
    }))
    const zql = ZQL.multStringify(zqlObjs)
    const { results = [] } = await this.zqlService.call(zql)
    const resultMap = results.reduce((prev, curr) => {
      const value = curr.inventories?.[0]
      if (!value) {
        return prev
      }
      prev[value.schedulerJobGroupUuid] = value
      return prev
    }, {})
    return uuids.map(uuid => resultMap[uuid])
  }

  getLocalBackupStorage(group) {
    let jobData: any = {}
    try {
      jobData = JSON.parse(group?.jobData)
    } catch (error) {
      console.log(error)
    }
    this.groupLocalBackupStorageMap[group?.uuid] = {
      uuid: group?.uuid,
      backupStorageUuids: jobData?.backupStorageUuids
    }
    return this.localBackupStorageDataLoader.load(group?.uuid)
  }

  _getLocalBackupStorage = async (uuids: string[]) => {
    const bsUuidList: any[] = _.flatten(
      uuids.map(uuid => _.get(this.groupLocalBackupStorageMap, [uuid, 'backupStorageUuids'], []))
    )
    const zql = ZQL.stringify({
      tableName: 'BackupStorage',
      condition: {
        uuid: {
          [ZOp.in]: _.uniq(bsUuidList)
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const backupStorages = results?.[0]?.inventories
    const backupStorageMap = _.reduce(
      backupStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.compact(
        _.map(
          _.get(this.groupLocalBackupStorageMap, [uuid, 'backupStorageUuids'], []),
          backupStorageUuid => _.get(backupStorageMap, backupStorageUuid, undefined)
        )
      )
    )
  }

  getRemoteBackupStorage(group) {
    let jobData: any = {}
    try {
      jobData = JSON.parse(group?.jobData)
    } catch (error) {
      console.log(error)
    }
    this.groupRemoteBackupStorageMap[group?.uuid] = {
      uuid: group?.uuid,
      remoteBackupStorageUuid: jobData?.remoteBackupStorageUuid
    }
    return this.remoteBackupStorageDataLoader.load(group?.uuid)
  }

  _getRemoteBackupStorage = async (uuids: string[]) => {
    const bsUuidList: any[] = uuids.map(uuid =>
      _.get(this.groupRemoteBackupStorageMap, [uuid, 'remoteBackupStorageUuid'])
    )
    const zql = ZQL.stringify({
      tableName: 'BackupStorage',
      condition: {
        uuid: {
          [ZOp.in]: _.uniq(bsUuidList)
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const backupStorages = results?.[0]?.inventories
    const backupStorageMap = _.reduce(
      backupStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.get(
        backupStorageMap,
        _.get(this.groupRemoteBackupStorageMap, [uuid, 'remoteBackupStorageUuid']),
        null
      )
    )
  }

  getTriggers(group) {
    this.groupTriggerMap[group?.uuid] = {
      uuid: group?.uuid,
      triggersUuid: group?.triggersUuid
    }
    return this.triggerDataLoader.load(group?.uuid)
  }

  _getTriggers = async (uuids: string[]) => {
    const triggerUuidList: any[] = _.flatten(
      uuids.map(uuid => _.get(this.groupTriggerMap, [uuid, 'triggersUuid']))
    )
    const zql = ZQL.stringify({
      tableName: 'SchedulerTrigger',
      condition: {
        uuid: {
          [ZOp.in]: _.uniq(triggerUuidList)
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const triggers = results?.[0]?.inventories
    const triggerMap = _.reduce(
      triggers,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.compact(
        _.map(_.get(this.groupTriggerMap, [uuid, 'triggersUuid'], []), triggerUuid =>
          _.get(triggerMap, triggerUuid, undefined)
        )
      )
    )
  }

  getJobs(schedulerJobGroup: SchedulerJobGroup) {
    return this.jobsDataloader.load(schedulerJobGroup)
  }

  _getJobs = async (schedulerJobGroups: SchedulerJobGroup[]) => {
    const uuids = _.uniq(_.flatten(schedulerJobGroups.map(item => item.jobsUuid ?? [])))
    const zqlObj = {
      tableName: 'SchedulerJob',
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results = [] } = await this.zqlService.call(zql)
    const resultMap = new Map((results[0]?.inventories ?? []).map(item => [item.uuid, item]))
    return schedulerJobGroups.map(item =>
      item.jobsUuid?.map(uuid => resultMap.get(uuid)).filter(item => item)
    )
  }
}
