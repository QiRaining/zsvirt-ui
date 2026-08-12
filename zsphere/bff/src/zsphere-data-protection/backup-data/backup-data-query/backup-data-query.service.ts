import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  BackupDataIsRemoteSynced,
  BackupResourceFullBackupType,
  BackupResourceType,
  BackupResourceVmBackupType,
  QueryVolumeBackupArgs
} from '../backup-data.model'

@Injectable()
export class BackupDataQueryService {
  @Inject() zqlService: ZQLService

  private localBackupStorageDataLoader
  private remoteBackupStorageDataLoader
  private inLocalDataLoader
  private inRemoteDataLoader
  private canSyncToRemoteDataLoader
  private dataVolumeBackupDataloader
  private localLatestDataloader
  private remoteLatestDataloader

  constructor() {
    this.localBackupStorageDataLoader = new DataLoader(this._getLocalBackupStorage)
    this.remoteBackupStorageDataLoader = new DataLoader(this._getRemoteBackupStorage)
    this.inLocalDataLoader = new DataLoader(this._inLocal)
    this.inRemoteDataLoader = new DataLoader(this._inRemote)
    this.canSyncToRemoteDataLoader = new DataLoader(this._getCanSyncToRemote)
    this.dataVolumeBackupDataloader = new DataLoader(this._getDataVolumeBackup)
    this.localLatestDataloader = new DataLoader(this._getLatest('local'))
    this.remoteLatestDataloader = new DataLoader(this._getLatest('remote'))
  }

  async queryList(params: QueryVolumeBackupArgs) {
    const { type = BackupResourceType.VmInstance } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case BackupResourceType.VmInstance:
        _extrazqlConditions = {
          type: 'Root'
        }
        break
      case BackupResourceType.Volume:
        _extrazqlConditions = {
          type: 'Data'
        }
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getVolumeBackupList(params, zqlCondition)

    return _resultResp
  }

