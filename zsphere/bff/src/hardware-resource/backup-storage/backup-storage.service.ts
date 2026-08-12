import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { map as _map, pick as _pick, uniq as _uniq } from 'lodash'
import * as _ from 'lodash'

import {
  AttachBackupStorageToZoneAction,
  AttachBackupStorageToZoneActionParam as IAttachBackupStorageToZoneActionParam
} from '@/api/zstack/AttachBackupStorageToZoneAction'
import {
  Op,
  conditionsToObject,
  Condition,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetBackupStorageForCreatingImageFromVolumeAction } from '@/api/zstack/GetBackupStorageForCreatingImageFromVolumeAction'
import {
  GetBackupStorageTypesAction,
  GetBackupStorageTypesActionParam as IGetBackupStorageTypesActionParam
} from '@/api/zstack/GetBackupStorageTypesAction'
import {
  GetMetricDataAction,
  GetMetricDataActionParam as IGetMetricDataActionParam
} from '@/api/zstack/GetMetricDataAction'
import {
  GetPhysicalMachineBlockDevicesAction,
  GetPhysicalMachineBlockDevicesActionParam
} from '@/api/zstack/GetPhysicalMachineBlockDevicesAction'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryZoneAction } from '@/api/zstack/QueryZoneAction'
import { ActionService } from '@/base/action-service'
import { BackupStorageStatus } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { convertSizeToBytes } from '@/utils'

import {
  BackupStorageQueryType,
  BackupStorage,
  CheckHostnameRepeatParam,
  FreeHardDiskInfoList
} from './backup-storage.model'

@Injectable()
export class BackupStorageService extends ActionService {
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() getBackupStorageTypesAction: GetBackupStorageTypesAction
  @Inject() attachBackupStorageToZoneAction: AttachBackupStorageToZoneAction
  @Inject()
  getBackupStorageForCreatingImageFromVolumeAction: GetBackupStorageForCreatingImageFromVolumeAction
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject()
  getPhysicalMachineBlockDevicesAction: GetPhysicalMachineBlockDevicesAction
  @Inject() queryZoneAction: QueryZoneAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() zqlService: ZQLService

  private zoneDataloader
  private dataNetworkDataloader
  private syncImageNetworkDataloader
  private systemTagDataLoader
  private bsReservedCapacityDataLoader

  constructor() {
    super()
    this.zoneDataloader = new DataLoader(this._getZone)
    this.dataNetworkDataloader = new DataLoader(this._getDataNetwork)
    this.syncImageNetworkDataloader = new DataLoader(this._getSyncImageNetwork)
    this.systemTagDataLoader = new DataLoader(this._getBackupStorageSystemTag)
    this.bsReservedCapacityDataLoader = new DataLoader(this._getReservedCapacity)
  }

  async getBackupStorageTypes(params: IGetBackupStorageTypesActionParam): Promise<string[]> {
    const resp = await this.getBackupStorageTypesAction.call(params)
    return resp.types
  }

  async attachToZone(params: IAttachBackupStorageToZoneActionParam) {
    const { inventory } = await this.attachBackupStorageToZoneAction.call(params)
    return inventory
  }

  // zql改写
  async getBackupStorageList(params: QueryAction, zqlCondition: ZqlObject['condition']) {
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
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0
    return {
      list: inventories,
      total: total
    }
  }

  async queryList(params: QueryAction) {
    const { type = BackupStorageQueryType.Normal } = params
    let _extraConditions
    let _resultResp = null

    switch (type) {
      case BackupStorageQueryType.CreateImageCandidate:
        _extraConditions = await this.getCreateImageCandidate(params.extraConditions)
        break
      case BackupStorageQueryType.MigrateImageCandidate:
        _extraConditions = await this.getMigrateImageCandidate(params.extraConditions)
        break

      case BackupStorageQueryType.NotAttachedZoneBackupStorageList:
        _extraConditions = await this.getnotAttachedZoneBackupStorageList()
        break
      case BackupStorageQueryType.Normal:
      default:
        break
    }

    const zqlCondition = await this.buildZqlCondition(params.conditions, _extraConditions)

    _resultResp = await this.getBackupStorageList(params, zqlCondition)

    return _resultResp
  }

