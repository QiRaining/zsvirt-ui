import * as fs from 'fs'

import { Inject, Injectable } from '@nestjs/common'
// import { SyncBackupFromImageStoreBackupStorageInput } from './backup-data.model'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { Condition as ICondition, conditionsToObject, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateVmBackupAction } from '@/api/zstack/CreateVmBackupAction'
import { CreateVmFromVmBackupAction } from '@/api/zstack/CreateVmFromVmBackupAction'
import { CreateVolumeBackupAction } from '@/api/zstack/CreateVolumeBackupAction'
import { ExportDatabaseBackupFromBackupStorageAction } from '@/api/zstack/ExportDatabaseBackupFromBackupStorageAction'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { GetTaskProgressAction } from '@/api/zstack/GetTaskProgressAction'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { SyncBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncBackupFromImageStoreBackupStorageAction'
import { SyncVmBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncVmBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'
import { VolumeDataloader } from '@/zsphere-resource/volume/volume.dataloader'

import {
  BackupDataCanSync,
  BackupDataIsLocalSynced,
  BackupDataIsRemoteSynced,
  BackupResourceFullBackupType,
  BackupResourceType,
  BackupResourceVmBackupType,
  QueryBackupResourceArgs,
  BackupTaskStatusData
} from './backup-data.model'
import { tempFilePath } from './port-web-socket'

function arrayToArrayMap<T extends {}>(arr: T[], key = 'uuid'): { [key: string]: T[] } {
  const res: { [key: string]: T[] } = {}
  arr.reduce((p, c) => {
    const _key = c[key]
    if (!p[_key]) {
      p[_key] = []
    }
    p[_key].push(c)
    return p
  }, res)
  return res
}
function mergeZqlObject(zqlObj1: Partial<ZqlObject>, zqlObj2: Partial<ZqlObject>): ZqlObject {
  const { fields = [], condition = {}, ...rest } = zqlObj1 ?? {}
  const { fields: _fields = [], condition: _condition = {}, ..._rest } = zqlObj2 ?? {}

  const obj = Object.keys({ ...rest, ..._rest }).reduce((p, key) => {
    p[key] = rest[key] || _rest[key]

    return p
  }, {})

  const fs = [...new Set([...fields, ..._fields])]

  const obj1 = Object.keys({ ...condition, ..._condition }).reduce((p, key) => {
    const c1 = condition[key]
    const c2 = _condition[key]
    if (c1 && c2) {
      if (key === ZOp[ZOp.and] || key === ZOp[ZOp.or]) {
        p[key] = [...c1, ...c2]
      } else {
        const and = condition[ZOp[ZOp.and]] || _condition[ZOp[ZOp.and]]
        if (and) {
          and.push({
            key: c1
          })
          and.push({
            key: c2
          })
        } else {
          p[ZOp[ZOp.and]] = [
            {
              key: c1
            },
            {
              key: c2
            }
          ]
        }
      }
    } else {
      p[key] = c1 || c2
    }

    return p
  }, {})

  return {
    ...obj,
    condition: obj1,
    fields: fs
  } as any
}

export function arrayToMap<T extends {}>(arr: T[], key = 'uuid'): { [key: string]: T } {
  const res: { [key: string]: T } = {}
  arr.reduce((p, c) => {
    const _key = c[key]
    p[_key] = c
    return p
  }, res)

  return res
}

@Injectable()
export class BackupDataService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() createVmBackupAction: CreateVmBackupAction
  @Inject() createVolumeBackupAction: CreateVolumeBackupAction
  @Inject() createVmFromVmBackupAction: CreateVmFromVmBackupAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() queryLongJobAction: QueryLongJobAction

  @Inject()
  syncBackupFromImageStoreBackupStorageAction: SyncBackupFromImageStoreBackupStorageAction
  @Inject()
  syncVmBackupFromImageStoreBackupStorageAction: SyncVmBackupFromImageStoreBackupStorageAction

  @Inject() getResourceNamesAction: GetResourceNamesAction
  @Inject()
  exportDatabaseBackupFromBackupStorageAction: ExportDatabaseBackupFromBackupStorageAction

  @Inject() getTaskProgressAction: GetTaskProgressAction
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() volumeDataloader: VolumeDataloader

  private backupData
  private backupDataResp
  private backupStorageResp
  private localBackupStorageResp
  private remoteBackupStorageResp

  private resourceNameDataloader
  private backupStorageNameDataloader
  private isAsyncDataloader
  private isLocalSyncedDataloader
  private canSyncDataloader
  private relateResourceDataloader
  private dataVolumeAllExistedDataloader
  private lostDataDataloader
  private dataVolumeBackupVmInstanceDataloader

  private asyncMap
  private isLocalSyncedMap
  private backupStorageNameMap
  private canSyncNameMap
  private relateResourceMap
  private lostDataMap
  constructor() {
    super()
    this.resourceNameDataloader = new DataLoader(this._getResourceName)
    this.backupStorageNameDataloader = new DataLoader(this.getBackupStorageName)

    this.isAsyncDataloader = new DataLoader(this._isAsync)
    this.isLocalSyncedDataloader = new DataLoader(this._isLocalSynced)
    this.dataVolumeBackupVmInstanceDataloader = new DataLoader(this._dataVolumeBackupVmInstance)
    this.lostDataDataloader = new DataLoader(this._lostData)
    this.canSyncDataloader = new DataLoader(this._canSync)
    this.relateResourceDataloader = new DataLoader(this._relateResource)
    this.dataVolumeAllExistedDataloader = new DataLoader(this._dataVolumeAllExisted)
    this.asyncMap = {}
    this.isLocalSyncedMap = {}
    this.lostDataMap = {}
    this.backupStorageNameMap = {}
    this.canSyncNameMap = {}
    this.relateResourceMap = {}
  }

  spliceFilterKeyCondition(
    queryAction: QueryAction,
    filterKey: string,
    getFilterCondition?: (conditon: any) => any
  ) {
    const { conditions } = queryAction

    const filterCondition = _.remove(
      conditions,
      ({ key }: { key: string }) => key === filterKey
    )?.[0]
    if (!filterCondition) {
      return null
    }
    return getFilterCondition?.(filterCondition)
  }

  _getResourceName = async uuids => {
    const { inventories } = await this.getResourceNamesAction.call({
      uuids
    })
    const map = arrayToMap(inventories)
    return uuids.map(uuid => map[uuid])
  }

  async canSync(uuid, type: BackupResourceType, zoneUuid) {
    this.canSyncNameMap[uuid] = {
      zoneUuid,
      tableName: type === BackupResourceType.Database ? 'databasebackup' : 'volumebackup'
    }
    const canSync = await this.canSyncDataloader.load(uuid)
    return canSync ? BackupDataCanSync.Yes : BackupDataCanSync.No
  }

  _canSync = async uuids => {
    return Promise.all(
      uuids.map(async uuid => {
        const { zoneUuid, tableName } = this.canSyncNameMap[uuid]

        const zqlIsAsyncObj: ZqlObject = {
          tableName,
          limit: 1,
          condition: {
            uuid,
            'backupStorageRefs.backupStorageUuid': {
              [Op.in]: {
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

        const zqlRemoteObj: ZqlObject = {
          tableName: 'backupstorage',
          limit: 1,
          condition: {
            type: 'ImageStoreBackupStorage',
            __systemTag__: {
              [ZOp.in]: ['aliyun', 'remotebackup']
            },
            attachedZoneUuids: {
              [ZOp.in]: [zoneUuid]
            }
          }
        }
        const {
          results: [{ inventories: dbList }, { inventories: remoteList }]
        } = await this.zqlService.call(ZQL.multStringify([zqlIsAsyncObj, zqlRemoteObj]))

        //  已经同步到远端
        if (dbList.length > 0) {
          return false
        }
        // 存在远端服务器
        if (remoteList.length > 0) {
          return true
        }
        return false
        // const remoteBackupStorage = arrayToMap(remoteList)
        // const remoteBackupStorageUuids = _.keys(remoteBackupStorage)

        // if (remoteBackupStorageUuids.length === 0) return false

        // const attachedZoneUuids = (remoteBackupStorage[
        //   remoteBackupStorageUuids[0]
        // ] as any).attachedZoneUuids

        // if (!_.includes(attachedZoneUuids, zoneUuid)) return false

        // return !isAsync
      })
    )
  }
  async lostData(vmUuid, groupUuid, dataVolumeUuids) {
    this.lostDataMap[vmUuid] = { groupUuid, dataVolumeUuids }
    return this.lostDataDataloader.load(vmUuid)
  }
  _lostData = async vmUuids => {
    return Promise.all(
      vmUuids.map(async uuid => {
        const { groupUuid, dataVolumeUuids } = this.lostDataMap[uuid]
        const zqlObjs: ZqlObject[] = [
          {
            tableName: 'vminstance',
            fields: ['uuid'],
            condition: {
              uuid,
              state: {
                [ZOp.ne]: 'Destroyed'
              }
            }
          }
        ]

        if (groupUuid) {
          zqlObjs.push({
            tableName: 'volume',
            fields: ['uuid'],
            condition: {
              uuid: {
                [ZOp.in]: dataVolumeUuids
              }
            }
          })
        }
        const {
          results: [{ inventories: vms = [] } = {}, { inventories: volumes = [] } = {}]
        } = await this.zqlService.call(ZQL.multStringify(zqlObjs))

        if (vms.length === 0) {
          return true
        }

        if (groupUuid && volumes.length !== dataVolumeUuids.length) {
          return true
        }

        return false
      })
    )
  }
  _dataVolumeAllExisted = async groupUuids => {
    return Promise.all(
      groupUuids.map(async groupUuid => {
        const zqlRemoteObj: ZqlObject = {
          tableName: 'volumebackup',
          condition: {
            groupUuid,
            type: 'Data'
          }
        }
        const {
          results: [{ inventories }]
        } = await this.zqlService.call(ZQL.stringify(zqlRemoteObj))

        return inventories.map(({ volumeUuid }) => volumeUuid)
      })
    )
  }

  async dataVolumeBackupVmInstance(volumeUuid) {
    return this.dataVolumeBackupVmInstanceDataloader.load(volumeUuid)
  }
  _dataVolumeBackupVmInstance = async volumeUuids => {
    return Promise.all(
      volumeUuids.map(async volumeUuid => {
        const zqlObj: ZqlObject = {
          tableName: 'vmInstance',
          condition: {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'volume',
                  fields: ['vmInstanceUuid'],
                  condition: {
                    uuid: volumeUuid
                  }
                }
              }
            }
          }
        }
        const {
          results: [{ inventories }]
        } = await this.zqlService.call(ZQL.stringify(zqlObj))

        return inventories?.[0]
      })
    )
  }

  async dataVolumeAllExisted(groupUuid) {
    return this.dataVolumeAllExistedDataloader.load(groupUuid)
  }
  async relateResource(uuid) {
    return this.relateResourceDataloader.load(uuid)
  }
  _relateResource = async uuids => {
    return Promise.all(
      uuids.map(async uuid => {
        const {
          vmNics,
          dataVolumeUuids,
          primaryStorageUuid,
          clusterUuid,
          vmInstanceUuid,
          instanceOfferingUuid,
          volumeUuid
        } = this.relateResourceMap[uuid]

        const l3networkUuids = vmNics.map(({ l3NetworkUuid }) => l3NetworkUuid) as string[]
        const tempDataVolumeUuids = [...(dataVolumeUuids || []), volumeUuid]
        const fields = ['name', 'uuid']
        const zqlObjs: ZqlObject[] = []

        if (l3networkUuids.length > 0) {
          zqlObjs.push({
            tableName: 'l3network',
            fields,
            condition: {
              uuid: {
                [ZOp.in]: l3networkUuids
              }
            },
            namedAs: 'l3NetworkList'
          })
        }

        if (instanceOfferingUuid) {
          zqlObjs.push({
            tableName: 'instanceoffering',
            fields: [...fields, 'state'],
            condition: {
              uuid: instanceOfferingUuid
            },
            namedAs: 'instanceOffering'
          })
        }
        if (vmInstanceUuid) {
          zqlObjs.push({
            tableName: 'vminstance',
            fields: [...fields, 'state'],
            condition: {
              uuid: vmInstanceUuid
            },
            namedAs: 'vmInstance'
          })
        }

        if (tempDataVolumeUuids && tempDataVolumeUuids.length > 0) {
          zqlObjs.push({
            tableName: 'volume',
            fields: [...fields, 'status'],
            condition: {
              uuid: {
                [ZOp.in]: tempDataVolumeUuids
              }
            },
            namedAs: 'volume'
          })
        }

        if (primaryStorageUuid) {
          zqlObjs.push({
            tableName: 'primarystorage',
            fields: [...fields, 'state'],
            condition: {
              uuid: primaryStorageUuid
            },
            namedAs: 'primaryStorage'
          })
        }
        if (clusterUuid) {
          zqlObjs.push({
            tableName: 'cluster',
            fields: [...fields, 'state'],
            condition: {
              uuid: clusterUuid
            },
            namedAs: 'cluster'
          })
        }

        const { results } = await this.zqlService.call(ZQL.multStringify(zqlObjs))

        return results.reduce((p, { name, inventories }: any) => {
          //对于删除的资源返回uuid
          if (name === 'volume') {
            if (inventories?.length === tempDataVolumeUuids?.length) {
              p[name] = inventories
            } else {
              const map = arrayToMap(inventories)
              p[name] = tempDataVolumeUuids.map(_uuid => {
                return map[_uuid] ?? { uuid: _uuid }
              })
            }
          } else if (name === 'l3NetworkList') {
            if (inventories?.length === l3networkUuids?.length) {
              p[name] = inventories
            } else {
              const map = arrayToMap(inventories)
              p[name] = l3networkUuids.map(_uuid => {
                return map[_uuid] ?? { uuid: _uuid }
              })
            }
          } else {
            p[name] = (inventories as any[])?.[0]

            if (!p[name] || p[name]?.length === 0) {
              // delete res
              const _uuid = `${name}Uuid`
              p[name] = { uuid: this.relateResourceMap[uuid][_uuid] }
            }
          }

          return p
        }, {})
      })
    )
  }

  async getThinProvisionByPrimaryStorage(primaryStorageUuid) {
    const { inventories } = await this.querySystemTagAction.call({
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.eq,
          value: primaryStorageUuid
        }
      ]
    })

    return inventories.some(tag => tag.tag.indexOf('ThinProvisioning') > -1)
  }

  async backupTaskStatus(isVm: boolean, rootVolumeUuids: string[], dataVolumeUuids: string[]) {
    const zqlObjects1 =
      dataVolumeUuids?.map(uuid => ({
        tableName: 'LongJob',
        condition: {
          targetResourceUuid: uuid,
          jobName: 'APICreateVolumeBackupMsg',
          state: {
            [ZOp.in]: ['Running', 'Canceling']
          }
        },
        orderBy: 'createDate',
        orderDirection: 'desc' as const,
        limit: 1
      })) ?? []

    const zqlObjects2 =
      rootVolumeUuids?.map(uuid => ({
        tableName: 'LongJob',
        condition: {
          targetResourceUuid: uuid,
          jobName: 'APICreateVmBackupMsg',
          state: {
            [ZOp.in]: ['Running', 'Canceling']
          }
        },
        orderBy: 'createDate',
        orderDirection: 'desc' as const,
        limit: 1
      })) ?? []

    let zqlObjects = [...zqlObjects1, ...zqlObjects2]

    if (isVm) {
      const zqlObjects3 =
        rootVolumeUuids?.map(uuid => ({
          tableName: 'LongJob',
          condition: {
            targetResourceUuid: uuid,
            jobName: 'APICreateVolumeBackupMsg',
            state: {
              [ZOp.in]: ['Running', 'Canceling']
            }
          },
          orderBy: 'createDate',
          orderDirection: 'desc' as const,
          limit: 1
        })) ?? []
      zqlObjects = [...zqlObjects, ...zqlObjects3]
    }

    if (!zqlObjects?.length) {
      return {
        isTaskRunning: false,
        progress: 0
      }
    }

    const zql = ZQL.multStringify(zqlObjects)

    const { results } = await this.zqlService.call(zql)

    const apiIds = results?.map(item => item?.inventories?.[0]?.apiId)?.filter(Boolean)

    const isTaskRunning = !!apiIds?.length

    if (!isTaskRunning) {
      return {
        isTaskRunning: false,
        progress: 0
      }
    }

    let backupTaskStatusData: BackupTaskStatusData[] = []
    if (isVm) {
      const targetResourceUuids = results
        ?.map(item => item?.inventories?.[0]?.targetResourceUuid)
        ?.filter(Boolean)

      const allVolumes: Volume[] = await Promise.all(
        targetResourceUuids?.map(uuid => this.volumeDataloader.query(uuid, uuid))
      )

      allVolumes.forEach(vol => {
        const vmUuid = vol.vmInstanceUuid
        const longJobUuid = results?.find(
          item => item?.inventories?.[0]?.targetResourceUuid === vol.uuid
        )?.inventories?.[0]?.uuid
        let addData: any = backupTaskStatusData.find(item => item.targetResourceUuid === vmUuid)
        if (addData) {
          addData.longJobUuids.push(longJobUuid)
        } else {
          addData = {
            targetResourceUuid: vmUuid
          }
          addData.longJobUuids = []
          addData.longJobUuids.push(longJobUuid)
          backupTaskStatusData.push(addData)
        }
      })
    } else {
      backupTaskStatusData = results?.map(item => ({
        targetResourceUuid: item?.inventories?.[0]?.targetResourceUuid,
        longJobUuids: [item?.inventories?.[0]?.uuid]
      }))
    }

    const allTaskProgress = await Promise.all(
      apiIds?.map(apiId =>
        this.getTaskProgressAction.call({
          apiId
        })
      )
    )

    const totalProgress = allTaskProgress?.reduce((pre: number, current: any) => {
      let content = 0
      if (!Number.isNaN(current?.inventories?.[0]?.content)) {
        content = Number(current?.inventories?.[0]?.content)
      }
      return pre + content
    }, 0) as number

    const progress = Number(((totalProgress * 1.0) / apiIds.length).toFixed(2))
    return {
      progress,
      isTaskRunning: true,
      backupTaskStatusData
    }
  }

  async getbackupDataRecoverLocalHostUuid(vmInstanceUuid, clusterUuid) {
    const zqlObj: ZqlObject = {
      tableName: 'host',
      condition: {
        clusterUuid: clusterUuid
      }
    }

    const {
      results: [{ inventories }]
    } = await this.zqlService.call(ZQL.stringify(zqlObj))
    const hostUuids = inventories.map(({ uuid }) => uuid)

    for (let i = 0; i < hostUuids.length; i++) {
      const zqlObjVm: ZqlObject = {
        tableName: 'vminstance',
        condition: {
          'rootVolume.localStorageHostRef.hostUuid': hostUuids[i]
        }
      }

      const {
        results: [{ inventories: vms }]
      } = await this.zqlService.call(ZQL.stringify(zqlObjVm))

      if (vms.find(({ uuid }) => uuid === vmInstanceUuid)) {
        return hostUuids[i]
      }
    }
    return null
  }

  getFullBackupFilterCondition(condition: any) {
    const { values } = condition

    const yes = values.find(
      value => value === BackupResourceFullBackupType[BackupResourceFullBackupType.Full]
    )
    const no = values.find(
      value => value === BackupResourceFullBackupType[BackupResourceFullBackupType.Incremental]
    )

    if (yes && no) {
      return null
    }
    const op = yes ? Op.eq : Op.ne

    return {
      mode: {
        [op]: 'full'
      }
    }
  }

  getVmBackupFilterCondition(condition: any) {
    const { values } = condition
    const regKey = 'dataVolumeUuids":['

    const yes = values.find(
      value => value === BackupResourceVmBackupType[BackupResourceVmBackupType.Include]
    )
    const no = values.find(
      value => value === BackupResourceVmBackupType[BackupResourceVmBackupType.NotInclude]
    )

    if (yes && no) {
      return null
    }

    const op = yes ? Op.like : Op.notLike

    return {
      metadata: {
        [op]: regKey
      }
    }
  }

  getIsRemoteSyncedFilterCondition(condition: any) {
    const { values } = condition
    const yes = values.find(
      value => value === BackupDataIsRemoteSynced[BackupDataIsRemoteSynced.Yes]
    )
    const no = values.find(value => value === BackupDataIsRemoteSynced[BackupDataIsRemoteSynced.No])

    if (yes && no) {
      return null
    }

    const op = yes ? Op.in : Op.notHas
    return {
      'backupStorageRefs.backupStorageUuid': {
        [op]: {
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

  getIsLocalSyncedFilterCondition(condition: any) {
    const { values } = condition
    const yes = values.find(value => value === BackupDataIsLocalSynced[BackupDataIsLocalSynced.Yes])
    const no = values.find(value => value === BackupDataIsLocalSynced[BackupDataIsLocalSynced.No])

    if (yes && no) {
      return null
    }

    const op = yes ? Op.in : Op.notHas
    return {
      'backupStorageRefs.backupStorageUuid': {
        [op]: {
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
    }
  }

  getMetaData(_metadata: string) {
    const metadata = JSON.parse(_metadata)

    const defaultL3NetworkUuid = metadata.defaultL3NetworkUuid
    const rootAndData = !!metadata.dataVolumeUuids
    const format = metadata.format
    const isShareable = metadata.isShareable
    const volumeBandWidth = (() => {
      const { systemTags } = metadata
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
      const { systemTags } = metadata
      return systemTags && systemTags.some(tag => _.includes(tag.tag, 'virtio-scsi'))
    })()
    const wwn = (() => {
      const { systemTags } = metadata
      if (!systemTags) {
        return ''
      }
      const WWN = _.find(systemTags, tag => _.includes(tag.tag, 'kvm::volume::'))
      return WWN.tag.split('::')[2]
    })()
    const platform = metadata.platform
    const cpuNum = metadata.cpuNum
    const memorySize = metadata.memorySize
    const actualSize = metadata.actualSize
    const size = metadata.size
    const vmSystemTags = metadata.vmSystemTags
    const attachedVmName = metadata.vmName
    const vmDescription = metadata.vmDescription
    const metadataName = metadata.name
    const metadataDescription = metadata.description
    const isIncludeDataVolume = !!metadata.dataVolumeUuids
      ? BackupResourceVmBackupType.Include
      : BackupResourceVmBackupType.NotInclude
    return {
      size,
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
      isIncludeDataVolume,
      attachedVmName
    }
  }

  async getBackupData(params: QueryBackupResourceArgs) {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const zoneUuid = conditionsMap['zoneUuid']

    const conditions = []
    let zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      returnWith: {
        total: true
      }
    }

    const fullBackupFilterCondition = this.spliceFilterKeyCondition(
      params,
      'backupType',
      this.getFullBackupFilterCondition
    )
    if (fullBackupFilterCondition) {
      conditions.push(fullBackupFilterCondition)
    }
    const vmBackupFilterCondition = this.spliceFilterKeyCondition(
      params,
      'isIncludeDataVolume',
      this.getVmBackupFilterCondition
    )
    if (vmBackupFilterCondition) {
      conditions.push(vmBackupFilterCondition)
    }

    const isRemoteSyncedCondition = this.spliceFilterKeyCondition(
      params,
      'isRemoteSynced',
      this.getIsRemoteSyncedFilterCondition
    )
    if (isRemoteSyncedCondition) {
      conditions.push(isRemoteSyncedCondition)
    }

    const isLocalSyncedFilterCondition = this.spliceFilterKeyCondition(
      params,
      'isLocalSynced',
      this.getIsLocalSyncedFilterCondition
    )
    if (isLocalSyncedFilterCondition) {
      conditions.push(isLocalSyncedFilterCondition)
    }

    if (conditions.length > 0) {
      zqlObj.condition = {
        [ZOp.and]: conditions
      }
    }

    zqlObj = QueryConditionTranslator.mergeQueryAction(params, zqlObj)
    if (zqlObj.orderBy === 'backupSize') {
      zqlObj.orderBy = 'size'
    }
    const zql = ZQL.stringify(zqlObj)
    const {
      results: [{ inventories, total }]
    } = await this.zqlService.call(zql)

    const list = await Promise.all(
      inventories.map(async l => {
        const {
          metadata,
          name,
          size: backupSize,
          mode,
          uuid,
          createDate,
          groupUuid,
          type,
          backupStorageRefs,
          volumeUuid,
          // actualSize,
          lastOpDate,
          state
        } = l
        //vmBackup  attachedVm
        //localBackupStorage   fullBackup sync  owner  createDate

        // const fullBackup = mode === 'full' ? 'full' : 'incremental'
        const backupType =
          mode === 'full'
            ? BackupResourceFullBackupType.Full
            : BackupResourceFullBackupType.Incremental

        const bsUuid = conditionsMap['backupStorage.uuid']

        this.backupStorageNameMap[uuid] = {
          tableName: 'volumebackup',
          zoneUuid,
          bsUuid
        }

        const { backupStorageName, backupStorageUuid } = await this.backupStorageName(uuid)
        // const isAsync = await this.getBackupAsync(uuid)
        // const localSync = await this.getBackupLocalSynced(uuid)

        // const canSync = await this.canSync(uuid, zoneUuid, isAsync)
        const _metadata = this.getMetaData(metadata)

        // this.relateResourceMap[uuid] = { ..._metadata, volumeUuid }
        //关联资源
        // const relateResource = await this.relateResource(uuid)
        // console.log('relateResource', relateResource)
        // const volumeBackupVmInstance = await this.dataVolumeBackupVmInstance(
        //   volumeUuid
        // )
        // console.log('dataVolumeBackupVmInstance', volumeBackupVmInstance)

        // const volumes = relateResource['volume'] as any[]

        // const volume = volumes.find(({ uuid }) => uuid === volumeUuid)

        // delete relateResource['volume']

        // const dataVolumeList = volumes.filter(({ uuid }) => uuid !== volumeUuid)

        // metadata 数据
        // const defaultL3NetworkUuid = _metadata.defaultL3NetworkUuid
        // const rootAndData = !!_metadata.dataVolumeUuids
        // const format = _metadata.format
        // const isShareable = _metadata.isShareable
        // const volumeBandWidth = (() => {
        //   const { systemTags } = _metadata
        //   if (!systemTags) return ''
        //   const volumeBandWidth = _.find(systemTags, tag =>
        //     _.includes(tag.tag, 'volumeTotalBandwidth')
        //   )
        //   if (!volumeBandWidth || _.includes(volumeBandWidth.tag, '-1'))
        //     return 'unlimited'
        //   const value = volumeBandWidth.tag.split('::')[1]
        //   return value
        // })()
        // const isVirtioSCSI = (() => {
        //   const { systemTags } = _metadata
        //   return (
        //     systemTags &&
        //     systemTags.some(tag => _.includes(tag.tag, 'virtio-scsi'))
        //   )
        // })()
        // const wwn = (() => {
        //   const { systemTags } = _metadata
        //   if (!systemTags) return ''
        //   const WWN = _.find(systemTags, tag =>
        //     _.includes(tag.tag, 'kvm::volume::')
        //   )
        //   return WWN.tag.split('::')[2]
        // })()
        // const platform = _metadata.platform
        // const cpuNum = _metadata.cpuNum
        // const memorySize = _metadata.memorySize
        // const actualSize = _metadata.actualSize
        // const size = _metadata.size
        // const vmSystemTags = _metadata.vmSystemTags
        // const vmName = _metadata.vmName
        // const vmDescription = _metadata.vmDescription
        // const metadataName = _metadata.name
        // const metadataDescription = _metadata.description

        // let dataVolumeAllExisted = !groupUuid
        // if (type === 'Root' && groupUuid) {
        //   const { dataVolumeUuids } = _metadata
        //   const volumeUuids = await this.dataVolumeAllExisted(groupUuid)

        //   dataVolumeAllExisted =
        //     _.isEqual(
        //       _.toString(dataVolumeUuids.sort()),
        //       _.toString(volumeUuids.sort())
        //     ) && volumeUuids.length > 0
        // }

        //lostData
        // let lostData = false
        // if (type === 'Root') {
        //   const { vmInstanceUuid, dataVolumeUuids } = _metadata
        //   this.lostDataMap[vmInstanceUuid] = { groupUuid, dataVolumeUuids }
        //   lostData = await this.lostData(vmInstanceUuid)
        // }

        // const commonObj = {
        //   uuid,
        //   name,
        //   backupSize,
        //   backupStorageName,
        //   fullBackup,
        //   createDate,
        //   groupUuid,
        //   type,
        //   backupStorageRefs,
        //   lastOpDate,
        //   state,
        //   metadata,
        //   volumeUuid,
        //   zoneUuid,
        //   ..._metadata
        // }

        // if (type === BackupResourceType.VmInstance) {
        //   const vmBackup = !!_metadata.dataVolumeUuids ? BackupResourceVmBackupType.Yes : BackupResourceVmBackupType.No
        //   return {
        //     ...commonObj,
        //     vmBackup
        //   }
        // }
        // const attachedVm = _metadata.vmName
        return {
          uuid,
          name,
          backupSize,
          backupStorageName,
          backupType,
          backupStorageUuid,
          createDate,
          groupUuid,
          type,
          backupStorageRefs,
          lastOpDate,
          state,
          metadata,
          volumeUuid,
          zoneUuid,
          ..._metadata
        }
      })
    )

    return {
      list,
      total
    }
  }

  // getBackupAsync = uuid => {
  //   this.asyncMap[uuid] = { tableName: 'volumebackup' }
  //   return this.isAsyncDataloader.load(uuid)
  // }

  // getDbAsync = (uuid, op: Op) => {
  //   this.asyncMap[uuid] = { tableName: 'databasebackup', op }
  //   return this.isAsyncDataloader.load(uuid)
  // }

  getBackupLocalSynced = uuid => {
    this.isLocalSyncedMap[uuid] = 'volumebackup'
    return this.isLocalSyncedDataloader.load(uuid)
  }

  getDbLocalSynced = uuid => {
    this.isLocalSyncedMap[uuid] = 'databasebackup'
    return this.isLocalSyncedDataloader.load(uuid)
  }

  async isLocalSynced(uuid, type: BackupResourceType) {
    this.isLocalSyncedMap[uuid] =
      type === BackupResourceType.Database ? 'databasebackup' : 'volumebackup'
    const isLocalSynced = await this.isLocalSyncedDataloader.load(uuid)

    return isLocalSynced ? BackupDataIsLocalSynced.Yes : BackupDataIsLocalSynced.No
  }
  /**
   * 备份数据的backupStorageRefs 是否在本地备份数据库中
   */
  _isLocalSynced = async uuids => {
    return Promise.all(
      uuids.map(async uuid => {
        const tableName = this.isLocalSyncedMap[uuid]
        const zqlObj: ZqlObject = {
          tableName,
          limit: 1,
          condition: {
            uuid,
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
          }
        }
        const {
          results: [{ inventories: bkList }]
        } = await this.zqlService.call(ZQL.stringify(zqlObj))

        return bkList.length > 0

        // const zqlLocalObj: ZqlObject = {
        //   tableName: 'backupstorage',
        //   condition: {
        //     type: 'ImageStoreBackupStorage',
        //     __systemTag__: {
        //       [ZOp.in]: ['aliyun', 'remotebackup']
        //     },
        //     uuid:{
        //       [ZOp.in]:{
        //         [ZOp.query]:{
        //           tableName,
        //           fields:['']
        //           condition: {
        //             uuid
        //           }
        //         }
        //       }
        //     }
        //   }
        // }

        // const {
        //   results: [{ inventories: bkList }, { inventories: localList }]
        // } = await this.zqlService.call(ZQL.multStringify([zqlObj, zqlLocalObj]))

        // const backupData = bkList?.[0]
        // if (!backupData) return false
        // const bsUuids = backupData.backupStorageRefs.map(
        //   bs => bs.backupStorageUuid
        // )
        // const localBackupStorageUuids = _.keys(arrayToMap(localList))
        // return bsUuids.some(bsUuid =>
        //   _.includes(localBackupStorageUuids, bsUuid)
        // )
      })
    )
  }

  async isRemoteSynced(uuid: string, type: BackupResourceType) {
    this.asyncMap[uuid] =
      type === BackupResourceType.Database
        ? { tableName: 'databasebackup' }
        : { tableName: 'volumebackup' }
    const isRemoteSynced = await this.isAsyncDataloader.load(uuid)
    return isRemoteSynced ? BackupDataIsRemoteSynced.Yes : BackupDataIsRemoteSynced.No
  }
  /**
   *
   * @param uuids 是否同步到远端，本地备份的backupStorageRefs 在远端备份服务器
   */
  _isAsync = async uuids => {
    return Promise.all(
      uuids.map(async uuid => {
        const { tableName } = this.asyncMap[uuid]
        const zqlBackupDataObj: ZqlObject = {
          tableName,
          limit: 1,
          condition: {
            uuid,
            'backupStorageRefs.backupStorageUuid': {
              [Op.in]: {
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

        const {
          results: [{ inventories: dbList }]
        } = await this.zqlService.call(ZQL.stringify(zqlBackupDataObj))

        return dbList?.length > 0
      })
    )
  }

  async backupStorageName(uuid) {
    return this.backupStorageNameDataloader.load(uuid)
  }

  /**
   *
   * @param uuids
   * @returns {backupStorageName:string , backupStorageUuid:string}
   */
  getBackupStorageName = async uuids => {
    return Promise.all(
      uuids.map(async uuid => {
        const { tableName, zoneUuid, bsUuid } = this.backupStorageNameMap[uuid]
        const zqlLocalObj: ZqlObject = {
          tableName: 'backupstorage',
          fields: ['uuid'],
          condition: {
            // status: 'Ready',
            type: 'ImageStoreBackupStorage',
            __systemTag__: {
              [ZOp.in]: ['onlybackup', 'allowbackup']
            }
          }
        }

        // backupstorage Uuid
        if (bsUuid) {
          // zqlLocalObj = mergeZqlObject(zqlLocalObj, {
          //   condition: {
          //     uuid: bsUuid
          //   }
          // })

          zqlLocalObj.condition.uuid = bsUuid

          const {
            results: [{ inventories: backupList }]
          } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

          return {
            backupStorageName: backupList?.[0]?.name,
            backupStorageUuid: bsUuid
          }
        }

        if (zoneUuid) {
          // zqlLocalObj = mergeZqlObject(zqlLocalObj, {
          //   condition: {
          //     'zone.uuid': zoneUuid
          //   }
          // })

          zqlLocalObj.condition['zone.uuid'] = zoneUuid
        }

        const zqlRemoteObj: ZqlObject = {
          tableName: 'backupstorage',
          condition: {
            // status: 'Ready',
            type: 'ImageStoreBackupStorage',
            __systemTag__: {
              [ZOp.in]: ['aliyun', 'remotebackup']
            }
          }
        }

        const zqlStorageObj: ZqlObject = {
          tableName: 'backupstorage',
          condition: {
            // status: 'Ready',
            type: 'ImageStoreBackupStorage'
          }
        }

        const zqlDatabasebj: ZqlObject = {
          tableName,
          condition: {
            uuid
          }
        }

        const {
          results: [
            { inventories: localList },
            { inventories: remoteList },
            { inventories: storageList },
            { inventories: backupList }
          ]
        } = await this.zqlService.call(
          ZQL.multStringify([zqlLocalObj, zqlRemoteObj, zqlStorageObj, zqlDatabasebj])
        )

        const storageListMap = arrayToMap(storageList)
        const backupData = backupList[0]
        if (!backupData) {
          return ''
        }
        const bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
        const remoteBackupStorageUuids = remoteList.map(({ uuid }) => uuid)
        const localBackupStorageUuids = localList.map(({ uuid }) => uuid)
        const tempLocalBsUuids = _.difference(bsUuids, remoteBackupStorageUuids)
        let result = ''
        let backupStorageUuid = ''
        if (tempLocalBsUuids.length > 0) {
          for (let i = tempLocalBsUuids.length - 1; i >= 0; i--) {
            if (_.includes(localBackupStorageUuids, tempLocalBsUuids[i])) {
              result = (storageListMap[tempLocalBsUuids[i] as any] as any).name
              backupStorageUuid = tempLocalBsUuids[i] as string
              break
            }
          }
        } else {
          const remoteBackupStorage: any = storageListMap[remoteBackupStorageUuids[0]]
          if (remoteBackupStorage) {
            result = remoteBackupStorage.name
            backupStorageUuid = remoteBackupStorage.uuid
          }
        }

        return { backupStorageName: result, backupStorageUuid }
      })
    )
  }

  async exportDatabaseBackupFromBackupStorage(databaseBackupUuid, backupStorageUuid) {
    const baseCondition = {
      [ZOp.in]: {
        [ZOp.query]: {
          tableName: 'databasebackupStorageRef',
          fields: ['backupStorageUuid'],
          condition: {
            databaseBackupUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'databasebackup',
                  fields: ['uuid'],
                  condition: {
                    uuid: databaseBackupUuid
                  }
                }
              }
            }
          }
        }
      }
    }

    const queryDatabasebackupStorageRef = async (uuid: string) => {
      const zqlObj: ZqlObject = {
        tableName: 'databasebackupStorageRef',
        condition: {
          backupStorageUuid: uuid,
          databaseBackupUuid
        }
      }

      const {
        results: [{ inventories }]
      } = await this.zqlService.call(ZQL.stringify(zqlObj))

      return inventories?.[0]?.exportUrl
    }

    let _backupStorageUuid: string
    if (!backupStorageUuid) {
      // 同步到本地 本地备份服务器 uuid = _backupStorageUuid
      const zqlLocalObj: ZqlObject = {
        tableName: 'backupstorage',
        condition: {
          type: 'ImageStoreBackupStorage',
          __systemTag__: {
            [ZOp.in]: ['onlybackup', 'allowbackup']
          },
          uuid: baseCondition
        }
      }
      const {
        results: [{ inventories: localList }]
      } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))
      // if (localList?.length > 0) {
      //   const exportUrl = await queryDatabasebackupStorageRef(localList?.[0]?.uuid)
      //   if (exportUrl) return exportUrl
      // }
      _backupStorageUuid = localList?.[0]?.uuid
      if (!_backupStorageUuid) {
        // 同步到远端 远端备份服务器 uuid = _backupStorageUuid
        const zqlRemoteObj: ZqlObject = {
          tableName: 'backupstorage',
          condition: {
            type: 'ImageStoreBackupStorage',
            __systemTag__: {
              [ZOp.in]: ['aliyun', 'remotebackup']
            },
            uuid: baseCondition
          }
        }

        const {
          results: [{ inventories: remoteList }]
        } = await this.zqlService.call(ZQL.stringify(zqlRemoteObj))

        // if (remoteList?.length > 0 && remoteList?.[0]?.exportUrl) {
        //   const exportUrl = await queryDatabasebackupStorageRef(localList?.[0]?.uuid)
        //   if (exportUrl) return exportUrl
        // }

        _backupStorageUuid = remoteList?.[0]?.uuid
      }

      backupStorageUuid = _backupStorageUuid
    }

    const exportUrl = await queryDatabasebackupStorageRef(backupStorageUuid)
    if (exportUrl) {
      return exportUrl
    }

    const { databaseBackupUrl } = await this.exportDatabaseBackupFromBackupStorageAction.call({
      backupStorageUuid,
      databaseBackupUuid
    })
    return databaseBackupUrl
  }

  async getConsoleLog(first: boolean) {
    const buffer = Buffer.alloc(1024 * 6)
    return new Promise((res, rej) => {
      if (first) {
        //删除文件内容
        fs.truncate(tempFilePath, 0, () => {
          res('')
        })
        return
      }

      fs.stat(tempFilePath, (err1, stats) => {
        //文件不存在
        if (err1) {
          return res('')
        }

        const totalSize = stats.size
        const pos = totalSize - buffer.length > 0 ? totalSize - buffer.length : 0

        fs.open(tempFilePath, 'r', (err, fd) => {
          if (err) {
            return res('')
          }
          fs.read(fd, buffer, 0, buffer.length, pos, (error, bytesRead: number, bf: Buffer) => {
            if (error) {
              return rej(error)
            }
            const message = bf.toString('utf8')
            const msgList = message?.split('\n')
            const msgLength = msgList.length - 50 > 0 ? msgList.length - 50 : 0
            const newList = msgList.slice(msgLength)

            fs.close(fd, () => {
              res(totalSize === 0 ? '' : newList.join('\n'))
            })
          })
        })
      })
    })
  }

  async canScanDatabaseBackup() {
    const zqlLocalObj: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'backupstorage',
      condition: {
        type: 'ImageStoreBackupStorage',
        __systemTag__: {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        }
      }
    }
    const {
      results: [{ total = 0 }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    const canScan = total > 0

    return canScan
  }

  async queryDatabase(params) {
    const { extraConditions, conditions } = params

    const conditionsMap = conditionsToObject(extraConditions)
    const _conditionsMap = conditionsToObject(conditions)
    const zoneUuid = conditionsMap['zoneUuid']
    const conditons = []
    const isAsyncCondition = this.spliceFilterKeyCondition(
      params,
      'isRemoteSynced',
      this.getIsRemoteSyncedFilterCondition
    )
    if (isAsyncCondition) {
      conditons.push(isAsyncCondition)
    }

    const isLocalSyncedFilterCondition = this.spliceFilterKeyCondition(
      params,
      'isLocalSynced',
      this.getIsLocalSyncedFilterCondition
    )
    if (isLocalSyncedFilterCondition) {
      conditions.push(isLocalSyncedFilterCondition)
    }

    const zqlObj: ZqlObject = {
      tableName: 'databasebackup'
      // condition: {
      //   status: 'Ready',
      //   'backupStorage.__systemTag__': {
      //     [ZOp.in]: ['onlybackup', 'allowbackup']
      //   }
      // }
    }

    if (conditons.length > 0) {
      zqlObj.condition = {
        [ZOp.and]: conditons
      }
    }

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObj))
    const {
      results: [{ inventories = [], total = 0 } = {}]
    } = await this.zqlService.call(zql)

    const list = await Promise.all(
      inventories.map(async l => {
        const { uuid, metadata, backupStorageRefs } = l
        const version = JSON.parse(metadata)?.version

        const bsUuid = _conditionsMap['backupStorage.uuid']

        this.backupStorageNameMap[uuid] = {
          tableName: 'databasebackup',
          zoneUuid,
          bsUuid
        }
        const { backupStorageName, backupStorageUuid } = await this.backupStorageName(uuid)

        return {
          ...l,
          version,
          backupStorageName,
          backupStorageUuid,
          backupStorageRefs,
          zoneUuid
        }
      })
    )

    return {
      list,
      total
    }
  }

  async getVmInstanceResourceData(params) {
    const { extraConditions } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const resourceName = extraConditionsMap['resourceName']
    const zoneUuid = extraConditionsMap['zoneUuid']

    let zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      fields: ['volumeUuid'],
      condition: {
        status: 'Ready',
        type: 'Root',
        'backupStorage.zone.uuid': zoneUuid,
        'backupStorage.__systemTag__': {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        }
      }
    }

    if (resourceName) {
      const zqlVmSubObj: ZqlObject = {
        tableName: 'VmInstance',
        fields: ['rootVolumeUuid'],
        condition: {
          name: {
            [ZOp.like]: resourceName
          },
          rootVolumeUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'volumebackup',
                fields: ['volumeUuid'],
                condition: {
                  status: 'Ready',
                  'backupStorage.__systemTag__': {
                    [ZOp.in]: ['onlybackup', 'allowbackup']
                  },
                  type: {
                    [ZOp.in]: ['Root', 'Data']
                  }
                }
              }
            }
          }
        }
      }

      zqlObj = mergeZqlObject(zqlObj, {
        tableName: 'volumebackup',

        condition: {
          [ZOp.or]: [
            {
              volumeUuid: {
                [ZOp.is]: null
              }
            },
            {
              volumeUuid: {
                [ZOp.in]: {
                  [ZOp.query]: zqlVmSubObj
                }
              }
            }
          ]
        }
      })
    }

    const _zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      condition: {
        [ZOp.or]: [
          {
            volumeUuid: {
              [ZOp.is]: null
            }
          },
          {
            volumeUuid: {
              [ZOp.in]: {
                [ZOp.query]: zqlObj
              }
            }
          }
        ]
      }
    }

    const zql = QueryConditionTranslator.mergeQueryAction(params, _zqlObj)

    const zqlStr = ZQL.stringify(zql)
    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zqlStr)

    const vmMap = arrayToArrayMap(inventories, 'volumeUuid')

    const list = Object.keys(vmMap).map(async volumeUuid => {
      const { type, metadata } = vmMap[volumeUuid]?.[0] as any
      const { vmInstanceUuid, vmName, name } = JSON.parse(metadata)
      const defaultName = type === 'Root' ? vmName : name
      const resourceUuid = type === 'Root' ? vmInstanceUuid : volumeUuid
      const { resourceName } = await this.resourceNameDataloader.load(resourceUuid)

      return {
        uuid: resourceUuid,
        name: resourceName || defaultName,
        totalSize: vmMap[volumeUuid]?.reduce((t, c: any) => t + c.size, 0) ?? 0,
        count: vmMap[volumeUuid]?.length ?? 0
      }
    })

    return {
      list,
      total: list.length
    }
  }

  async getVolumeBackup(params) {
    const { extraConditions } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const resourceName = extraConditionsMap['resourceName']
    const resourceUuid = extraConditionsMap['resourceUuid']
    const zoneUuid = extraConditionsMap['zoneUuid']

    let zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      fields: ['volumeUuid'],
      condition: {
        status: 'Ready',
        type: 'Data',
        'backupStorage.zone.uuid': zoneUuid,
        'backupStorage.__systemTag__': {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        }
      }
    }

    if (resourceName) {
      const zqlVmSubObj: ZqlObject = {
        tableName: 'Volume',
        fields: ['uuid'],
        condition: {
          name: {
            [ZOp.like]: resourceName
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'volumebackup',
                fields: ['volumeUuid'],
                condition: {
                  status: 'Ready',
                  'backupStorage.__systemTag__': {
                    [ZOp.in]: ['onlybackup', 'allowbackup']
                  },
                  type: {
                    [ZOp.in]: ['Root', 'Data']
                  }
                }
              }
            }
          }
        }
      }

      zqlObj = mergeZqlObject(zqlObj, {
        tableName: 'volumebackup',

        condition: {
          [ZOp.or]: [
            {
              volumeUuid: {
                [ZOp.is]: null
              }
            },
            {
              volumeUuid: {
                [ZOp.in]: {
                  [ZOp.query]: zqlVmSubObj
                }
              }
            }
          ]
        }
      })
    }

    const _zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      condition: {
        [ZOp.or]: [
          {
            volumeUuid: {
              [ZOp.is]: null
            }
          },
          {
            volumeUuid: {
              [ZOp.in]: {
                [ZOp.query]: zqlObj
              }
            }
          }
        ]
      }
    }

    const zql = QueryConditionTranslator.mergeQueryAction(params, _zqlObj)

    const zqlStr = ZQL.stringify(zql)
    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zqlStr)
  }

  async queryBackupResourceData(_params: QueryBackupResourceArgs) {
    const { extraConditions, conditions: _conditions, sortBy, type, ...rest } = _params
    const conditionsMap = conditionsToObject(_conditions)
    const extraConditionsMap = conditionsToObject(extraConditions)
    const resourceName = conditionsMap['name']
    const zoneUuid = extraConditionsMap['zoneUuid']

    const conditions = _conditions.filter(c => c.key !== 'name')

    const params = { ..._params, conditions }

    let zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      fields: ['volumeUuid'],
      condition: {
        status: 'Ready',
        type: type === BackupResourceType.VmInstance ? 'Root' : 'Data',
        'backupStorage.zone.uuid': zoneUuid
        // 'backupStorage.__systemTag__': {
        //   [ZOp.in]: ['onlybackup', 'allowbackup']
        // }
      }
    }

    if (resourceName) {
      const uuidKey = type === BackupResourceType.VmInstance ? 'rootVolumeUuid' : 'uuid'
      const zqlVmSubObj: ZqlObject = {
        tableName: type === BackupResourceType.VmInstance ? 'VmInstance' : 'Volume',
        fields: type === BackupResourceType.VmInstance ? ['rootVolumeUuid'] : ['uuid'],
        condition: {
          name: {
            [ZOp.like]: resourceName
          },
          [uuidKey]: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'volumebackup',
                fields: ['volumeUuid'],
                condition: {
                  status: 'Ready',
                  // 'backupStorage.__systemTag__': {
                  //   [ZOp.in]: ['onlybackup', 'allowbackup']
                  // },
                  type: {
                    [ZOp.in]: ['Root', 'Data']
                  }
                }
              }
            }
          }
        }
      }

      //rootVolumeUuid
      zqlObj = mergeZqlObject(zqlObj, {
        tableName: 'volumebackup',

        condition: {
          [ZOp.or]: [
            {
              volumeUuid: {
                [ZOp.is]: null
              }
            },
            {
              volumeUuid: {
                [ZOp.in]: {
                  [ZOp.query]: zqlVmSubObj
                }
              }
            }
          ]
        }
      })
    }

    let _zqlObj: ZqlObject = {
      tableName: 'volumebackup',
      condition: {
        volumeUuid: {
          [ZOp.in]: {
            [ZOp.query]: zqlObj
          }
        }
      }
    }
    /*
ZQLQuery zql="count volumebackup   where status='Ready' and backupStorage.__systemTag__ in ('onlybackup','allowbackup') and volumeUuid in (query volumebackup.volumeUuid where status='Ready' and type='Root' and backupStorage.zone.uuid='cc6bda2914ba46cab7fe1d71c522ac76') group by volumeUuid"
    */

    // 按照容量大小排序
    if (sortBy === 'size') {
      _zqlObj = mergeZqlObject(_zqlObj, {
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'volumeUuid',
        orderBy: 'size'
      })

      const zqlObjMerge = QueryConditionTranslator.mergeQueryAction(params, _zqlObj)

      const zqlStr = ZQL.multStringify([
        zqlObjMerge,
        {
          tableName: zqlObjMerge.tableName,
          condition: zqlObjMerge.condition,
          action: ZQLAction.COUNT,
          groupBy: 'volumeUuid'
        }
      ])

      const {
        results: [{ inventories = [] } = {}, { inventoryCounts = [] } = {}]
      } = await this.zqlService.call(zqlStr)

      const total = inventoryCounts?.length ?? 0
      const sortList = []
      const sizeMap = inventories.reduce((p, c) => {
        p[c[0]] = c[1]
        sortList.push(c[0])
        return p
      }, {})

      const zqlBackupObj: ZqlObject = {
        tableName: 'volumebackup',
        condition: {
          volumeUuid: {
            [ZOp.in]: Object.keys(sizeMap)
          }
        }
      }

      const {
        results: [{ inventories: backupList = [] } = {}]
      } = await this.zqlService.call(ZQL.stringify(zqlBackupObj))
      const vmMap = arrayToArrayMap(backupList, 'volumeUuid')

      const list = await Promise.all(
        Object.keys(vmMap).map(async volumeUuid => {
          const { type, metadata } = vmMap[volumeUuid]?.[0] as any
          const { vmInstanceUuid, vmName, name } = JSON.parse(metadata)
          const defaultName = type === 'Root' ? vmName : name
          const resourceUuid = type === 'Root' ? vmInstanceUuid : volumeUuid
          const resource = await this.resourceNameDataloader.load(resourceUuid)

          return {
            volumeUuid,
            uuid: resourceUuid,
            name: resource?.resourceName || defaultName,
            size: sizeMap[volumeUuid] ?? 0,
            count: vmMap[volumeUuid]?.length ?? 0
          }
        })
      )

      const listMap = arrayToMap(list, 'volumeUuid')

      return {
        list: sortList.map(volumeUuid => {
          const v = listMap[volumeUuid] as any
          return v
        }),
        total
      }
    } else {
      /**
       * 
      count volumebackup where status='Ready' and backupStorage.__systemTag__ in ('onlybackup','allowbackup') and (volumeUuid is null or volumeUuid in (query volumebackup.volumeUuid where status='Ready' and type='Data' and backupStorage.zone.uuid='77cc373e4f924ae8b3191069bbd72b34')) group by volumeUuid order by volumeUuid asc limit 20
       */
      //按照数量排序
      _zqlObj = mergeZqlObject(_zqlObj, {
        action: ZQLAction.COUNT,
        groupBy: 'volumeUuid',
        orderBy: 'groupCount'
      })

      const zqlObjMerge = QueryConditionTranslator.mergeQueryAction(params, _zqlObj)

      const zqlStr = ZQL.multStringify([
        zqlObjMerge,
        {
          tableName: zqlObjMerge.tableName,
          condition: zqlObjMerge.condition,
          action: ZQLAction.COUNT,
          groupBy: 'volumeUuid'
        }
      ])

      const {
        results: [{ inventoryCounts = [] } = {}, { inventoryCounts: inventoryCountsWithTotal = [] }]
      } = await this.zqlService.call(zqlStr)

      const total = inventoryCountsWithTotal?.length ?? 0
      const sortList = []

      const countMap = inventoryCounts.reduce((p, c) => {
        p[c[0].volumeUuid] = c[1]

        sortList.push(c[0].volumeUuid)

        return p
      }, {})

      const zqlBackupObj: ZqlObject = {
        tableName: 'volumebackup',
        condition: {
          volumeUuid: {
            [ZOp.in]: Object.keys(countMap)
          }
        }
      }

      const {
        results: [{ inventories: backupList }]
      } = await this.zqlService.call(ZQL.stringify(zqlBackupObj))
      const vmMap = arrayToArrayMap(backupList, 'volumeUuid')

      const list = await Promise.all(
        Object.keys(vmMap).map(async volumeUuid => {
          const { type, metadata } = vmMap[volumeUuid]?.[0] as any
          const { vmInstanceUuid, vmName, name } = JSON.parse(metadata)
          const defaultName = type === 'Root' ? vmName : name
          const resourceUuid = type === 'Root' ? vmInstanceUuid : volumeUuid
          const resource = await this.resourceNameDataloader.load(resourceUuid)

          return {
            volumeUuid,
            uuid: resourceUuid,
            name: resource?.resourceName || defaultName,
            size: vmMap[volumeUuid]?.reduce((t, c: any) => t + c.size, 0) ?? 0,
            count: countMap[volumeUuid] ?? 0
          }
        })
      )
      const listMap = arrayToMap(list, 'volumeUuid')

      return {
        list: sortList.map(volumeUuid => {
          const v = listMap[volumeUuid] as any
          return v
        }),
        total
      }
    }
  }

  // 云主机备份时传volumeUuid为rootVolumeUuid，云盘备份时为volumeUuid
  // uuid: 获取详情时可用
  private async _queryBackupData(params: QueryAction) {
    const conditionsMap = conditionsToObject(params.conditions) as QueryBackupDataConditions
    const uuidObj = conditionsMap.uuid ? { uuid: { [ZOp.eq]: conditionsMap?.uuid } } : {}
    const zqlObject = {
      tableName: 'volumebackup',
      condition: {
        status: 'Ready',
        'backupStorage.__systemTag__': {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        },
        volumeUuid: {
          [ZOp.eq]: conditionsMap?.volumeUuid
        },
        ...uuidObj
      },
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      },
      namedAs: 'backupData'
    }
    const zql = ZQL.stringify(zqlObject)
    return this.zqlService.call(zql)
  }

  // ui 需要传入 conditions: [zone.uuid]
  private async _queryLocalBackupStorage(conditions: ICondition[]) {
    const conditionsMap = conditionsToObject(conditions) as QueryLocalBackupDataConditions
    const remoteBackupStorageZql = ZQL.stringify({
      tableName: 'backupstorage',
      condition: {
        type: 'ImageStoreBackupStorage',
        __systemTag__: {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        },
        'zone.uuid': {
          [ZOp.eq]: conditionsMap['zone.uuid']
        }
      },
      namedAs: 'localBackupStorage'
    })
    return this.zqlService.call(remoteBackupStorageZql)
  }

  private async _queryRemoteBackupStorage() {
    const remoteBackupStorageZql = ZQL.stringify({
      tableName: 'backupstorage',
      condition: {
        type: 'ImageStoreBackupStorage',
        __systemTag__: {
          [ZOp.in]: ['aliyun', 'remotebackup']
        }
      },
      namedAs: 'remoteBackupStorage'
    })
    return this.zqlService.call(remoteBackupStorageZql)
  }

  private async _queryBackupStorage() {
    const backupstorageZql = ZQL.stringify({
      tableName: 'backupstorage',
      condition: {
        type: 'ImageStoreBackupStorage'
      },
      namedAs: 'backupstorage'
    })
    return this.zqlService.call(backupstorageZql)
  }

  // 是否同步到远端
  private _isRemoteSynced(backupUuid: string) {
    const backupData = _.find(this.backupData, item => item.uuid === backupUuid)
    if (!backupData) {
      return false
    }
    const bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
    const remoteBackupStorageUuids = this.remoteBackupStorageResp.results?.[0].inventories.map(
      item => item.uuid
    )
    return bsUuids.some(uuid => _.includes(remoteBackupStorageUuids, uuid))
  }

  // 创建备份后同步到远端服务器
  async syncToRemoteBackupStorage({
    backupData: { type, uuid, groupUuid = '' },
    backupStorageUuid,
    remoteBackupStorageUuid
  }) {
    if (groupUuid && type === 'Root') {
      return this.syncVmBackupFromImageStoreBackupStorageAction.call({
        groupUuid,
        srcBackupStorageUuid: backupStorageUuid,
        dstBackupStorageUuid: remoteBackupStorageUuid
      })
    } else {
      return this.syncBackupFromImageStoreBackupStorageAction.call({
        uuid,
        srcBackupStorageUuid: backupStorageUuid,
        dstBackupStorageUuid: remoteBackupStorageUuid
      })
    }
  }
}

export interface CreateVmBackupParam {
  name: string
  volumeUuid: string
  mode?: string
  backupStorageUuid: string
}

export interface CreateVolumeBackupParam {
  name: string
  rootVolumeUuid: string
  mode?: string
  backupStorageUuid: string
}

export interface SyncBackupFromImageStoreBackupStorageActionParam {
  uuid: string
  srcBackupStorageUuid: string
  dstBackupStorageUuid: string
}

export interface SyncVmBackupFromImageStoreBackupStorageActionParam {
  groupUuid: string
  srcBackupStorageUuid: string
  dstBackupStorageUuid: string
}

export interface QueryBackupDataConditions {
  volumeUuid: string
  uuid?: string
}

export interface QueryLocalBackupDataConditions {
  'zone.uuid': string
}