  async getVolumeBackupList(param: QueryVolumeBackupArgs, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'VolumeBackup',
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
          backupDataSize: item.size,
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
      'backupType',
      '_VolumeBackupStorageRefReadyStatus_',
      'isIncludeDataVolume',
      'isRemoteSynced',
      'isLocalSynced'
    ])

    const specicalCondition = []

    // 根据BS筛选状态为Ready的备份数据
    if (_extraConditionMap['_VolumeBackupStorageRefReadyStatus_']) {
      const backupStorageUuids: string[] = _.compact(
        _.flatten([
          _extraConditionMap['_VolumeBackupStorageRefReadyStatus_']?.value ||
            _extraConditionMap['_VolumeBackupStorageRefReadyStatus_']?.values
        ])
      )

      const unknownLocalBackupStorage: boolean = _.includes(
        backupStorageUuids,
        '__UnknownLocalBackupStorageUuid__'
      )
      const unknownRemoteBackupStorage: boolean = _.includes(
        backupStorageUuids,
        '__UnknownRemoteBackupStorageUuid__'
      )

      const systemTags = []

      if (unknownLocalBackupStorage) {
        systemTags.push('onlybackup')
        systemTags.push('allowbackup')
      }

      if (unknownRemoteBackupStorage) {
        systemTags.push('aliyun')
        systemTags.push('remotebackup')
      }

      const _ZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VolumeBackupStorageRef',
              fields: ['volumeBackupUuid'],
              condition: {
                status: {
                  [ZOp.ne]: 'Deleted' // 状态为删除的，认为数据不存在了。
                },
                backupStorageUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'backupstorage',
                      fields: ['uuid'],
                      condition: {
                        type: 'ImageStoreBackupStorage',
                        __systemTag__: {
                          [ZOp.in]: systemTags
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

      specicalCondition.push(_ZqlCondition)
    }

    // 根据zoneUuid搜索过滤
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid: string = _extraConditionMap['zoneUuid']?.value

      // 可能还在创建中，创建中的备份数据是查询不到BS的。(通用查询，不应该考虑status是否为Ready)
      const vmZqlCondition = {
        [ZOp.or]: [
          {
            'backupStorage.zone.uuid': zoneUuid
          },
          {
            volumeUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'Volume',
                  fields: ['uuid'],
                  condition: {
                    'primaryStorage.zoneUuid': zoneUuid
                  }
                }
              }
            }
          }
        ]
      }
      specicalCondition.push(vmZqlCondition)
    }

    // 根据备份类型搜索过滤，backupType：增量/全量  Incremental/Full
    if (_extraConditionMap['backupType']) {
      const backupTypes: string | string[] =
        _extraConditionMap['backupType']?.value || _extraConditionMap['backupType']?.values
      const backupTypeList = _.flatten([backupTypes])

      const hasfull: boolean = _.includes(backupTypeList, BackupResourceFullBackupType.Full)
      const hasIncremental: boolean = _.includes(
        backupTypeList,
        BackupResourceFullBackupType.Incremental
      )

      if (hasfull && hasIncremental) {
        // 不用处理
      } else if (hasfull) {
        const modeZql = {
          mode: {
            [ZOp.eq]: 'full'
          }
        }
        specicalCondition.push(modeZql)
      } else if (hasIncremental) {
        const modeZql = {
          mode: {
            [ZOp.ne]: 'full'
          }
        }
        specicalCondition.push(modeZql)
      }
    }

    // 根据备份是否包含云盘搜索过滤，isIncludeDataVolume：Include/NotInclude
    if (_extraConditionMap['isIncludeDataVolume']) {
      const includeDataVolumes: string | string[] =
        _extraConditionMap['isIncludeDataVolume']?.value ||
        _extraConditionMap['isIncludeDataVolume']?.values
      const includeDataVolumeList = _.flatten([includeDataVolumes])

      const include: boolean = _.includes(includeDataVolumeList, BackupResourceVmBackupType.Include)
      const notInclude: boolean = _.includes(
        includeDataVolumeList,
        BackupResourceVmBackupType.NotInclude
      )

      if (include && notInclude) {
        // 不用处理
      } else if (include) {
        const metadataZql = {
          metadata: {
            [ZOp.like]: 'dataVolumeUuids":['
          }
        }
        specicalCondition.push(metadataZql)
      } else if (notInclude) {
        const metadataZql = {
          metadata: {
            [ZOp.notLike]: 'dataVolumeUuids":['
          }
        }
        specicalCondition.push(metadataZql)
      }
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

    const defaultL3NetworkUuid = metadata?.defaultL3NetworkUuid
    const dataVolumeUuids = metadata?.dataVolumeUuids || []
    const rootAndData = !!metadata?.dataVolumeUuids
    const format = metadata?.format
    const isShareable = metadata?.isShareable
    const volumeBandWidth = (() => {
      const systemTags = metadata?.systemTags || []
      if (!systemTags) {
        return ''
      }
      const volumeBandWidth = _.find(systemTags, tag => _.includes(tag.tag, 'volumeTotalBandwidth'))
      if (!volumeBandWidth || _.includes(volumeBandWidth.tag, '-1')) {
        return 'unlimited'
      }
      const value = volumeBandWidth.tag.split('::')[1]
      return value
    })()
    const isVirtioSCSI = (() => {
      const systemTags = metadata?.systemTags || []
      return systemTags && systemTags.some(tag => _.includes(tag.tag, 'virtio-scsi'))
    })()
    const wwn = (() => {
      const systemTags = metadata?.systemTags || []
      if (!systemTags) {
        return ''
      }
      const WWN = _.find(systemTags, tag => _.includes(tag.tag, 'kvm::volume::'))
      return WWN.tag.split('::')[2]
    })()

    const platform = metadata?.platform
    const cpuNum = metadata?.cpuNum
    const memorySize = metadata?.memorySize
    const size = metadata?.size
    const actualSize = metadata?.actualSize
    const vmSystemTags = metadata?.vmSystemTags
    const attachedVmName = metadata?.vmName
    const vmDescription = metadata?.vmDescription
    const metadataName = metadata?.name
    const metadataDescription = metadata?.description

    return {
      size,
      dataVolumeUuids,
      defaultL3NetworkUuid,
      rootAndData,
      actualSize,
      format,
      vmDescription,
      isShareable,
      volumeBandWidth,
      isVirtioSCSI,
      wwn,
      platform,
      cpuNum,
      memorySize,
      vmSystemTags,
      metadataName,
      metadataDescription,
      attachedVmName
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
              tableName: 'VolumeBackup',
              condition: {
                [ZOp.and]: [
                  {
                    uuid: uuid
                  },
                  {
                    uuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'VolumeBackupStorageRef',
                          fields: ['volumeBackupUuid'],
                          condition: {
                            status: {
                              [ZOp.ne]: 'Deleted' // 状态为删除的，认为数据不存在了。
                            },
                            backupStorageUuid: {
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
                          }
                        }
                      }
                    }
                  }
                ]
                // 'backupStorageRefs.backupStorageUuid': {
                //   [ZOp.in]: {
                //     [ZOp.query]: {
                //       tableName: 'backupstorage',
                //       fields: ['uuid'],
                //       condition: {
                //         type: 'ImageStoreBackupStorage',
                //         __systemTag__: {
                //           [ZOp.in]: ['aliyun', 'remotebackup']
                //         }
                //       }
                //     }
                //   }
                // }
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
                              tableName: 'VolumeBackupStorageRef',
                              fields: ['backupStorageUuid'],
                              condition: {
                                volumeBackupUuid: uuid
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
                      tableName: 'VolumeBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        volumeBackupUuid: uuid
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
                      tableName: 'VolumeBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        volumeBackupUuid: uuid
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
                      tableName: 'VolumeBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        volumeBackupUuid: uuid,
                        status: {
                          [ZOp.ne]: 'Deleted' // 删除后需要重新同步
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
                      tableName: 'VolumeBackupStorageRef',
                      fields: ['backupStorageUuid'],
                      condition: {
                        volumeBackupUuid: uuid,
                        status: {
                          [ZOp.ne]: 'Deleted' // 删除后需要重新同步
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

  async getDataVolumeBackup(groupUuid: string) {
    return this.dataVolumeBackupDataloader.load(groupUuid)
  }

  _getDataVolumeBackup = async (groupUuids: string[]) => {
    const zqlObj = {
      tableName: 'VolumeBackup',
      condition: {
        type: 'Data',
        groupUuid: {
          [ZOp.in]: _.uniq(groupUuids)
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results = [] } = await this.zqlService.call(zql)
    const resultList = results[0]?.inventories ?? []
    const resultMap = _.groupBy(resultList, 'groupUuid')
    return groupUuids.map(uuid =>
      resultMap[uuid]?.map(item => ({
        ...item,
        backupDataSize: item.size,
        ...this.translateMetaData(item.metadata)
      }))
    )
  }

  async getLocalLatest(vmInstanceUuid: string) {
    return this.localLatestDataloader.load(vmInstanceUuid)
  }

  async getRemoteLatest(vmInstanceUuid) {
    return this.remoteLatestDataloader.load(vmInstanceUuid)
  }

  _getLatest = (type: 'local' | 'remote') => async (vmInstanceUuids: string[]) => {
    const uuids = _.compact(_.uniq(vmInstanceUuids))
    const zql = ZQL.multStringify(
      uuids.map(uuid => ({
        tableName: 'VolumeBackup',
        condition: {
          vmInstanceUuid: uuid,
          type: 'Root',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VolumeBackupStorageRef',
                fields: ['volumeBackupUuid'],
                condition: {
                  status: {
                    [ZOp.ne]: 'Deleted'
                  },
                  backupStorageUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'BackupStorage',
                        fields: ['uuid'],
                        condition: {
                          type: 'ImageStoreBackupStorage',
                          __systemTag__: {
                            [ZOp.in]:
                              type === 'local' ? ['allowbackup', 'onlybackup'] : ['remotebackup']
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
        orderBy: 'createDate',
        orderDirection: 'desc',
        limit: 1
      }))
    )
    const { results = [] } = await this.zqlService.call(zql)
    const resultMap = new Map()
    results.forEach(item => {
      const value = item?.inventories?.[0]
      const uuid = value?.vmInstanceUuid
      if (uuid) {
        resultMap.set(uuid, value)
      }
    })
    return vmInstanceUuids.map(uuid => resultMap.get(uuid ?? ''))
  }
}
