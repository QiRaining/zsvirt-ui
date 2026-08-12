import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { QueryParam as IQueryParam } from '@/api/zstack/base/query-base'
import {
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { SyncDatabaseBackupAction } from '@/api/zstack/SyncDatabaseBackupAction'
import { SyncVmBackupAction } from '@/api/zstack/SyncVmBackupAction'
import { SyncVolumeBackupAction } from '@/api/zstack/SyncVolumeBackupAction'
import ZQL, { ZOp, ZQLAction, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { ZSVBackupStorageQueryResp, QueryZSVBackupStorageArgs } from '../zsv-backup-storage.model'

export const databaseResourceUuid = '7ae6456c0b01324dae6d4bef358a5772'
@Injectable()
export class QueryZSVBackupStorageService {
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() dataBaseAction: SyncDatabaseBackupAction
  @Inject() VMAction: SyncVmBackupAction
  @Inject() VolumeAction: SyncVolumeBackupAction
  @Inject() ZQLService: ZQLService

  private getBackupStorageTypeDataLoader
  private getBackupStorageAttachedZoneUuidsDataLoader

  constructor() {
    this.getBackupStorageTypeDataLoader = new DataLoader(this._getBackupStorageType)
    this.getBackupStorageAttachedZoneUuidsDataLoader = new DataLoader(
      this._getBackupStorageAttachedZoneUuids
    )
  }

  async query(params: QueryZSVBackupStorageArgs): Promise<ZSVBackupStorageQueryResp> {
    const zqlCondition = this.buildZqlCondition(params.conditions, [])

    const zqlObject = {
      tableName: 'BackupStorage',
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
    const { results } = await this.ZQLService.call(zql)
    const inventories = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0
    return {
      list: inventories,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [])

    const specicalCondition = []

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async querySystemTags(params: IQueryParam) {
    const { inventories: list, total } = await this.querySystemTagAction.call(params)
    return { list, total }
  }

  async getCdpTaskCount(backupStorageUuid: string) {
    const zqlObject: ZqlObject = {
      tableName: 'CdpTask',
      action: ZQLAction.COUNT,
      condition: {
        backupStorageUuid
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results: [{ total = 0 }] = [{}] } = (await this.ZQLService.call(zql)) ?? {}

    return total
  }

  async getUniqBackupJobCount(backupStorageUuids: string[]) {
    const zqlObjectGroup: ZqlObject = {
      tableName: 'SchedulerJobGroup',
      action: ZQLAction.COUNT,
      condition: {
        [ZOp.or]: _.map(backupStorageUuids, backupStorageUuid => ({
          jobData: {
            [ZOp.like]: backupStorageUuid
          }
        }))
      }
    }

    // 最多一个，不然逻辑有问题，因为targetResourceUuid已经指定。
    const zqlObjectJob: ZqlObject = {
      tableName: 'SchedulerJob',
      action: ZQLAction.COUNT,
      condition: {
        [ZOp.or]: _.map(backupStorageUuids, backupStorageUuid => ({
          jobData: {
            [ZOp.like]: backupStorageUuid
          }
        })),
        targetResourceUuid: databaseResourceUuid
      }
    }

    const zql = ZQL.multStringify([zqlObjectGroup, zqlObjectJob])
    const result = (await this.ZQLService.call(zql)) ?? {}
    const groupTotal = result?.results?.[0]?.total ?? 0
    const jobTotal = result?.results?.[1]?.total ?? 0

    return groupTotal + jobTotal
  }

  async getBackupJobCount(backupStorageUuid: string) {
    try {
      const zqlObjectGroup: ZqlObject = {
        tableName: 'SchedulerJobGroup',
        action: ZQLAction.COUNT,
        condition: {
          jobData: {
            [ZOp.like]: backupStorageUuid
          }
        }
      }

      const zqlObjectJob: ZqlObject = {
        tableName: 'SchedulerJob',
        action: ZQLAction.COUNT,
        condition: {
          jobData: {
            [ZOp.like]: backupStorageUuid
          },
          targetResourceUuid: databaseResourceUuid
        }
      }

      const zql = ZQL.multStringify([zqlObjectGroup, zqlObjectJob])
      const result = (await this.ZQLService.call(zql)) ?? {}
      const groupTotal = result?.results?.[0]?.total ?? 0
      const jobTotal = result?.results?.[1]?.total ?? 0

      return groupTotal + jobTotal
    } catch {
      return 0
    }
  }

  async scanZSVBackupStorage(imageStoreUuid: string, zoneUuid: string) {
    const scanBackupResult = []
    scanBackupResult.push(this.dataBaseAction.call({ imageStoreUuid }))
    scanBackupResult.push(this.VolumeAction.call({ imageStoreUuid }))
    scanBackupResult.push(this.VMAction.call({ imageStoreUuid }))
    await Promise.all(scanBackupResult)

    const zql = ZQL.multStringify([
      {
        action: ZQLAction.COUNT,
        tableName: 'volumebackup',
        condition: {
          [ZOp.and]: {
            status: 'Ready',
            type: 'Root',
            'backupStorage.zone.uuid': zoneUuid,
            'backupStorage.uuid': imageStoreUuid,
            'backupStorage.__systemTag__': {
              [ZOp.in]: ['onlybackup', 'allowbackup']
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'volumebackup',
        condition: {
          [ZOp.and]: {
            status: 'Ready',
            type: 'Data',
            'backupStorage.zone.uuid': zoneUuid,
            'backupStorage.uuid': imageStoreUuid,
            'backupStorage.__systemTag__': {
              [ZOp.in]: ['onlybackup', 'allowbackup']
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'databasebackup',
        condition: {
          [ZOp.and]: {
            status: 'Ready',
            'backupStorage.uuid': imageStoreUuid,
            'backupStorage.__systemTag__': {
              [ZOp.in]: ['onlybackup', 'allowbackup']
            }
          }
        }
      }
    ])
    const {
      results: [
        { total: vmTotal = 0 },
        { total: volumeTotal = 0 },
        { total: dataBaseTotal = 0 }
      ] = [{}, {}, {}]
    } = (await this.ZQLService.call(zql)) ?? {}

    return {
      vmTotal,
      volumeTotal,
      dataBaseTotal
    }
  }

  async getBackupStorageType(uuid: string) {
    return this.getBackupStorageTypeDataLoader.load(uuid)
  }

  _getBackupStorageType = async (uuids: string[]) => {
    const genZql = (uuid: string) => {
      return {
        tableName: 'SystemTag',
        fields: ['resourceUuid', 'tag'],
        condition: {
          resourceUuid: uuid,
          tag: {
            [ZOp.in]: ['remotebackup', 'onlybackup', 'allowbackup']
          }
        },
        namedAs: uuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(it => genZql(it)))
    const { results = [] } = await this.ZQLService.call(zql)

    const tagMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0', 'tag'], '')
        return obj
      },
      {}
    )

    return uuids.map(uuid => tagMap[uuid] ?? {})
  }

  // 获取备份存储关联的zoneuuid列表, backupStorageVO也存在attachedZoneUuids这个字段，但是并没有根据时间排序，所以单独写一个dataloader
  async getBackupStorageAttachedZoneUuids(uuid: string) {
    return this.getBackupStorageAttachedZoneUuidsDataLoader.load(uuid)
  }

  _getBackupStorageAttachedZoneUuids = async (uuids: string[]) => {
    const genZql = backupStorageUuid => {
      return {
        tableName: 'BackupStorageZoneRef',
        fields: ['zoneUuid'],
        condition: {
          backupStorageUuid: {
            [ZOp.eq]: backupStorageUuid
          }
        },
        orderBy: 'createDate',
        orderDirection: 'asc' as const,
        namedAs: backupStorageUuid
      }
    }
    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.ZQLService.call(zql)

    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'inventories')
        return obj
      },
      {}
    )

    return uuids.map(backupStorageUuid => {
      const zoneUuids = _.map(_.get(map, [backupStorageUuid], []) as [], 'zoneUuid')

      if (zoneUuids?.length) {
        return zoneUuids
      } else {
        return []
      }
    })
  }

  async haveRemoteBackupStorage() {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'BackupStorage',
      condition: {
        type: 'ImageStoreBackupStorage',
        // attachedZoneUuids: {
        //   [ZOp.not]: []
        // },
        __systemTag__: {
          [ZOp.in]: ['remotebackup']
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.ZQLService.call(zql)

    return results?.[0]?.total > 0
  }
}
