import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import dayjs from 'dayjs'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetDatabaseBackupFromImageStoreAction } from '@/api/zstack/GetDatabaseBackupFromImageStoreAction'
import { QueryAction, SortDirectionValidValues } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { BackupDataFormImageStorageResp } from '@/network-resource/virtual-router-offering/virtual-router-offering.model'

import { BackupDataIsRemoteSynced } from '../backup-data.model'

@Injectable()
export class DatabaseBackupQueryService {
  @Inject() zqlService: ZQLService
  @Inject()
  getDatabaseBackupFromImageStoreAction: GetDatabaseBackupFromImageStoreAction

  private localBackupStorageDataLoader
  private remoteBackupStorageDataLoader
  private inLocalDataLoader
  private inRemoteDataLoader
  private canSyncToRemoteDataLoader

  constructor() {
    this.localBackupStorageDataLoader = new DataLoader(this._getLocalBackupStorage)
    this.remoteBackupStorageDataLoader = new DataLoader(this._getRemoteBackupStorage)
    this.inLocalDataLoader = new DataLoader(this._inLocal)
    this.inRemoteDataLoader = new DataLoader(this._inRemote)
    this.canSyncToRemoteDataLoader = new DataLoader(this._getCanSyncToRemote)
  }

  async queryList(params: QueryAction) {
    let _extrazqlConditions
    let _resultResp = null

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getDatabaseBackupList(params, zqlCondition)

    return _resultResp
  }

  async getDatabaseBackupList(param: QueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'DatabaseBackup',
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

    const list = _.reduce(
      results?.[0]?.inventories || [],
      (arr, item) => {
        const otherInfo = this.translateMetaData(item?.metadata)
        arr.push({
          ...item,
          ...otherInfo
        })
        return arr
      },
      []
    )

    const total = results?.[0]?.total ?? 0

    return {
      list: list,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      '_VolumeBackupStorageRefReadyStatus_',
      'isRemoteSynced',
      'isLocalSynced'
    ])

    const specicalCondition = []

    // 根据zoneUuid搜索过滤
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuids: string | string[] =
        _extraConditionMap['zoneUuid']?.value || _extraConditionMap['zoneUuid']?.values

