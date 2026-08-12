import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetBlockPrimaryStorageMetadataAction } from '@/api/zstack/GetBlockPrimaryStorageMetadataAction'
import {
  GetCandidatePrimaryStoragesForCreatingVmAction,
  GetCandidatePrimaryStoragesForCreatingVmActionParam
} from '@/api/zstack/GetCandidatePrimaryStoragesForCreatingVmAction'
import { GetPrimaryStorageCandidatesForVmMigrationAction } from '@/api/zstack/GetPrimaryStorageCandidatesForVmMigrationAction'
import { GetPrimaryStorageCandidatesForVolumeMigrationAction } from '@/api/zstack/GetPrimaryStorageCandidatesForVolumeMigrationAction'
import { GetPrimaryStorageLicenseInfoAction } from '@/api/zstack/GetPrimaryStorageLicenseInfoAction'
import { GetTrashOnPrimaryStorageAction } from '@/api/zstack/GetTrashOnPrimaryStorageAction'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryBareMetal2InstanceAction } from '@/api/zstack/QueryBareMetal2InstanceAction'
import { QueryBlockVolumeAction } from '@/api/zstack/QueryBlockVolumeAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QuerySharedBlockAction } from '@/api/zstack/QuerySharedBlockAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { QueryVpcRouterAction } from '@/api/zstack/QueryVpcRouterAction'
import { QueryXskyBlockVolumeAction } from '@/api/zstack/QueryXskyBlockVolumeAction'
import { PrimaryStorageStatus } from '@/common/enum'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { convertSizeToBytes } from '@/utils'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'

import { AddonPs, getAvailablePsTypes } from '../helper'
import {
  Expired,
  PrimaryStorageQueryType,
  PrimaryStorageRelatedResourceCounts,
  PrimaryStorageRelatedSummary,
  PrimaryStorageVO,
  QueryPrimaryStorageArgs
} from '../primary-storage.model'

@Injectable()
export class PrimaryStorageQueryService {
  @Inject() zsHttpService: ZsHttpService
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() queryBlockVolumeAction: QueryBlockVolumeAction
  @Inject() queryXskyBlockVolumeAction: QueryXskyBlockVolumeAction
  @Inject() queryClusterAction: QueryClusterAction
  @Inject() queryVpcRouterAction: QueryVpcRouterAction
  @Inject() querySharedBlockAction: QuerySharedBlockAction
  @Inject() getTrashOnPrimaryStorageAction: GetTrashOnPrimaryStorageAction
  @Inject()
  getBlockPrimaryStorageMetadataAction: GetBlockPrimaryStorageMetadataAction
  @Inject()
  getPrimaryStorageLicenseInfoAction: GetPrimaryStorageLicenseInfoAction
  @Inject()
  queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject()
  getCandidatePrimaryStoragesForCreatingVmAction: GetCandidatePrimaryStoragesForCreatingVmAction
  @Inject()
  queryVmInstanceAction: QueryVmInstanceAction
  @Inject()
  queryBareMetal2InstanceAction: QueryBareMetal2InstanceAction
  @Inject()
  getPrimaryStorageCandidatesForVmMigrationAction: GetPrimaryStorageCandidatesForVmMigrationAction
  @Inject()
  getPrimaryStorageCandidatesForVolumeMigrationAction: GetPrimaryStorageCandidatesForVolumeMigrationAction
  @Inject()
  queryBackupStorageAction: QueryBackupStorageAction

  @Inject()
  zqlService: ZQLService

  private systemTagDataLoader
  private psReservedCapacityDataLoader
  private clusterDataLoader
  private psReservedPhysicalCapacityDataLoader
  private psClusterUuidsMap = {}
  private psTotalPhysicalCapacityMap = {}

  constructor() {
    this.clusterDataLoader = new DataLoader(this._getCluster)
    this.systemTagDataLoader = new DataLoader(this._getSystemTag)
    this.psReservedCapacityDataLoader = new DataLoader(this._getReservedCapacity)
    this.psReservedPhysicalCapacityDataLoader = new DataLoader(this._getReservedPhysicalCapacity)
  }

  async query(params: QueryPrimaryStorageArgs) {
    const { type } = params
    let finalConditions: ICondition[] = []
    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      // 普通ps
      case PrimaryStorageQueryType.Zstack:
        finalConditions = []
        break

      // 创建云主机数据云盘
      case PrimaryStorageQueryType.CreateVmForDataVolumeCandidate:
        finalConditions = await this.getCandidateForCreateVmDataVolume(params.extraConditions)
        break

      // 创建云主机根云盘
      case PrimaryStorageQueryType.CreateVmForRootVolumeCandidate:
        finalConditions = await this.getCandidateForCreateVmRootVolume(params.extraConditions)
        break

      // 获取云主机可存储迁移的主存储列表
      case PrimaryStorageQueryType.StorageMigrateVm:
        const { conditions, uuidZql } = await this.getCandidateForStorageMigrateVmInstance(
          params.extraConditions
        )
        finalConditions = conditions
        _extrazqlConditions = uuidZql
        break

      // 获取路由器可存储迁移的主存储列表
      case PrimaryStorageQueryType.StorageMigrateVpcRouter:
        _extrazqlConditions = await this.getCandidateForStorageMigrateVpcRouter(
          params.extraConditions
        )
        break

      // 获取云盘可存储迁移的主存储列表
      case PrimaryStorageQueryType.GetPrimaryStorageCandidatesForVolumeMigration:
        _extrazqlConditions = await this.getPrimaryStorageCandidatesForVolumeMigration(
          params.extraConditions
        )
        break

      // 获取集群可加载的主存储
      case PrimaryStorageQueryType.ClusterAttachablePs:
        _extrazqlConditions = await this.getClusterAttachablePrimaryStorage(params.extraConditions)
        break

      // create vm by import ovf
      case PrimaryStorageQueryType.OvfImport:
        _extrazqlConditions = await this.getOvfAttachablePrimaryStorage(params.extraConditions)
        finalConditions = params?.conditions
        break

      // 云盘镜像创建云盘获取可用主存储
      case PrimaryStorageQueryType.CreateDataVolumeByVolumeImageGetCandidatePrimaryStorage:
        finalConditions = await this.getCandidateForCreateDataVolumeByVolumeImage(
          params.extraConditions
        )
        break

      case PrimaryStorageQueryType.RecoverRootVolumeBackupCandidate:
        _extrazqlConditions = this.getRecoverRootVolumeBackupCandidate(params)
        break

      case PrimaryStorageQueryType.RecoverDataVolumeBackupCandidate:
        _extrazqlConditions = this.getRecoverDataVolumeBackupCandidate(params)
        break

      ////////////---------------Blow For ZSphere---------------------//////

      default:
        break
    }