  async getCreateImageCandidate(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const volumeUuid = conditionsMap['volumeUuid']

    const zqlCondition = {
      __systemTag__: {
        [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
      },
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            action: ZQLAction.GET_API,
            api: 'GetBackupStorageForCreatingImageFromVolume',
            output: 'inventories.uuid',
            condition: {
              volumeUuid
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getMigrateImageCandidate(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const srcBackupStorageUuid = conditionsMap['srcBackupStorageUuid']

    const zqlCondition = {
      __systemTag__: {
        [ZOp.notIn]: ['remote']
      },
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            action: ZQLAction.GET_API,
            api: 'GetBackupStorageCandidatesForImageMigration',
            output: 'inventories.uuid',
            condition: {
              srcBackupStorageUuid
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getnotAttachedZoneBackupStorageList() {
    return {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'backupstorageZoneRef',
            fields: 'backupStorageUuid'
          }
        }
      }
    }
  }

  async buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const zqlCondition = QueryConditionTranslator.translate(conditions, extrazqlConditions)

    return zqlCondition
  }

  getZone(uuid) {
    return this.zoneDataloader.load(uuid)
  }

  _getZone = async (uuids: string[]) => {
    const { inventories } = await this.queryZoneAction.call({})
    return uuids.map(uuid => {
      const zone = inventories.find(zone => zone.uuid === uuid)
      if (zone) {
        return zone
      } else {
        return null
      }
    })
  }

  getDataNetwork(uuid) {
    return this.dataNetworkDataloader.load(uuid)
  }

  _getDataNetwork = async (uuids: string[]) => {
    const { inventories } = await this.querySystemTagAction.call({
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.in,
          values: uuids
        },
        {
          key: 'tag',
          op: Op.like,
          value: 'backupStorage::data::network::cidr::'
        }
      ]
    })
    return uuids?.map(uuid => {
      const item = inventories?.find(item => item.resourceUuid === uuid)
      const dataNetwork = item?.tag?.split('backupStorage::data::network::cidr::')[1]
      if (dataNetwork) {
        return dataNetwork
      } else {
        return null
      }
    })
  }

  getSyncImageNetwork(uuid) {
    return this.syncImageNetworkDataloader.load(uuid)
  }

  _getSyncImageNetwork = async (uuids: string[]) => {
    const { inventories } = await this.querySystemTagAction.call({
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.in,
          values: uuids
        },
        {
          key: 'tag',
          op: Op.like,
          value: 'sync::network::cidr::'
        }
      ]
    })
    return uuids?.map(uuid => {
      const item = inventories?.find(item => item.resourceUuid === uuid)
      const syncImageNetwork = item?.tag?.split('sync::network::cidr::')[1]
      if (syncImageNetwork) {
        return syncImageNetwork
      } else {
        return null
      }
    })
  }

  getReservedCapacity(uuid) {
    return this.bsReservedCapacityDataLoader.load(uuid)
  }

  _getReservedCapacity = async (uuids: string[]) => {
    // 获取资源配置，最后全局配置。资源没有设置的话以全局配置为准。
    const configZql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        fields: 'value',
        condition: {
          name: 'reservedCapacity',
          category: 'backupStorage'
        }
      },
      {
        tableName: 'ResourceConfig',
        fields: ['value', 'resourceUuid'],
        condition: {
          resourceType: 'BackupStorageVO',
          resourceUuid: {
            [ZOp.in]: uuids
          },
          name: 'reservedCapacity',
          category: 'backupStorage'
        }
      }
    ])

    const configResp = await this.zqlService.call(configZql)

    // 全局配置默认值
    const reservedCapacity = convertSizeToBytes(
      _.get(configResp, ['results', '0', 'inventories', '0', 'value'], '1G')
    )

    // 收集资源配置的值
    const resourceConfigMap = _.reduce(
      _.get(configResp, ['results', '1', 'inventories'], []),
      (obj, rsConfig) => {
        obj[rsConfig.resourceUuid] = convertSizeToBytes(_.get(rsConfig, 'value'))

        return obj
      },
      {}
    )

    return uuids.map(psUuid => {
      const resourceConfig = _.get(resourceConfigMap, psUuid, null)
      if (resourceConfig) {
        return resourceConfig
      }

      return reservedCapacity
    })
  }

  getBackupStorageSystemTag(uuid) {
    return this.systemTagDataLoader.load(uuid)
  }

  _getBackupStorageSystemTag = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zql)
    return uuids.map(uuid => {
      const list = inventories?.filter(it => it?.resourceUuid === uuid)?.map(it => it?.tag)
      return list?.length ? list : null
    })
  }

  async getAll(params: QueryAction) {
    const { total, inventories } = await this.queryBackupStorageAction.call(params)
    return {
      total,
      list: inventories
    }
  }

  async getBackupStorageMetricDataList(
    uuid: string,
    namespace: string,
    metricName: string,
    period: number,
    offsetAheadOfCurrentTime: number,
    labels?: string[]
  ) {
    const param: IGetMetricDataActionParam = {
      namespace,
      metricName,
      period,
      offsetAheadOfCurrentTime,
      labels: labels ? [`BackupStorageUuid=${uuid}`, ...labels] : [`BackupStorageUuid=${uuid}`]
    }
    const { data } = await this.getMetricDataAction.call(param)
    return data
  }

  async getSummary(status, condtions = []) {
    switch (status) {
      case 'connected':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: BackupStorageStatus.Connected
        })
        break
      case 'connecting':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: BackupStorageStatus.Connecting
        })
        break
      case 'disconnected':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: BackupStorageStatus.Disconnected
        })
        break
      case 'other':
        condtions.push({
          key: 'status',
          op: Op.notIn,
          values: [BackupStorageStatus.Connected, BackupStorageStatus.Disconnected]
        })
        break
      case 'total':
        break
      default:
        break
    }

    const zqlObject = {
      tableName: 'backupStorage',
      condition: QueryConditionTranslator.translate(condtions),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results = [] } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }

  async checkHostnameRepeat(param: CheckHostnameRepeatParam) {
    const { zoneUuid = '', hostname = '' } = param
    const zql = {
      action: ZQLAction.COUNT,
      tableName: 'ImageStoreBackupStorage',
      condition: {
        'zone.uuid': zoneUuid,
        hostname: hostname
      }
    }
    const res = await this.zqlService.call(ZQL.stringify(zql))
    return {
      repeat: res?.results?.[0]?.total > 0
    }
  }

  async getFreeHardDiskInfoList(args: QueryAction): Promise<FreeHardDiskInfoList> {
    const { conditions = [], start = 0, limit } = args

    const extraConditions = []
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'name',
      'username',
      'password',
      'hostName',
      'sshPort'
    ])
    if (extraConditionMap.name?.value) {
      const name = extraConditionMap.name.value.toLocaleLowerCase()
      extraConditions.push(val => val.name.toLocaleLowerCase().includes(name))
    }

    const param: GetPhysicalMachineBlockDevicesActionParam = {
      username: extraConditionMap.username?.value,
      sshPort: extraConditionMap.sshPort?.value,
      hostName: extraConditionMap.hostName?.value,
      excludedTypes: ['rom']
    }

    if (extraConditionMap.password?.value) {
      param.password = extraConditionMap.password.value
    }

    const { blockDevices } = await this.getPhysicalMachineBlockDevicesAction.call(param)

    const { unusedBlockDevices = [] } = blockDevices || {}

    const inventories = unusedBlockDevices.map(device => {
      const {
        name,
        logicalSector,
        physicalSector,
        size,
        type,
        multipath,
        partitionTable = 'unknown',
        children = []
      } = device || {}

      const firstChild = children?.[0]

      return {
        name,
        logicalSector,
        physicalSector,
        size,
        type: multipath ? 'mpath' : type,
        partitionTable,
        withPartition: children.length > 0,
        multipathDeviceName: multipath ? (firstChild?.name ?? '-') : '-'
      }
    })

    const _inventories = inventories.filter(val => extraConditions.every(fn => fn(val)))

    const total = _inventories?.length || 0

    const list = _inventories.slice(start, limit ? start + limit : total).map(val => ({
      ...val
    }))
    return { list, total }
  }
}