      // 可能还在创建中，创建中的备份数据是查询不到BS的。
      const zoneZqlCondition = {
        'backupStorage.attachedZoneUuids': {
          [ZOp.in]: _.flatten([zoneUuids])
        }
      }
      specicalCondition.push(zoneZqlCondition)
    }

    // 是否同步到远端isRemoteSynced
    if (_extraConditionMap['isRemoteSynced']) {
      const values: string | string[] =
        _extraConditionMap['isRemoteSynced']?.value || _extraConditionMap['isRemoteSynced']?.values
      const valueList = _.flatten([values])

      const yes: boolean = _.includes(valueList, BackupDataIsRemoteSynced.Yes)
      const no: boolean = _.includes(valueList, BackupDataIsRemoteSynced.No)

      if (yes && no) {
        // 不用处理
      } else if (yes) {
        specicalCondition.push({
          'backupStorageRefs.backupStorageUuid': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'backupstorage',
                fields: ['uuid'],
                condition: {
                  type: 'ImageStoreBackupStorage',
                  __systemTag__: {
                    [ZOp.in]: ['aliyun', 'remotebackup']
                  }
                }
              }
            }
          }
        })
      } else if (no) {
        specicalCondition.push({
          'backupStorageRefs.backupStorageUuid': {
            [ZOp.notHas]: {
              [ZOp.query]: {
                tableName: 'backupstorage',
                fields: ['uuid'],
                condition: {
                  type: 'ImageStoreBackupStorage',
                  __systemTag__: {
                    [ZOp.in]: ['aliyun', 'remotebackup']
                  }
                }
              }
            }
          }
        })
      }
    }

    // 是否同步到本地isLocalSynced
    if (_extraConditionMap['isLocalSynced']) {
      const values: string | string[] =
        _extraConditionMap['isLocalSynced']?.value || _extraConditionMap['isLocalSynced']?.values
      const valueList = _.flatten([values])

      const yes: boolean = _.includes(valueList, BackupDataIsRemoteSynced.Yes)
      const no: boolean = _.includes(valueList, BackupDataIsRemoteSynced.No)

      if (yes && no) {
        // 不用处理
      } else if (yes) {
        specicalCondition.push({
          'backupStorageRefs.backupStorageUuid': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'backupstorage',
                fields: ['uuid'],
                condition: {
                  type: 'ImageStoreBackupStorage',
                  __systemTag__: {
                    [ZOp.in]: ['onlybackup', 'allowbackup']
                  }
                }
              }
            }
          }
        })
      } else if (no) {
        specicalCondition.push({
          'backupStorageRefs.backupStorageUuid': {
            [ZOp.notHas]: {
              [ZOp.query]: {
                tableName: 'backupstorage',
                fields: ['uuid'],
                condition: {
                  type: 'ImageStoreBackupStorage',
                  __systemTag__: {
                    [ZOp.in]: ['onlybackup', 'allowbackup']
                  }
                }
              }
            }
          }
        })
      }
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  translateMetaData(_metadata: string) {
    let metadata: any = {}
    try {
      // 还没有备份完，metadata 不存在
      metadata = JSON.parse(_metadata)
    } catch (error) {
      console.log(error)
    }

    const version = metadata?.version
    const md5 = metadata?.md5

    return {
      version,
      md5
    }
  }

  getCanSyncToRemote(uuid) {
    return this.canSyncToRemoteDataLoader.load(uuid)
  }

  _getCanSyncToRemote = async (uuids: string[]) => {
    const _backupUuids = _.chunk(_.uniq(uuids), 50)

    let remoteResultList = [] // 收集远端是否有数据
    let remoteBsCountList = [] // 收集相同zone 远端备份服务器数量

    // 收集远端是否有数据
    await Promise.all(
      _.map(_backupUuids, async _uuids => {
        const remoteDataZql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.COUNT,
              tableName: 'DatabaseBackup',
              condition: {
                uuid: uuid,
                'backupStorageRefs.backupStorageUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'backupstorage',
                      fields: ['uuid'],
                      condition: {
                        type: 'ImageStoreBackupStorage',
                        __systemTag__: {
                          [ZOp.in]: ['aliyun', 'remotebackup']
                        }
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const remoteBsZql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.COUNT,
              tableName: 'BackupStorage',
              condition: {
                type: 'ImageStoreBackupStorage',
                __systemTag__: {
                  [ZOp.in]: ['aliyun', 'remotebackup']
                },
                attachedZoneUuids: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'BackupStorageZoneRef',
                      fields: ['zoneUuid'],
                      condition: {
                        backupStorageUuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'DatabaseBackupStorageRef',
                              fields: ['backupStorageUuid'],
                              condition: {
                                databaseBackupUuid: uuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results: remoteDataResults = [] } = await this.zqlService.call(remoteDataZql)
        const { results: remoteBsResults = [] } = await this.zqlService.call(remoteBsZql)

        remoteResultList = remoteResultList.concat(remoteDataResults)
        remoteBsCountList = remoteBsCountList.concat(remoteBsResults)
      })
    )

    const remoteDataMap = _.reduce(
      remoteResultList,
      (obj, item) => {
        obj[item.name] = _.get(item, 'total')
        return obj
      },
      {}
    )

    const remoteBsMap = _.reduce(
      remoteBsCountList,
      (obj, item) => {
        obj[item.name] = _.get(item, 'total')
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      return (
        _.isFinite(_.get(remoteDataMap, uuid)) &&
        _.isFinite(_.get(remoteBsMap, uuid)) &&
        _.get(remoteDataMap, uuid) <= 0 &&
        _.get(remoteBsMap, uuid) >= 1
      )
    })
  }

  getLocalBackupStorage(uuid) {
    return this.localBackupStorageDataLoader.load(uuid)
  }

  _getLocalBackupStorage = async (uuids: string[]) => {
    const _backupUuids = _.chunk(_.uniq(uuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_backupUuids, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              tableName: 'BackupStorage',
              condition: {
                type: 'ImageStoreBackupStorage',
                __systemTag__: {
                  [ZOp.in]: ['onlybackup', 'allowbackup']
                },
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'DatabaseBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        databaseBackupUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        obj[item.name] = _.get(item, ['inventories', '0'], null)
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(resultMap, uuid, null))
  }

  getRemoteBackupStorage(uuid) {
    return this.remoteBackupStorageDataLoader.load(uuid)
  }

  _getRemoteBackupStorage = async (uuids: string[]) => {
    const _backupUuids = _.chunk(_.uniq(uuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_backupUuids, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              tableName: 'BackupStorage',
              condition: {
                type: 'ImageStoreBackupStorage',
                __systemTag__: {
                  [ZOp.in]: ['aliyun', 'remotebackup']
                },
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'DatabaseBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        databaseBackupUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        obj[item.name] = _.get(item, ['inventories', '0'], null)
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(resultMap, uuid, null))
  }

  inLocal(uuid) {
    return this.inLocalDataLoader.load(uuid)
  }

  _inLocal = async (uuids: string[]) => {
    const _backupUuids = _.chunk(_.uniq(uuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_backupUuids, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.COUNT,
              tableName: 'BackupStorage',
              condition: {
                type: 'ImageStoreBackupStorage',
                __systemTag__: {
                  [ZOp.in]: ['onlybackup', 'allowbackup']
                },
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'DatabaseBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        databaseBackupUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        obj[item.name] =
          item?.total > 0 ? BackupDataIsRemoteSynced.Yes : BackupDataIsRemoteSynced.No
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(resultMap, uuid, BackupDataIsRemoteSynced.No))
  }

  inRemote(uuid) {
    return this.inRemoteDataLoader.load(uuid)
  }

  _inRemote = async (uuids: string[]) => {
    const _backupUuids = _.chunk(_.uniq(uuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_backupUuids, async _uuids => {
        const zql = ZQL.multStringify(
          _.map(_uuids, uuid => {
            return {
              action: ZQLAction.COUNT,
              tableName: 'BackupStorage',
              condition: {
                type: 'ImageStoreBackupStorage',
                __systemTag__: {
                  [ZOp.in]: ['aliyun', 'remotebackup']
                },
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'DatabaseBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        databaseBackupUuid: uuid
                      }
                    }
                  }
                }
              },
              namedAs: uuid
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        obj[item.name] =
          item?.total > 0 ? BackupDataIsRemoteSynced.Yes : BackupDataIsRemoteSynced.No
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(resultMap, uuid, BackupDataIsRemoteSynced.No))
  }

  async getDatabaseBackupFromImageStore(
    args: QueryAction
  ): Promise<BackupDataFormImageStorageResp> {
    const { conditions = [], start = 0, limit, sortBy, sortDirection } = args

    const extraConditions = []
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, ['url', 'name'])
    if (extraConditionMap.name?.value) {
      const name = extraConditionMap.name.value.toLocaleLowerCase()
      extraConditions.push(val => val.name.toLocaleLowerCase().includes(name))
    }

    const { backups = [] } = await this.getDatabaseBackupFromImageStoreAction.call({
      url: extraConditionMap.url?.value
    })

    const _inventories = backups.filter(val => extraConditions.every(fn => fn(val)))

    if (sortBy === 'createDate') {
      _inventories.sort(
        sortDirection === SortDirectionValidValues.asc
          ? (val1, val2) => dayjs(val1.createdTime).diff(dayjs(val2.createdTime))
          : (val1, val2) => dayjs(val2.createdTime).diff(dayjs(val1.createdTime))
      )
    }

    const total = _inventories?.length || 0

    const list = _inventories.slice(start, limit ? start + limit : total).map((val, index) => ({
      ...val,
      uuid: start + index
    }))
    return { list, total }
  }
}