    const specialCondition = []
    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'PrimaryStorageVO',
      conditions: params.conditions
    })
    if (resourceAttributeZqlCondition) {
      specialCondition.push(resourceAttributeZqlCondition)
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(finalConditions),
      _.compact(specialCondition.concat(_extrazqlConditions))
    )

    _resultResp = await this.getPrimaryStorageList(params, zqlCondition)

    return _resultResp
  }

  async getPrimaryStorageList(param: IQueryAction, zqlCondition: any) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'PrimaryStorage',
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
    const primaryStorages = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: primaryStorages,
      total: total
    }
  }

  buildAddonPrimaryStorageCondition(psTypeList: string[]) {
    const normalStorageTypeList = []
    const externalStorageIdentityList = []

    // 处理Addon类型的主存储筛选
    const externalStorageZqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'ExternalPrimaryStorage',
            fields: ['uuid'],
            condition: {
              identity: {
                [ZOp.in]: externalStorageIdentityList
              }
            }
          }
        }
      }
    }

    const normalStorageZqlCondition = {
      type: {
        [ZOp.in]: normalStorageTypeList
      }
    }

    psTypeList.forEach(value => {
      // Addon 类型：Vhost 主存储
      if (value === 'Vhost') {
        // 厂商
        externalStorageIdentityList.push('expon')
        return
      }

      // Addon 类型：CBD 主存储
      if (value === 'CBD') {
        externalStorageIdentityList.push('zbs')
        return
      }

      // 其他主存储类型无需处理，直接喂给后端
      normalStorageTypeList.push(value)
    })

    return {
      [ZOp.or]: [externalStorageZqlCondition, normalStorageZqlCondition]
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      '__IscsiServerUuids__',
      '__IscsiTargetUuids__',
      '__FiberChannelStorageUuids__',
      '__NvmeTargetUuids__',
      '__NvmeServerUuids__',
      '__PrimaryStorageType__'
    ])

    const specicalCondition = []

    if (_extraConditionMap['__IscsiServerUuids__']) {
      const iscsiServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__IscsiServerUuids__']?.value ||
            _extraConditionMap['__IscsiServerUuids__']?.values
        ])
      )

      const iscsiServerZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                'sharedBlocks.diskUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'IscsiLun',
                      fields: ['wwid'],
                      condition: {
                        'iscsiTarget.iscsiServerUuid': {
                          [ZOp.in]: iscsiServerUuids
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

      specicalCondition.push(iscsiServerZqlCondition)
    }

    if (_extraConditionMap['__IscsiTargetUuids__']) {
      const iscsiTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__IscsiTargetUuids__']?.value ||
            _extraConditionMap['__IscsiTargetUuids__']?.values
        ])
      )

      const iscsiServerZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                'sharedBlocks.diskUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'IscsiLun',
                      fields: ['wwid'],
                      condition: {
                        iscsiTargetUuid: {
                          [ZOp.in]: iscsiTargetUuids
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

      specicalCondition.push(iscsiServerZqlCondition)
    }

    if (_extraConditionMap['__FiberChannelStorageUuids__']) {
      const fiberChannelStorageUuids = _.compact(
        _.flatten([
          _extraConditionMap['__FiberChannelStorageUuids__']?.value ||
            _extraConditionMap['__FiberChannelStorageUuids__']?.values
        ])
      )

      const fcZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                'sharedBlocks.diskUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'FiberChannelLun',
                      fields: ['wwid'],
                      condition: {
                        fiberChannelStorageUuid: {
                          [ZOp.in]: fiberChannelStorageUuids
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

      specicalCondition.push(fcZqlCondition)
    }

    if (_extraConditionMap['__NvmeServerUuids__']) {
      const nvmeServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__NvmeServerUuids__']?.value ||
            _extraConditionMap['__NvmeServerUuids__']?.values
        ])
      )

      const nvmeServerZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                'sharedBlocks.diskUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'NvmeLun',
                      fields: ['wwid'],
                      condition: {
                        'nvmeTarget.nvmeServerUuid': {
                          [ZOp.in]: nvmeServerUuids
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

      specicalCondition.push(nvmeServerZqlCondition)
    }

    if (_extraConditionMap['__NvmeTargetUuids__']) {
      const nvmeTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__NvmeTargetUuids__']?.value ||
            _extraConditionMap['__NvmeTargetUuids__']?.values
        ])
      )

      const nvmeZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlockGroupPrimaryStorage',
              fields: ['uuid'],
              condition: {
                'sharedBlocks.diskUuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'NvmeLun',
                      fields: ['wwid'],
                      condition: {
                        nvmeTargetUuid: {
                          [ZOp.in]: nvmeTargetUuids
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

      specicalCondition.push(nvmeZqlCondition)
    }

    // 处理Addon类型的主存储筛选
    if (_extraConditionMap['__PrimaryStorageType__']) {
      const psTypeList = _.compact(
        _.flatten([
          _extraConditionMap['__PrimaryStorageType__']?.value ||
            _extraConditionMap['__PrimaryStorageType__']?.values
        ])
      )

      specicalCondition.push(this.buildAddonPrimaryStorageCondition(psTypeList))
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getRecoverDataVolumeBackupCandidate(params) {
    const { extraConditions } = params
    const clusterUuid = (conditionsToObject(extraConditions) as any)?.clusterUuid
    const primaryStorageUuid = (conditionsToObject(extraConditions) as any)?.primaryStorageUuid
    const psType = (conditionsToObject(extraConditions) as any)?.psType

    const conditions = []

    const baseCondition: any = {
      state: 'Enabled',
      status: 'Connected',
      availableCapacity: {
        [ZOp.gte]: 1
      }
    }

    if (clusterUuid) {
      baseCondition['cluster.uuid'] = clusterUuid
    }

    if (psType) {
      baseCondition.type = {
        [ZOp.in]: ['NFS', 'SharedMountPoint', 'LocalStorage', 'Ceph']
      }
    }
    conditions.push({
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'primarystorage',
            fields: ['uuid'],
            condition: baseCondition
          }
        }
      }
    })

    if (primaryStorageUuid) {
      conditions.push({
        uuid: primaryStorageUuid
      })
    }

    return {
      [ZOp.or]: conditions
    }
  }
  getRecoverRootVolumeBackupCandidate(params) {
    const { extraConditions } = params
    const l3NetworkUuids = (conditionsToObject(extraConditions) as any)?.l3NetworkUuids ?? []

    return {
      'cluster.uuid': {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'cluster',
            fields: ['uuid'],
            condition: {
              state: 'Enabled',
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'l2networkclusterRef',
                    fields: ['clusterUuid'],
                    condition: {
                      l2NetworkUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'l2network',
                            fields: ['uuid'],
                            condition: {
                              uuid: {
                                [ZOp.in]: {
                                  [ZOp.query]: {
                                    tableName: 'l3Network',
                                    fields: ['l2NetworkUuid'],
                                    condition: {
                                      uuid: {
                                        [ZOp.in]: l3NetworkUuids
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
            }
          }
        }
      }
    }
  }

  async getCandidateForCreateDataVolumeByVolumeImage(extraConditions) {
    /*
     *
     * 'imageUuid',
     * 'rootVolumeUuid',
     * 'diskSize'
     *
     */
    const conditions: ICondition[] = [
      {
        key: 'state',
        op: Op.eq,
        value: 'Enabled'
      },
      {
        key: 'status',
        op: Op.eq,
        value: 'Connected'
      }
    ]
    const conditionsMap = conditionsToObject(extraConditions)

    if (conditionsMap['rootVolumeUuid']) {
      conditions.push({
        key: 'cluster.vmInstance.rootVolumeUuid',
        op: Op.eq,
        value: conditionsMap['rootVolumeUuid']?.value
      })
    }

    if (conditionsMap['diskSize']) {
      conditions.push({
        key: 'availableCapacity',
        op: Op.gte,
        value: conditionsMap['diskSize']?.value || '1'
      })
    } else {
      conditions.push({
        key: 'availableCapacity',
        op: Op.gte,
        value: '1'
      })
    }

    if (conditionsMap['imageUuid']) {
      const imageUuid = conditionsMap['imageUuid']?.value || ''
      let bsResp = null
      try {
        bsResp = await this.queryBackupStorageAction.call({
          conditions: [
            { key: 'image.uuid', op: Op.eq, value: imageUuid },
            { key: 'type', op: Op.eq, value: 'Ceph' }
          ],
          count: true
        })
      } catch (e) {
        console.error(e)
      }
      const total = bsResp?.total || 0
      if (total >= 1) {
        conditions.push({
          key: 'type',
          op: Op.eq,
          value: 'Ceph'
        })
      }
    }

    return conditions
  }

  async getCandidateForCreateVmDataVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)

    const conditions: ICondition[] = [{ key: 'state', op: Op.eq, value: 'Enabled' }]
    const candidateKeys = [
      'imageUuid',
      'l3NetworkUuids',
      'dataDiskOfferingUuids',
      'clusterUuid',
      'rootDiskOfferingUuid',
      'rootDiskSize',
      'dataDiskSizes'
    ]
    const candidateParams = _.pick(
      conditionsMap,
      candidateKeys
    ) as GetCandidatePrimaryStoragesForCreatingVmActionParam

    const baseResp = await this.getCandidatePrimaryStoragesForCreatingVmAction.call(candidateParams)
    const dataVolumePrimaryStorageMap = baseResp.dataVolumePrimaryStorages

    let psUuidList = []
    let primaryStoragesType = ''
    if (conditionsMap['dataDiskOfferingUuids']?.length) {
      primaryStoragesType = 'dataDiskOfferingUuids'
    } else if (conditionsMap['dataDiskSizes']?.length) {
      primaryStoragesType = 'dataDiskSizes'
    }

    if (primaryStoragesType !== '') {
      conditionsMap[primaryStoragesType].forEach(item => {
        if (dataVolumePrimaryStorageMap[item] && dataVolumePrimaryStorageMap[item]?.length > 0) {
          psUuidList = psUuidList.concat(dataVolumePrimaryStorageMap[item].map(it => it.uuid))
        }
      })
      conditions.push({
        key: 'uuid',
        op: Op.in,
        values: _.uniq(psUuidList)
      })
    } else {
      conditions.push({
        key: 'uuid',
        op: Op.in,
        values: _.uniq(psUuidList)
      })
    }

    if (conditionsMap['clusterUuid']) {
      conditions.push({
        key: 'cluster.uuid',
        op: Op.eq,
        value: conditionsMap['clusterUuid']
      })
    }

    return conditions
  }

  async getCandidateForCreateVmRootVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)

    const conditions: ICondition[] = [{ key: 'state', op: Op.eq, value: 'Enabled' }]
    const candidateKeys = [
      'imageUuid',
      'l3NetworkUuids',
      'clusterUuid',
      'rootDiskSize',
      'rootDiskOfferingUuid'
    ]
    const candidateParams = _.pick(
      conditionsMap,
      candidateKeys
    ) as GetCandidatePrimaryStoragesForCreatingVmActionParam

    const baseResp = await this.getCandidatePrimaryStoragesForCreatingVmAction.call(candidateParams)
    conditions.push({
      key: 'uuid',
      op: Op.in,
      values: baseResp.rootVolumePrimaryStorages.map(item => item.uuid)
    })

    if (conditionsMap['clusterUuid']) {
      conditions.push({
        key: 'cluster.uuid',
        op: Op.eq,
        value: conditionsMap['clusterUuid']
      })
    }

    return conditions
  }

  // 获取云盘可存储迁移的主存储列表
  async getPrimaryStorageCandidatesForVolumeMigration(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const volumeUuid = conditionsMap['volumeUuid']

    let zqlCondition
    if (volumeUuid) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetPrimaryStorageCandidatesForVolumeMigration',
              output: 'inventories.uuid',
              condition: {
                volumeUuid
              }
            }
          }
        }
      }
    }
    return zqlCondition
  }

  // 获取云主机可存储迁移的主存储列表
  async getCandidateForStorageMigrateVmInstance(extraConditions) {
    const conditions: ICondition[] = []
    const conditionsMap = conditionsToObject(extraConditions)

    const vmInstanceUuid = conditionsMap['vmInstanceUuid']
    const withDataVolumes: boolean = conditionsMap['withDataVolumes'] === 'true'
    const migrateStorageOnly: boolean = conditionsMap['migrateStorageOnly'] === 'true'
    const vmConditions: ICondition[] = [
      {
        key: 'uuid',
        op: Op.eq,
        value: vmInstanceUuid
      }
    ]

    const vmResp = await this.queryVmInstanceAction.call({
      conditions: vmConditions
    })
    const vm = vmResp.inventories[0]
    const condtionMap =
      vm.state === 'Running'
        ? {
            LocalStorage: {
              key: 'type',
              op: Op.notIn,
              values: ['SharedMountPoint']
            },
            SharedBlock: {
              key: 'type',
              op: Op.notIn,
              values: ['SharedMountPoint']
            }
          }
        : {
            NFS: {
              key: 'type',
              op: Op.notIn,
              values: ['LocalStorage', 'SharedBlock', 'Ceph']
            },
            LocalStorage: { key: 'type', op: Op.ne, value: 'NFS' },
            SharedBlock: { key: 'type', op: Op.ne, value: 'NFS' },
            Ceph: { key: 'type', op: Op.ne, value: 'NFS' }
          }
    const { allVolumes } = vm
    const primaryStorageUuidList: string[] = _.uniq(
      allVolumes.map(volume => volume.primaryStorageUuid)
    )
    const primaryStorageResp = await this.queryPrimaryStorageAction.call({
      conditions: [{ key: 'uuid', op: Op.in, values: primaryStorageUuidList }],
      fields: ['uuid', 'type']
    })
    const SET = new Set()
    primaryStorageResp.inventories.forEach(item => {
      if (condtionMap[item.type]) {
        SET.add(condtionMap[item.type])
      }
    })

    const conditionObj = {
      conditions: conditions.concat([...SET]),
      uuidZql: {
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetPrimaryStorageCandidatesForVmMigration',
              output: 'inventories.uuid',
              condition: {
                vmInstanceUuid,
                withDataVolumes,
                migrateStorageOnly
              }
            }
          }
        }
      }
    }
    return conditionObj
  }

  // 获取路由器可存储迁移的主存储列表
  async getCandidateForStorageMigrateVpcRouter(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const vmInstanceUuid = conditionsMap['vmInstanceUuid']

    const conditionObj = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPrimaryStorageCandidatesForVmMigration',
            output: 'inventories.uuid',
            condition: {
              vmInstanceUuid
              // withDataVolumes,
              // migrateStorageOnly
            }
          }
        }
      }
    }
    return conditionObj
  }

  async hasSetTokenCephPrimaryStorage(attachedPsUuidList: string[]) {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceType: 'PrimaryStorageVO',
        resourceUuid: {
          [ZOp.in]: attachedPsUuidList
        },
        tag: {
          [ZOp.like]: 'ceph::thirdPartyPlatform'
        }
      }
    })

    const tagResp = await this.zqlService.call(zql)
    const tagList = _.get(tagResp, ['results', 0, 'inventories'], [])

    return tagList?.length > 0
  }

  // ovf import
  async getOvfAttachablePrimaryStorage(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const baseParams = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: conditionsMap['clusterUuid'],
          Op: Op.eq
        }
      ]
    }
    const baseResp = await this.queryPrimaryStorageAction.call(baseParams)
    const attachedList = baseResp.inventories
    const attachedUuidList = attachedList.map(it => it.uuid)

    const primaryStorageUuidListObj = {
      [ZOp.query]: {
        tableName: 'PrimaryStorage.uuid',
        condition: {
          uuid: {
            [ZOp.in]: attachedUuidList
          }
        }
      }
    }
    return {
      uuid: { [ZOp.in]: primaryStorageUuidListObj }
    }
  }
  // 获取集群可加载的主存储
  async getClusterAttachablePrimaryStorage(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const baseParams = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: conditionsMap['clusterUuid'],
          Op: Op.eq
        }
      ]
    }

    const baseResp = await this.queryPrimaryStorageAction.call(baseParams)
    const attachedPsList = baseResp.inventories
    const attachedPsUuidList = attachedPsList.map(it => it.uuid)

    const psTypes = getAvailablePsTypes(attachedPsList)

    // 过滤出 Addon 类型的主存储，因为Addon对应多种主存储，比如 vhost, zbs, 需要用额外的条件去查
    const addonTypes = _.without(psTypes, ...AddonPs)

    if (addonTypes.length) {
      psTypes.push('Addon')
    }

    const primaryStorageUuidListObj = {
      [ZOp.query]: {
        tableName: 'PrimaryStorage.uuid',
        condition: {
          uuid: {
            [ZOp.notIn]: attachedPsUuidList
          },
          type: {
            [ZOp.in]: psTypes as string[]
          }
          // todo 后续后端需要支持的参数，这里预留个口子
          // defaultProtocol: {
          //   [ZOp.in]: addonTypes as string[]
          // }
        }
      }
    }

    const zqlCondition: any = {
      uuid: { [ZOp.in]: primaryStorageUuidListObj }
    }

    //普通集群 不加载 输入了token的ceph类型主存储
    const hypervisorType = conditionsMap['hypervisorType']
    if (hypervisorType === 'KVM') {
      return {
        [ZOp.and]: [
          zqlCondition,
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'SystemTag',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'PrimaryStorageVO',
                    tag: {
                      [ZOp.like]: 'ceph::thirdPartyPlatform'
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }

    //弹性裸金属集群加载主存储时(若已加载shareblock主存储)：过滤掉有token的ceph
    const hasShareblock = attachedPsList?.some(({ type }) => type === 'SharedBlock')
    //弹性裸金属集群加载主存储时(若已加载有token的ceph主存储)：过滤掉shareblock主存储
    const hasCephPs = await this.hasSetTokenCephPrimaryStorage(attachedPsUuidList)

    if (hasCephPs || hasShareblock) {
      if (hasCephPs) {
        zqlCondition['type'] = {
          [ZOp.notIn]: ['SharedBlock']
        }
      }
      if (hasShareblock) {
        // 不加载 输入了token的ceph类型主存储
        zqlCondition['uuid'] = {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SystemTag',
              fields: ['resourceUuid'],
              condition: {
                resourceType: 'PrimaryStorageVO',
                tag: {
                  [ZOp.like]: 'ceph::thirdPartyPlatform'
                }
              }
            }
          }
        }
      }
    }

    return zqlCondition
  }

  getReservedCapacity(uuid) {
    return this.psReservedCapacityDataLoader.load(uuid)
  }

  _getReservedCapacity = async (uuids: string[]) => {
    // 获取资源配置，最后全局配置。资源没有设置的话以全局配置为准。
    const configZql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        fields: 'value',
        condition: {
          name: 'reservedCapacity',
          category: 'primaryStorage'
        }
      },
      {
        tableName: 'ResourceConfig',
        fields: ['value', 'resourceUuid'],
        condition: {
          resourceType: 'PrimaryStorageVO',
          resourceUuid: {
            [ZOp.in]: uuids
          },
          name: 'reservedCapacity',
          category: 'primaryStorage'
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

  getReservedPhysicalCapacity(uuid: string, totalPhysicalCapacity: number) {
    this.psTotalPhysicalCapacityMap[uuid] = {
      uuid,
      totalPhysicalCapacity
    }
    return this.psReservedPhysicalCapacityDataLoader.load(uuid)
  }

  _getReservedPhysicalCapacity = async (uuids: string[]) => {
    let reservedPhysicalCapacity = 0
    const zql = ZQL.stringify({
      tableName: 'GlobalConfig',
      fields: 'value',
      condition: {
        name: 'threshold.primaryStorage.physicalCapacity',
        category: 'mevoco'
      }
    })

    const { results } = await this.zqlService.call(zql)

    const thresholdPrimaryStoragePhysicalCapacity: number = _.get(
      results,
      ['0', 'inventories', '0', 'value'],
      0
    )

    return uuids.map(psUuid => {
      const psTotalPhysicalCapacity = _.get(this.psTotalPhysicalCapacityMap, psUuid, {})

      reservedPhysicalCapacity =
        psTotalPhysicalCapacity.totalPhysicalCapacity *
        (1 - thresholdPrimaryStoragePhysicalCapacity)

      return reservedPhysicalCapacity
    })
  }

  getCluster(uuid, primaryStorage) {
    this.psClusterUuidsMap[uuid] = _.get(primaryStorage, 'attachedClusterUuids', [])

    return this.clusterDataLoader.load(uuid)
  }

  _getCluster = async (uuids = []) => {
    const clusterZql = {
      tableName: 'Cluster',
      fields: ['name', 'uuid'],
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorageClusterRef',
              fields: ['clusterUuid'],
              condition: {
                primaryStorageUuid: {
                  [ZOp.in]: uuids
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(clusterZql)
    const { results } = await this.zqlService.call(zql)
    const clusterList = _.get(results, ['0', 'inventories'], [])

    const clusterMap = _.reduce(
      clusterList,
      (obj, cluster) => {
        obj[cluster?.uuid] = cluster
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      const attachedClusterUuids = _.get(this.psClusterUuidsMap, uuid, [])

      if (attachedClusterUuids?.length > 0) {
        return _.compact(
          _.map(attachedClusterUuids, clusterUuid => _.get(clusterMap, clusterUuid, null))
        )
      } else {
        return []
      }
    })
  }

  getSystemTag(uuid) {
    return this.systemTagDataLoader.load(uuid)
  }

  _getSystemTag = async (uuids = []) => {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceType: 'PrimaryStorageVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        [ZOp.or]: [
          {
            tag: {
              [ZOp.like]: 'ceph'
            }
          },
          {
            tag: {
              [ZOp.like]: 'primaryStorageVolumeProvisioningStrategy'
            }
          },
          {
            tag: {
              [ZOp.like]: 'primaryStorage::gateway::cidr'
            }
          },
          {
            tag: {
              [ZOp.like]: 'ceph::default::rootVolumePoolName'
            }
          },
          // nfs
          {
            tag: {
              [ZOp.like]: 'nfs::mount::options::'
            }
          },
          //ceph 访问令牌
          {
            tag: {
              [ZOp.like]: 'ceph::thirdPartyPlatform'
            }
          },
          {
            tag: {
              [ZOp.like]: 'primaryStorage::vendor'
            }
          },
          // ceph
          {
            tag: {
              [ZOp.like]: 'primaryStorage::migrate::network::cidr'
            }
          }
        ]
      }
    })

    const tagResp = await this.zqlService.call(zql)
    const tagList = _.get(tagResp, ['results', 0, 'inventories'], [])

    return uuids.map(uuid => {
      const _tagList = tagList.filter(tag => tag.resourceUuid === uuid)

      const cephToken = _tagList
        ?.find(it => it?.tag?.indexOf('ceph::thirdPartyPlatform') > -1)
        ?.tag?.split('::')?.[2]

      const coldMigrateNetwork = _tagList
        ?.find(it => it?.tag?.indexOf('primaryStorage::migrate::network::cidr::') > -1)
        ?.tag?.split('cidr::')[1]
      const cephVendor = _tagList
        ?.find(it => it?.tag?.indexOf('primaryStorage::vendor') > -1)
        ?.tag?.split('::')?.[2]

      // Cephx
      const findCephNocephx = _tagList.find(it => it.tag.indexOf('ceph::nocephx') > -1)
      const nocephx = _.get(findCephNocephx?.tag?.split('::'), [1], null) === 'nocephx'

      const findThinProvisioning = _tagList.find(
        it => it.tag.indexOf('primaryStorageVolumeProvisioningStrategy::ThinProvisioning') > -1
      )
      let thinProvision = false
      let thinProvisionUuid = null
      if (findThinProvisioning) {
        thinProvisionUuid = findThinProvisioning.uuid
        thinProvision = true
      }

      const findGatewayCidr = _tagList.find(
        it => it.tag.indexOf('primaryStorage::gateway::cidr::') > -1
      )
      const gatewayCidr = _.get(findGatewayCidr?.tag?.split('::'), [3], null)

      // 根云盘池名
      const findRootVolumePoolName = _tagList.find(
        it => it.tag.indexOf('ceph::default::rootVolumePoolName::') > -1
      )
      const rootVolumePoolName = _.get(findRootVolumePoolName?.tag?.split('::'), [3], null)

      // 数据云盘池名
      const findDataVolumePoolName = _tagList.find(
        it => it.tag.indexOf('ceph::default::dataVolumePoolName::') > -1
      )
      const dataVolumePoolName = _.get(findDataVolumePoolName?.tag?.split('::'), [3], null)

      // 镜像缓存池名
      const findImageCachePoolName = _tagList.find(
        it => it.tag.indexOf('ceph::default::imageCachePoolName::') > -1
      )
      const imageCachePoolName = _.get(findImageCachePoolName?.tag?.split('::'), [3], null)

      // nfs 挂载参数
      const findnfsMountOptions = _tagList.find(it => it.tag.indexOf('nfs::mount::options::') > -1)
      const nfsMountOptions = _.get(findnfsMountOptions?.tag?.split('::'), [3], null)

      return {
        nocephx,
        thinProvision,
        thinProvisionUuid,
        gatewayCidr,
        rootVolumePoolName,
        dataVolumePoolName,
        imageCachePoolName,
        nfsMountOptions,
        cephToken,
        coldMigrateNetwork,
        cephVendor
      }
    })
  }

  // 获取集群关联的云主机、云盘
  async getCount(
    primaryStorageUuid: string,
    entity: 'vm-instances' | 'volumes' | 'baremetal2-instances'
  ): Promise<number> {
    let url = ''
    switch (entity) {
      case 'volumes':
        url = `volumes?count=true&q=primaryStorage.uuid=${primaryStorageUuid}&q=type=Data`
        break
      case 'vm-instances':
        url = `vm-instances?count=true&q=allVolumes.primaryStorageUuid=${primaryStorageUuid}&q=type=UserVm`
        break
      case 'baremetal2-instances':
        url = `baremetal2/bm-instances?count=true&q=allVolumes.primaryStorageUuid=${primaryStorageUuid}`
        break
      default:
        break
    }
    let result
    try {
      result = await this.zsHttpService.get(url)
    } catch (error) {
      console.error(error)
      return 0
    }
    const { total = 0 } = result?.data
    return total
  }

  async getExpired(primaryStorage: PrimaryStorageVO): Promise<Expired> {
    const { uuid, type } = primaryStorage
    if (type !== 'Ceph') {
      return null
    }
    const resp = await this.getPrimaryStorageLicenseInfoAction.call({ uuid })
    if (!resp || !resp.expireTime) {
      return null
    }
    const { expireTime } = resp
    const now = new Date().getTime()
    const result: { isExpired: boolean; dayDifference?: number } = {
      isExpired: false
    }
    result.isExpired = new Date(expireTime).getTime() - now <= 0
    if (!result.isExpired) {
      result.dayDifference = Math.max(
        Math.ceil((new Date(expireTime).getTime() - now) / (1000 * 60 * 60 * 24)),
        1
      )
    }
    return result
  }

  // 查询主存储上的垃圾数据
  async getTrashOnPrimaryStorage(uuid: string) {
    const { inventories: list = [] } = await this.getTrashOnPrimaryStorageAction.call({ uuid })
    return {
      list
    }
  }

  // 主存储就绪状态统计
  async getSummary(status, _condtions = []) {
    const condtions = _.cloneDeep(_condtions)
    switch (status) {
      case 'connected':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: PrimaryStorageStatus.Connected
        })
        break
      case 'connecting':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: PrimaryStorageStatus.Connecting
        })
        break
      case 'disconnected':
        condtions.push({
          key: 'status',
          op: Op.eq,
          value: PrimaryStorageStatus.Disconnected
        })
        break
      case 'other':
        condtions.push({
          key: 'status',
          op: Op.notIn,
          values: [PrimaryStorageStatus.Connected, PrimaryStorageStatus.Disconnected]
        })
        break
      case 'total':
        break
      default:
        break
    }

    const zqlObject = {
      tableName: 'primaryStorage',
      condition: QueryConditionTranslator.translate(condtions),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results = [] } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }

  // 查询主存储相关资源数量
  async getPrimaryStorageRelatedSummary(uuid: string): Promise<PrimaryStorageRelatedSummary> {
    const volumeZql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'Volume',
      condition: {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'BlockVolume',
              fields: ['uuid']
            }
          }
        },
        'primaryStorage.uuid': uuid,
        type: 'Data',
        status: {
          [ZOp.ne]: 'Deleted'
        }
      }
    })

    const volumeResult = await this.zqlService.call(volumeZql)

    const [
      { total: vmInstance },
      { total: baremetal2Instance },
      // { total: volume },
      { total: blockVolume },
      { total: host },
      { total: cluster },
      { total: baremetal2Cluster },
      { total: sharedBlock },
      { total: vpcRouter }
    ] = await Promise.all([
      this.queryVmInstanceAction.call({
        count: true,
        conditions: [
          {
            key: 'rootVolume.primaryStorage.uuid',
            value: uuid
          },
          {
            key: 'state',
            value: 'Destroyed',
            op: Op.ne
          },
          {
            key: 'type',
            value: 'UserVm'
          }
        ]
      }),
      this.queryBareMetal2InstanceAction.call({
        count: true,
        conditions: [
          {
            key: 'rootVolume.primaryStorageUuid',
            value: uuid,
            op: Op.eq
          },
          {
            key: 'hypervisorType',
            value: 'baremetal2',
            op: Op.eq
          }
        ]
      }),

      // this.queryVolumeAction.call({
      //   count: true,
      //   conditions: [
      //     {
      //       key: 'primaryStorage.uuid',
      //       value: uuid
      //     },
      //     {
      //       key: 'status',
      //       value: 'Deleted',
      //       op: Op.ne
      //     },
      //     {
      //       key: 'type',
      //       value: 'Data'
      //     }
      //   ]
      // }),
      this.queryXskyBlockVolumeAction.call({
        count: true,
        conditions: [
          {
            key: 'primaryStorageUuid',
            value: uuid
          },
          {
            key: 'type',
            value: 'Data'
          },
          {
            key: 'status',
            value: 'Deleted',
            op: Op.ne
          }
        ]
      }),
      this.queryHostAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.primaryStorage.uuid',
            value: uuid
          }
        ]
      }),
      this.queryClusterAction.call({
        count: true,
        conditions: [
          {
            key: 'primaryStorage.uuid',
            value: uuid
          },
          {
            key: 'hypervisorType',
            value: 'baremetal2',
            op: Op.ne
          }
        ]
      }),
      this.queryClusterAction.call({
        count: true,
        conditions: [
          {
            key: 'primaryStorage.uuid',
            value: uuid
          },
          {
            key: 'hypervisorType',
            value: 'baremetal2',
            op: Op.eq
          }
        ]
      }),
      this.querySharedBlockAction.call({
        count: true,
        conditions: [
          {
            key: 'sharedBlockGroup.uuid',
            value: uuid
          }
        ]
      }),
      this.queryVpcRouterAction.call({
        count: true,
        conditions: [
          {
            key: 'rootVolume.primaryStorageUuid',
            value: uuid
          }
        ]
      })
    ])
    return {
      vmInstance,
      baremetal2Instance,
      volume: volumeResult?.results?.[0]?.total ?? 0,
      blockVolume,
      host,
      cluster,
      baremetal2Cluster,
      sharedBlock,
      vpcRouter
    }
  }

  async getPrimaryStorageRelatedClusterSummary(param) {
    const { primaryStorageUuids: psUuids = [], clusterUuids = [] } = param
    const vmCountZql = {
      tableName: 'vmInstance',
      action: ZQLAction.COUNT,
      condition: {
        type: {
          [ZOp.ne]: 'ApplianceVm'
        },
        clusterUuid: {
          [ZOp.in]: clusterUuids
        },
        'rootVolume.primaryStorageUuid': {
          [ZOp.in]: psUuids
        }
      }
    }
    const vmOnNetworkCountZql = {
      tableName: 'vmInstance',
      action: ZQLAction.COUNT,
      condition: {
        type: 'UserVm',
        'vmNics.l3NetworkUuid': {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l3network',
              fields: ['uuid'],
              condition: {
                category: 'Private',
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'vmNic',
                      fields: ['l3NetworkUuid'],
                      condition: {
                        vmInstanceUuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'vmInstance',
                              fields: ['uuid'],
                              condition: {
                                type: 'ApplianceVm',
                                clusterUuid: {
                                  [ZOp.in]: clusterUuids
                                },
                                'rootVolume.primaryStorageUuid': {
                                  [ZOp.in]: psUuids
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
      }
    }
    const vpcVrouterCountZql = {
      tableName: 'virtualRouterVm',
      action: ZQLAction.COUNT,
      condition: {
        applianceVmType: {
          [ZOp.in]: ['vpcvrouter', 'vrouter']
        },
        clusterUuid: {
          [ZOp.in]: clusterUuids
        },
        'rootVolume.primaryStorageUuid': {
          [ZOp.in]: psUuids
        }
      }
    }
    const volumeCountZql = {
      tableName: 'volume',
      action: ZQLAction.COUNT,
      condition: {
        type: 'Data',
        primaryStorageUuid: {
          [ZOp.in]: psUuids
        },
        'vmInstance.clusterUuid': {
          [ZOp.in]: clusterUuids
        }
      }
    }
    const batchUserCountZql = [vmCountZql, vmOnNetworkCountZql, vpcVrouterCountZql, volumeCountZql]
    const countResp = await this.zqlService.call(ZQL.multStringify(batchUserCountZql))
    const vmCount = _.get(countResp?.results, [0, 'total'], 0)
    const vmOnNetworkCount = _.get(countResp?.results, [1, 'total'], 0)
    const vpcVrouterCount = _.get(countResp?.results, [2, 'total'], 0)
    const volumeCount = _.get(countResp?.results, [3, 'total'], 0)
    return {
      vmCount,
      vmOnNetworkCount,
      vpcVrouterCount,
      volumeCount
    }
  }

  async getPrimaryStorageRelatedBaremetal2ClusterSummary(param) {
    const { primaryStorageUuids: psUuids = [], clusterUuids = [] } = param
    const baremetal2InstanceCountZql = {
      tableName: 'BareMetal2Instance',
      action: ZQLAction.COUNT,
      condition: {
        clusterUuid: {
          [ZOp.in]: clusterUuids
        },
        'rootVolume.primaryStorageUuid': {
          [ZOp.in]: psUuids
        }
      }
    }
    const volumeCountZql = {
      tableName: 'volume',
      action: ZQLAction.COUNT,
      condition: {
        type: 'Data',
        primaryStorageUuid: {
          [ZOp.in]: psUuids
        },
        'vmInstance.clusterUuid': {
          [ZOp.in]: clusterUuids
        }
      }
    }
    const batchUserCountZql = [baremetal2InstanceCountZql, volumeCountZql]
    const countResp = await this.zqlService.call(ZQL.multStringify(batchUserCountZql))
    const baremetal2InstanceCount = _.get(countResp?.results, [0, 'total'], 0)
    const volumeCount = _.get(countResp?.results, [1, 'total'], 0)
    return {
      baremetal2InstanceCount,
      volumeCount
    }
  }
  // 获取block主存储metadata
  async getBlockMetadata(param) {
    const { inventories = [] } = await this.getBlockPrimaryStorageMetadataAction.call(param)
    const { accessZones, storagePools } = JSON.parse(inventories?.[0]?.metadata)
    return {
      accessZones: JSON.stringify(accessZones),
      storagePools: JSON.stringify(storagePools)
    }
  }
  //获取block主存储设备信息
  async getBlockDeviceInfo(uuid) {
    const zql = {
      tableName: 'PrimaryStorage',
      condition: {
        uuid: {
          [ZOp.eq]: uuid
        }
      }
    }

    const resultResp = await this.zqlService.call(ZQL.multStringify([zql]))
    const { inventories } = resultResp.results?.[0]
    const metadata = JSON.parse(inventories?.[0]?.metadata)
    return {
      ...metadata,
      storagePool: metadata?.storagePools?.[0]?.name
    }
  }
  async getPrimaryStorageRelatedResourceCounts(
    uuid: string
  ): Promise<PrimaryStorageRelatedResourceCounts> {
    const zql = ZQL.multStringify([
      {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          'rootVolume.primaryStorage.uuid': uuid,
          uuid: {
            [ZOp.notIn]: {
              [ZOp.and]: [
                {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.and]: {
                        [ZOp.query]: {
                          tableName: 'templatedVminstance',
                          fields: ['uuid']
                        }
                      }
                    }
                  }
                },
                {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.and]: {
                        [ZOp.query]: {
                          tableName: 'templatedVminstanceCache',
                          fields: ['cacheVmInstanceUuid']
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          status: {
            [ZOp.ne]: 'Deleted'
          },
          'primaryStorage.uuid': uuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Host',
        condition: {
          'cluster.primaryStorage.uuid': uuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Cluster',
        condition: {
          'primaryStorage.uuid': uuid,
          hypervisorType: {
            [ZOp.ne]: 'baremetal2'
          }
        }
      }
    ])
    const resp = await this.zqlService.call(zql)
    const vm = resp?.results?.[0]?.total ?? 0
    const hardDisk = resp?.results?.[1]?.total ?? 0
    const host = resp?.results?.[2]?.total ?? 0
    const cluster = resp?.results?.[3]?.total ?? 0
    return {
      vm,
      hardDisk,
      host,
      cluster
    }
  }
}
