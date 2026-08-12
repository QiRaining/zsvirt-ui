import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction, ZQLFn } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  BackupResourceType,
  QueryBackupResourceArgs,
  VolumeBackupDataSummaryArgs,
  VolumeBackupDataSummaryQueryType
} from '../backup-data.model'

@Injectable()
export class BackupSourceDataQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceNamesAction: GetResourceNamesAction

  private uuidDataLoader
  private vmInstanceUuidDataLoader
  private volumeBackupUuidDataLoader
  private nameDataLoader
  private vmNameDataLoader

  constructor() {
    this.uuidDataLoader = new DataLoader(this._getUuid)
    this.volumeBackupUuidDataLoader = new DataLoader(this._getVolumeBackupUuids)
    this.nameDataLoader = new DataLoader(this._getNameByVolume)
    this.vmNameDataLoader = new DataLoader(this._getNameByVm)
    this.vmInstanceUuidDataLoader = new DataLoader(this._getVmInstanceUuid)
  }

  async queryList(params: QueryBackupResourceArgs) {
    const { type = BackupResourceType.VmInstance } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case BackupResourceType.VmInstance:
        _extrazqlConditions =
          params.sortBy === 'count'
            ? {
                type: 'Root'
              }
            : undefined
        break
      case BackupResourceType.Volume:
        _extrazqlConditions = {
          type: 'Data'
        }
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions,
      _extrazqlConditions,
      type,
      params?.sortBy
    )

    _resultResp = await this.getBackupSourceDataList(params, zqlCondition)

    return _resultResp
  }

  async getBackupDataSize(params: VolumeBackupDataSummaryArgs) {
    const {
      type = VolumeBackupDataSummaryQueryType.VmInstance,
      conditions = [],
      resourceUuid
    } = params
    const resourceKey =
      type === VolumeBackupDataSummaryQueryType.Volume ? 'volumeUuid' : 'vmInstanceUuid'

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'zoneUuid',
      'backupType',
      '_VolumeBackupStorageRefReadyStatus_',
      'isRemoteSynced',
      'isLocalSynced'
    ])

    let full = 0
    let incremental = 0
    let incrementalDependency = 0

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

    // 默认计算本地
    if (systemTags.length <= 0) {
      systemTags.push('onlybackup')
      systemTags.push('allowbackup')
    }

    // 全量
    const fullZqlObject = {
      action: ZQLAction.SUM,
      tableName: 'VolumeBackup',
      condition: QueryConditionTranslator.translate(_conditions, {
        mode: 'full',
        [ZOp.and]: [
          {
            status: {
              [ZOp.ne]: 'Deleted'
            }
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
        ],
        [resourceKey]: resourceUuid
      }),
      fields: ['size'],
      sumBy: resourceKey
    }

    // 增量
    const incrementalZqlObject = {
      action: ZQLAction.SUM,
      tableName: 'VolumeBackup',
      condition: QueryConditionTranslator.translate(_conditions, {
        mode: {
          [ZOp.ne]: 'full'
        },
        [ZOp.and]: [
          {
            status: {
              [ZOp.ne]: 'Deleted'
            }
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
        ],
        [resourceKey]: resourceUuid
      }),
      fields: ['size'],
      sumBy: resourceKey
    }

    // 增量依赖
    const deletedZqlObject = {
      action: ZQLAction.SUM,
      tableName: 'VolumeBackup',
      condition: QueryConditionTranslator.translate(conditions, {
        [resourceKey]: resourceUuid,
        [ZOp.or]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'VolumeBackupStorageRef',
                  fields: ['volumeBackupUuid'],
                  condition: {
                    status: {
                      [ZOp.eq]: 'Deleted' // 状态为删除的，认为数据不存在了。
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
        ]
      }),
      fields: ['size'],
      sumBy: resourceKey
    }

    const zql = ZQL.multStringify([fullZqlObject, incrementalZqlObject, deletedZqlObject])

    const { results } = await this.zqlService.call(zql)
    full = _.last(_.get(results, ['0', 'inventories', '0'], 0))
    incremental = _.last(_.get(results, ['1', 'inventories', '0'], 0))
    incrementalDependency = _.last(_.get(results, ['2', 'inventories', '0'], 0))

    return {
      resourceUuid,
      full,
      incremental,
      incrementalDependency
    }
  }

  async getBackupSourceDataList(
    param: QueryBackupResourceArgs,
    zqlCondition: ZqlObject['condition']
  ) {
    // 根据 volumeUuid 去重, groupBy 有默认值, 结果是根据volumeUuid去重后获取的，所以对应备份uuid需要单独获取，由于之前是错误写法，这里的uuid也默认取第一个——等待有缘人
    // sortBy 只允许传入 size 和 count
    const sortBy = param?.sortBy
    const groupKey = param?.type === BackupResourceType.VmInstance ? 'vmInstanceUuid' : 'volumeUuid'
    let zqlObject: any = {
      tableName: 'VolumeBackup',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      groupBy: 'volumeUuid',
      returnWith: {
        total: true
      }
    }

    if (sortBy === 'size') {
      zqlObject = {
        action: ZQLAction.SUM,
        tableName: 'VolumeBackup',
        condition: zqlCondition,
        fields: ['size'],
        sumBy: groupKey,
        orderBy: 'size',
        orderDirection: param.sortDirection,
        limit: param.limit,
        offset: param.start
      }
    }

    if (sortBy === 'count') {
      zqlObject = {
        action: ZQLAction.COUNT,
        tableName: 'VolumeBackup',
        condition: zqlCondition,
        groupBy: groupKey,
        orderBy: 'groupCount',
        orderDirection: param.sortDirection,
        limit: param.limit,
        offset: param.start
      }
    }

    const zql = ZQL.multStringify([
      zqlObject
      // {
      //   action: ZQLAction.COUNT,
      //   tableName: 'VolumeBackup',
      //   condition: zqlCondition,
      //   fnName: ZQLFn.distinct,
      //   fields: ['volumeUuid']
      // }
    ])

    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = results?.[0]?.inventoryCounts || []
    const inventories = results?.[0]?.inventories || []
    // const total = results?.[1]?.total ?? 0

    const list = []

    if (sortBy === 'count') {
      /*
        volumeInfo: {
                      "volumeUuid": "8f25f37f3ca0484bbf60727a35596ec0"
                    }
      */
      _.forEach(inventoryCounts || [], inventorys => {
        const [volumeInfo, count] = inventorys
        if (
          volumeInfo?.hasOwnProperty('volumeUuid') ||
          volumeInfo?.hasOwnProperty('vmInstanceUuid')
        ) {
          list.push({
            uuid: volumeInfo[groupKey],
            count
          })
        }
      })
    }

    if (sortBy === 'size') {
      _.forEach(inventories || [], inventory => {
        const [uuid, size] = inventory
        list.push({ uuid, size })
      })
    }

    return {
      list
      // total: total
    }
  }

  buildZqlCondition(
    conditions: ICondition[],
    extrazqlConditions: ZqlObject['condition'],
    type,
    sortBy
  ) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'resourceName', // 不能使用name当关键key，因为VolumeBackup本身是有name的。
      '_VolumeBackupStorageRefReadyStatus_',
      'zoneUuid'
    ])

    const specicalCondition = []

    // 根据BS筛选状态为Ready的备份数据, size 求和不用
    if (_extraConditionMap['_VolumeBackupStorageRefReadyStatus_'] && sortBy !== 'size') {
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

    if (type === BackupResourceType.VmInstance && sortBy == 'size') {
      specicalCondition.push({
        vmInstanceUuid: {
          [ZOp.not]: null
        }
      })
    }

    // 根据资源名称resourceName搜索，曾经的资源可能不存在了，或者更改了名称，所以这里加上了metadata
    if (_extraConditionMap['resourceName']) {
      const resourceName: string = _extraConditionMap['resourceName']?.value
      if (type === BackupResourceType.VmInstance) {
        const vmZqlCondition = {
          [ZOp.or]: [
            {
              volumeUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'VmInstance',
                    fields: ['rootVolumeUuid'],
                    condition: {
                      name: {
                        [ZOp.like]: resourceName
                      }
                    }
                  }
                }
              }
            },
            {
              metadata: {
                [ZOp.like]: `vmName":"%${resourceName}%","vmDescription"%"vmInstanceUuid%vmSystemTags` //  有点取巧。
              }
            }
          ]
        }
        specicalCondition.push(vmZqlCondition)
      }

      if (type === BackupResourceType.Volume) {
        const volumeZqlCondition = {
          [ZOp.or]: [
            {
              volumeUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'Volume',
                    fields: ['uuid'],
                    condition: {
                      name: {
                        [ZOp.like]: resourceName
                      }
                    }
                  }
                }
              }
            },
            {
              metadata: {
                [ZOp.like]: `name":"%${resourceName}%","vmName` //  有点取巧。
              }
            }
          ]
        }
        specicalCondition.push(volumeZqlCondition)
      }
    }

    // 根据zoneUuid搜索过滤
    if (_extraConditionMap['zoneUuid']) {
      const zoneUuid: string = _extraConditionMap['zoneUuid']?.value

      // 可能还在创建中，创建中的备份数据是查询不到BS的。(通用查询，不应该考虑status是否为Ready)
      const zoneZqlCondition = {
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
      specicalCondition.push(zoneZqlCondition)
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getUuid(volumeUuid) {
    return this.uuidDataLoader.load(volumeUuid)
  }

  _getUuid = async (volumeUuids: string[]) => {
    const _volumeUuids = _.chunk(_.uniq(volumeUuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_volumeUuids, async _uuids => {
        const zql = ZQL.stringify({
          tableName: 'VolumeBackup',
          fields: ['volumeUuid', 'uuid'],
          condition: {
            volumeUuid: {
              [ZOp.in]: _uuids
            }
          }
        })

        const { results } = await this.zqlService.call(zql)
        const inventories = results?.[0]?.inventories
        resultList = resultList.concat(inventories)
      })
    )

    // 相当于取了数组中最后一个UUID
    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        obj[item.volumeUuid] = _.get(item, 'uuid', null)
        return obj
      },
      {}
    )

    return volumeUuids.map(uuid => _.get(resultMap, uuid, null))
  }

  getVmInstanceUuid(uuid) {
    return this.vmInstanceUuidDataLoader.load(uuid)
  }

  _getVmInstanceUuid = async (volumeBackupUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'VolumeBackup',
      fields: ['vmInstanceUuid', 'uuid'],
      condition: {
        uuid: {
          [ZOp.in]: _.uniq(volumeBackupUuids)
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []

    const resultMap = _.reduce(
      inventories,
      (obj, item) => {
        obj[item.uuid] = item.vmInstanceUuid

        return obj
      },
      {}
    )

    return volumeBackupUuids.map(uuid => _.get(resultMap, uuid, null))
  }

  getVolumeBackupUuids(volumeUuid) {
    return this.volumeBackupUuidDataLoader.load(volumeUuid)
  }

  _getVolumeBackupUuids = async (volumeUuids: string[]) => {
    const _volumeUuids = _.chunk(_.uniq(volumeUuids), 50)

    let resultList = []

    await Promise.all(
      _.map(_volumeUuids, async _uuids => {
        const zql = ZQL.stringify({
          tableName: 'VolumeBackup',
          fields: ['volumeUuid', 'uuid'],
          condition: {
            volumeUuid: {
              [ZOp.in]: _uuids
            }
          }
        })

        const { results } = await this.zqlService.call(zql)
        const inventories = results?.[0]?.inventories
        resultList = resultList.concat(inventories)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        if (!obj[item.volumeUuid]) {
          obj[item.volumeUuid] = [_.get(item, 'uuid')]
        } else {
          obj[item.volumeUuid].push(_.get(item, 'uuid'))
        }
        return obj
      },
      {}
    )

    return volumeUuids.map(uuid => _.get(resultMap, uuid, []))
  }

  getNameByVolume(volumeUuid) {
    return this.nameDataLoader.load(volumeUuid)
  }

  _getNameByVolume = async (volumeUuids: string[]) => {
    const _volumeUuids = _.chunk(_.uniq(volumeUuids), 50)

    let resultList = []
    const resourceNameResultMap = {}
    const volumeResourceMap = {}
    // 用来收集还在进行中的备份任务对应的资源，volume没有该问题，rootvolume会有问题。metadata为空。
    const rootVolumeUuidList = []

    await Promise.all(
      _.map(_volumeUuids, async _uuids => {
        const zql = ZQL.stringify({
          tableName: 'VolumeBackup',
          fields: ['volumeUuid', 'metadata', 'type', 'name'],
          condition: {
            volumeUuid: {
              [ZOp.in]: _uuids
            }
          }
        })

        const { results } = await this.zqlService.call(zql)
        const inventories = results?.[0]?.inventories
        resultList = resultList.concat(inventories)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        const { metadata, type } = item
        let _metadata
        try {
          _metadata = JSON.parse(metadata)
        } catch (error) {
          console.log(error)
        }

        if (_metadata) {
          // _metadata undefined 会冲掉前面的值。
          obj[item.volumeUuid] = type === 'Root' ? _metadata?.vmName : _metadata?.name
        } else if (type === 'Root' && !_metadata) {
          rootVolumeUuidList.push(item.volumeUuid)
        }

        volumeResourceMap[item.volumeUuid] =
          type === 'Root'
            ? _metadata?.vmInstanceUuid || _metadata?.attachedVmUuid || item.volumeUuid
            : item.volumeUuid

        return obj
      },
      {}
    )

    const resourceUuids = _.chunk(_.uniq(_.values(volumeResourceMap)), 50)

    await Promise.all(
      _.map(resourceUuids, async resourceUuidList => {
        const { inventories } = await this.getResourceNamesAction.call({
          uuids: resourceUuidList
        })

        _.forEach(inventories || [], item => {
          _.set(resourceNameResultMap, item.uuid, item?.resourceName)
        })
      })
    )

    // 优先获取GetResourceNamesAction里面的数据，最后获取metadata 里面的数据。如果什么名称都找不到，则随机用一个备份任务的名称代替。
    return volumeUuids.map(uuid =>
      _.get(resourceNameResultMap, _.get(volumeResourceMap, uuid), _.get(resultMap, uuid, null))
    )
  }

  getNameByVm(vmInstanceUuid) {
    return this.vmNameDataLoader.load(vmInstanceUuid)
  }

  _getNameByVm = async (vmInstanceUuids: string[]) => {
    const _vmInstanceUuids = _.chunk(_.uniq(vmInstanceUuids), 50)

    let resultList = []
    const resourceNameResultMap = {}

    await Promise.all(
      _.map(_vmInstanceUuids, async _uuids => {
        const zql = ZQL.stringify({
          tableName: 'VolumeBackup',
          fields: ['vmInstanceUuid', 'metadata', 'type', 'name'],
          condition: {
            vmInstanceUuid: {
              [ZOp.in]: _uuids
            }
          }
        })

        const { results } = await this.zqlService.call(zql)
        const inventories = results?.[0]?.inventories
        resultList = resultList.concat(inventories)
      })
    )

    const resultMap = _.reduce(
      resultList,
      (obj, item) => {
        const { metadata } = item
        let _metadata
        try {
          _metadata = JSON.parse(metadata)

          if (_metadata) {
            // _metadata undefined 会冲掉前面的值。
            obj[item.vmInstanceUuid] = _metadata?.vmName || _metadata?.name
          }
        } catch (error) {
          console.log(error)
        }

        return obj
      },
      {}
    )

    const resourceUuids = _.chunk(_.uniq(_vmInstanceUuids), 50)

    await Promise.all(
      _.map(resourceUuids, async resourceUuidList => {
        const { inventories } = await this.getResourceNamesAction.call({
          uuids: resourceUuidList
        })

        _.forEach(inventories || [], item => {
          _.set(resourceNameResultMap, item.uuid, item?.resourceName)
        })
      })
    )

    // 优先获取GetResourceNamesAction里面的数据，最后获取metadata 里面的数据。如果什么名称都找不到，则随机用一个备份任务的名称代替。
    return vmInstanceUuids.map(uuid =>
      _.get(resourceNameResultMap, uuid, _.get(resultMap, uuid, null))
    )
  }
}
