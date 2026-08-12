import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { QueryParam as IQueryParam, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { SyncDatabaseBackupAction } from '@/api/zstack/SyncDatabaseBackupAction'
import { SyncVmBackupAction } from '@/api/zstack/SyncVmBackupAction'
import { SyncVolumeBackupAction } from '@/api/zstack/SyncVolumeBackupAction'
import ZQL, { ZOp, ZQLAction, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  LocalBackupStorageQueryResp,
  QueryLocalBackupStorageArgs,
  LocalBackupStorageQueryType
} from '../local-backup-storage.model'

export const databaseResourceUuid = '7ae6456c0b01324dae6d4bef358a5772'
@Injectable()
export class QueryLocalBackupStorageService {
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() querySystemTagAction: QuerySystemTagAction

  @Inject() dataBaseAction: SyncDatabaseBackupAction

  @Inject() VMAction: SyncVmBackupAction
  @Inject() VolumeAction: SyncVolumeBackupAction

  @Inject() zQLService: ZQLService

  async query(params: QueryLocalBackupStorageArgs): Promise<LocalBackupStorageQueryResp> {
    const { type = LocalBackupStorageQueryType.Normal } = params

    let _extraConditions: unknown
    switch (type) {
      case LocalBackupStorageQueryType.QueryForCdpTaskResource:
        _extraConditions = this.buildConditionForCdpTaskResource(params.extraConditions)
    }

    const zqlCondition = QueryConditionTranslator.translate(params.conditions, _extraConditions)

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
    const { results } = await this.zQLService.call(zql)
    const inventories = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0
    return {
      list: inventories,
      total: total
    }
  }

  buildConditionForCdpTaskResource(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const resourceUuid = conditionsMap['resourceUuid']

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'CdpTask',
            fields: ['backupStorageUuid'],
            condition: {
              ['resourceRefs.resourceUuid']: resourceUuid
            }
          }
        }
      }
    }
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
    const { results: [{ total = 0 }] = [{}] } = (await this.zQLService.call(zql)) ?? {}

    return total
  }

  async getUniqBackupJobCount(backupStorageUuids: string[]) {
    try {
      const zqlObject: ZqlObject = {
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

      const zql = ZQL.stringify(zqlObject)
      const result = (await this.zQLService.call(zql)) ?? {}
      return result?.results?.[0]?.total ?? 0
    } catch {
      return 0
    }
  }

  async getBackupJobCount(backupStorageUuid: string) {
    try {
      const zqlObject: ZqlObject = {
        tableName: 'SchedulerJobGroup',
        action: ZQLAction.COUNT,
        condition: {
          jobData: {
            [ZOp.like]: backupStorageUuid
          }
        }
      }

      const zql = ZQL.stringify(zqlObject)
      const result = (await this.zQLService.call(zql)) ?? {}
      return result?.results?.[0]?.total ?? 0
    } catch {
      return 0
    }
  }

  async scanlocalBackupStorage(imageStoreUuid: string, zoneUuid: string) {
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
    } = (await this.zQLService.call(zql)) ?? {}

    return {
      vmTotal,
      volumeTotal,
      dataBaseTotal
    }
  }
}
