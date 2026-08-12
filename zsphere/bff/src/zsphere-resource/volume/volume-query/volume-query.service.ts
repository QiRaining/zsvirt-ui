import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'
import { get } from 'lodash'

import {
  conditionsToObject,
  extractAndRemoveExtraCondition,
  Condition as ICondition,
  Op,
  QueryParam
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetMemorySnapshotGroupReferenceAction } from '@/api/zstack/GetMemorySnapshotGroupReferenceAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { GetVmAttachableDataVolumeAction } from '@/api/zstack/GetVmAttachableDataVolumeAction'
import { GetVolumeCapabilitiesAction } from '@/api/zstack/GetVolumeCapabilitiesAction'
import { GetVolumeIoThreadPinAction } from '@/api/zstack/GetVolumeIoThreadPinAction'
import { GetVolumeQosAction } from '@/api/zstack/GetVolumeQosAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { VolumeProvisioningStrategy } from '@/common/enum'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  Volume as IVolume,
  VolumeBackupTaskType,
  VolumeQueryType,
  WithMemoryByResourceType
} from '../model/volume.model'

@Injectable()
export class VolumeQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() getVolumeCapabilitiesAction: GetVolumeCapabilitiesAction
  @Inject() getVmAttachableDataVolumeAction: GetVmAttachableDataVolumeAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() getVolumeQosAction: GetVolumeQosAction
  @Inject() getVolumeIoThreadPinAction: GetVolumeIoThreadPinAction
  @Inject()
  getMemorySnapshotGroupReferenceAction: GetMemorySnapshotGroupReferenceAction

  private primaryStorageDataLoader

  private vmInstanceDataLoader
  private templatedVmInstanceDataLoader
  private templatedVmInstanceCacheDataLoader
  private lastvmInstanceDataLoader
  private lastAttachDateDataLoader
  private systemTagDataLoader
  private volumeQosDataLoader

  private volumeCapabilitiesDataLoader
  private volumeBackupStatusDataLoader
  private volumeRelatedResourceCountLoader
  private volumeCdpTaskStatusDataLoader
  private volumeBackupTaskTypeDataLoader
  private isHaveMemorySnapshotDataLoader
  private volumePrimaryStorageMap: any = {}
  private volumeQosMap: any = {}
  private lastAttachDateVolumeVmInstanceUuidMap: any = {}
  private volumeVmInstanceUuidMap: any = {}
  private installPathMap: Record<
    string,
    {
      uuid: string
      installPath: string
    }
  > = {}
  private backupTaskStatusDataloader
  private volumeResourceConfigDataLoader
  private haveSnapshotDataLoader

  constructor() {
    this.primaryStorageDataLoader = new DataLoader(this._getPrimaryStorage)
    this.isHaveMemorySnapshotDataLoader = new DataLoader(this._judgeIsHaveMemorySnapShot)
    this.vmInstanceDataLoader = new DataLoader(this._getVmInstance)
    this.templatedVmInstanceDataLoader = new DataLoader(this._getTemplatedVmInstance)
    this.templatedVmInstanceCacheDataLoader = new DataLoader(this._getTemplatedVmInstanceCache)
    this.lastvmInstanceDataLoader = new DataLoader(this._getLastVmInstance)
    this.lastAttachDateDataLoader = new DataLoader(this._getLastAttachDate)
    this.systemTagDataLoader = new DataLoader(this._getVolumeSystemTag)
    this.volumeQosDataLoader = new DataLoader(this._getVolumeQos)

    this.volumeCapabilitiesDataLoader = new DataLoader(this._getCapabilities)
    this.volumeBackupStatusDataLoader = new DataLoader(this._getBackupStatus)
    this.volumeRelatedResourceCountLoader = new DataLoader(this._getRelatedResourceCount)
    this.volumeCdpTaskStatusDataLoader = new DataLoader(this._getCdpTaskStatus)
    this.volumeBackupTaskTypeDataLoader = new DataLoader(this._getBackupTaskType)
    this.backupTaskStatusDataloader = new DataLoader(this._backupTaskStatus)
    this.volumeResourceConfigDataLoader = new DataLoader(this._getResourceConfig)
    this.haveSnapshotDataLoader = new DataLoader(this._judgeHaveSnapShot)
  }

  async queryList(params: IQueryAction) {
    const { type = VolumeQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case VolumeQueryType.NORMAL:
        break

      case VolumeQueryType.GET_VM_ATTACHABLE_DATA_VOLUME:
        _extrazqlConditions = await this.getVmAttachableDataVolume(params.extraConditions)
        break

      case VolumeQueryType.GET_VOLUME_BY_ACCOUNT:
        _extrazqlConditions = await this.getVolumeByAccount(params.extraConditions)
        break

      case VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID:
        _extrazqlConditions = await this.getVolumeByVmInstanceUuid(params.extraConditions)
        break
      case VolumeQueryType.GetVolumeByVMAndHostForEditVM:
        _extrazqlConditions = await this.getVolumeByVmInstanceUuid(params.extraConditions)
        break

      case VolumeQueryType.GetVolumeBySchedulerJobGroup:
        _extrazqlConditions = await this.getVolumeBySchedulerJobGroup(params.extraConditions)
        break
      case VolumeQueryType.GetBackupJobAndCdpTaskAttachableVolume:
        _extrazqlConditions = await this.getBackupJobAndCdpTaskAttachableVolume()
        break
      case VolumeQueryType.GetCandidatesVolumeForCreateVolumeSnapshot:
        _extrazqlConditions = await this.getCandidatesVolumeForCreateVolumeSnapshot()
        break
      case VolumeQueryType.GetCandidatesVolumeForCreateVolumeSnapshotJob:
        _extrazqlConditions = await this.getCandidatesVolumeForCreateVolumeSnapshotJob()
        break
      case VolumeQueryType.GetTagAttachableVolume:
        _extrazqlConditions = await this.getTagAttachableVolume(params.extraConditions)
      // zsv
      case VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT:
        _extrazqlConditions = await this.getVolumeByNotSnapshot()
        break
      case VolumeQueryType.GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME:
        _extrazqlConditions = await this.getVmAttachableNotSnapshotDataVolume(
          params.extraConditions
        )
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getVolumeList(params, zqlCondition)

    return _resultResp
  }

  async getVmAndBareMetal2InstanceSummary(param: IQueryAction) {
    const { extraConditions } = param
    const conditionsMap = conditionsToObject(extraConditions)
    const isCreateForm = conditionsMap['selectListType'] === 'CreateForm'
    const isAttachForm = conditionsMap['selectListType'] === 'AttachForm'
    const isAttachedInstance = conditionsMap['selectListType'] === 'AttachedInstance'

    let vmCondition: any
    let bm2vmCondtion: any
    if (isCreateForm) {
      //创建云盘选择 云主机和弹性裸金属实例
      vmCondition = {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          hypervisorType: 'KVM'
        }
      }

      bm2vmCondtion = {
        action: ZQLAction.COUNT,
        tableName: 'BareMetal2Instance',
        condition: {
          type: 'baremetal2',
          hypervisorType: 'baremetal2',
          status: 'Connected'
        }
      }
    }

    if (isAttachForm) {
      const candidateKeys = ['volumeUuid', 'volumeUuidList']
      const params = _.pick(conditionsMap, candidateKeys) as {
        volumeUuid: string
        volumeUuidList: string[]
      }
      // 选单个volume
      const zqlCondition = {
        uuid: {
          [ZOp.in]: `getapi(api='GetDataVolumeAttachableVm',output='inventories.uuid',volumeUuid='${params?.volumeUuid}')`
        }
      }
      // 选多个volume
      const _zqlCondition = {
        [ZOp.and]: params?.volumeUuidList?.map(volumeUuid => ({
          uuid: {
            [ZOp.in]: `getapi(api='GetDataVolumeAttachableVm',output='inventories.uuid',volumeUuid='${volumeUuid}')`
          }
        }))
      }

      const condition = params?.volumeUuid ? zqlCondition : _zqlCondition

      vmCondition = {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: [
          {
            [ZOp.and]: [
              {
                type: 'UserVm'
              },
              {
                state: {
                  [ZOp.ne]: 'Destroyed'
                }
              },
              {
                hypervisorType: 'KVM'
              },
              {
                condition
              }
            ]
          }
        ]
      }

      bm2vmCondtion = {
        action: ZQLAction.COUNT,
        tableName: 'BareMetal2Instance',
        condition: [
          {
            [ZOp.and]: [
              {
                type: 'baremetal2'
              },
              {
                state: {
                  [ZOp.ne]: 'Destroyed'
                }
              },
              {
                status: 'Connected'
              },
              {
                condition
              }
            ]
          }
        ]
      }
    }

    if (isAttachedInstance) {
      // 共享云盘 已加载的vm和bm2
      vmCondition = {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  volumeUuid: conditionsMap['volumeUuid']
                }
              }
            }
          },
          type: 'UserVm',
          hypervisorType: 'KVM'
        }
      }

      bm2vmCondtion = {
        action: ZQLAction.COUNT,
        tableName: 'BareMetal2Instance',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  volumeUuid: conditionsMap['volumeUuid']
                }
              }
            }
          },
          type: 'baremetal2',
          hypervisorType: 'baremetal2'
        }
      }
    }

    const zqlObjectList: ZqlObject[] = [
      QueryConditionTranslator.mergeQueryAction(param, vmCondition),
      QueryConditionTranslator.mergeQueryAction(param, bm2vmCondtion)
    ]

    const zqls = ZQL.multStringify(zqlObjectList)
    const { results } = await this.zqlService.call(zqls)

    const vmTotal = results?.[0]?.total ?? 0
    const bareMetal2InstanceTotal = results?.[1]?.total ?? 0

    return {
      vmTotal,
      bareMetal2InstanceTotal
    }
  }

  async getVolumeList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'Volume',
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
    const volumes = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: volumes,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'vmInstance.name',
      'vmInstanceUuid',
      'vmInstance.uuid',
      'lastVmInstanceUuid',
      'ownerName',
      '__BackupTaskType__',
      '__shareable__',
      '__attachedVm__',

      '__tagUuid__'
    ])

    const specicalCondition = []

    //需要与blockVolume进行资源隔离
    //query BlockVolume.uuid
    const filterBlockVolumeZqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'BlockVolume',
            fields: ['uuid']
          }
        }
      }
    }

    specicalCondition.push(filterBlockVolumeZqlCondition)

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'VolumeVO')
      )
    }

    if (_extraConditionMap['__BackupTaskType__']) {
      const typeList = _extraConditionMap['__BackupTaskType__']?.values || [
        _extraConditionMap['__BackupTaskType__'].value
      ]

      // 仅仅Volume 有备份任务
      const hasBackupTask: boolean = _.includes(typeList, 'BackupJob')
      // 特指Vm 有CDP任务或者备份任务
      const hasCdpAndBackupTask: boolean = _.includes(typeList, 'OtherTasks')
      const hasNone: boolean = _.includes(typeList, '__None__')

      const arrayLength = _.get(
        _.compact([hasCdpAndBackupTask, hasBackupTask, hasNone]),
        'length',
        0
      )

      if (arrayLength === 0 || arrayLength === 3) {
      } else if (arrayLength === 1 || arrayLength === 2) {
        if (arrayLength === 1) {
          if (hasBackupTask) {
            // 纯粹的云盘备份任务。
            specicalCondition.push({
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJob',
                    fields: ['targetResourceUuid'],
                    condition: {
                      jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                    }
                  }
                }
              }
            })
          }

          if (hasCdpAndBackupTask) {
            specicalCondition.push({
              [ZOp.or]: [
                {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'CdpTaskResourceRef',
                        fields: ['resourceUuid'],
                        condition: {
                          resourceType: 'VmInstanceVO'
                        }
                      }
                    }
                  }
                },
                {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'Volume',
                        fields: ['vmInstanceUuid'],
                        condition: {
                          uuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'SchedulerJob',
                                fields: ['targetResourceUuid'],
                                condition: {
                                  jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
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
              uuid: {
                // 云盘既有云盘备份任务，其对应的云主机又有整机备份，那么认为其为云盘备份。
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJob',
                    fields: ['targetResourceUuid'],
                    condition: {
                      jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                    }
                  }
                }
              }
            })
          }

          if (hasNone) {
            specicalCondition.push({
              [ZOp.or]: [
                {
                  vmInstanceUuid: {
                    // 没有挂载云主机的云盘不考虑。
                    [ZOp.is]: null
                  }
                },
                {
                  [ZOp.and]: [
                    {
                      vmInstanceUuid: {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'CdpTaskResourceRef',
                            fields: ['resourceUuid'],
                            condition: {
                              resourceType: 'VmInstanceVO'
                            }
                          }
                        }
                      }
                    },
                    {
                      vmInstanceUuid: {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'Volume',
                            fields: ['vmInstanceUuid'],
                            condition: {
                              uuid: {
                                [ZOp.in]: {
                                  [ZOp.query]: {
                                    tableName: 'SchedulerJob',
                                    fields: ['targetResourceUuid'],
                                    condition: {
                                      jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
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
              ],
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJob',
                    fields: ['targetResourceUuid'],
                    condition: {
                      jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                    }
                  }
                }
              }
            })
          }
        }

        if (arrayLength === 2) {
          // 这里zql有点奇怪，用and 不生效，所以单独写。
          if (!hasBackupTask) {
            // 没有云盘备份任务的云盘
            specicalCondition.push({
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJob',
                    fields: ['targetResourceUuid'],
                    condition: {
                      jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                    }
                  }
                }
              }
            })
          }

          if (!hasCdpAndBackupTask) {
            specicalCondition.push({
              [ZOp.or]: [
                {
                  vmInstanceUuid: {
                    // 没有挂载云主机的云盘不考虑。
                    [ZOp.is]: null
                  }
                },
                {
                  [ZOp.and]: [
                    {
                      vmInstanceUuid: {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'CdpTaskResourceRef',
                            fields: ['resourceUuid'],
                            condition: {
                              resourceType: 'VmInstanceVO'
                            }
                          }
                        }
                      }
                    },
                    {
                      vmInstanceUuid: {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'Volume',
                            fields: ['vmInstanceUuid'],
                            condition: {
                              uuid: {
                                [ZOp.in]: {
                                  [ZOp.query]: {
                                    tableName: 'SchedulerJob',
                                    fields: ['targetResourceUuid'],
                                    condition: {
                                      jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
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
              ]
            })
          }

          if (!hasNone) {
            specicalCondition.push({
              [ZOp.or]: [
                {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJob',
                        fields: ['targetResourceUuid'],
                        condition: {
                          jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                        }
                      }
                    }
                  }
                },
                {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'CdpTaskResourceRef',
                        fields: ['resourceUuid'],
                        condition: {
                          resourceType: 'VmInstanceVO'
                        }
                      }
                    }
                  }
                },
                {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'Volume',
                        fields: ['vmInstanceUuid'],
                        condition: {
                          uuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'SchedulerJob',
                                fields: ['targetResourceUuid'],
                                condition: {
                                  jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
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
            })
          }
        }
      }
    }

    if (_extraConditionMap['__shareable__']) {
      const isShareable = _.isEqual(_extraConditionMap['__shareable__'].values, ['true'])
      const isNotShareable = _.isEqual(_extraConditionMap['__shareable__'].values, ['false'])
      const isAll = _.isEqual(
        _extraConditionMap['__shareable__']?.values?.sort(),
        ['true', 'false'].sort()
      )

      if (isShareable) {
        specicalCondition.push({
          isShareable: true
        })
      } else if (isNotShareable) {
        specicalCondition.push({
          isShareable: false
        })
      } else if (isAll) {
      }
    }

    if (_extraConditionMap['__attachedVm__']) {
      const isAttachedVm = _.isEqual(_extraConditionMap['__attachedVm__'].value, 'true')
      const isNotAttachedVm = _.isEqual(_extraConditionMap['__attachedVm__'].value, 'false')

      if (isAttachedVm) {
        specicalCondition.push({
          [ZOp.or]: {
            vmInstanceUuid: {
              [ZOp.not]: null
            },
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'ShareableVolumeVmInstanceRef',
                  fields: ['volumeUuid']
                }
              }
            }
          }
        })
      } else if (isNotAttachedVm) {
        // 对于共享硬盘，允许选择已经在ShareableVolumeVmInstanceRef中已有记录
        specicalCondition.push({
          [ZOp.or]: [
            // 普通硬盘
            {
              [ZOp.and]: {
                vmInstanceUuid: {
                  [ZOp.is]: null
                },
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'ShareableVolumeVmInstanceRef',
                      fields: ['volumeUuid']
                    }
                  }
                },
                isShareable: false
              }
            },
            // 共享硬盘
            {
              [ZOp.and]: {
                vmInstanceUuid: {
                  [ZOp.is]: null
                },
                isShareable: true
              }
            }
          ]
        })
      }
    }

    if (_extraConditionMap['vmInstance.name']) {
      const vmName = _extraConditionMap['vmInstance.name'].value
      const vmZqlCondition = {
        [ZOp.or]: {
          'vmInstance.name': {
            [ZOp.like]: vmName
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['volumeUuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'VmInstance',
                        fields: ['uuid'],
                        condition: {
                          name: {
                            [ZOp.like]: vmName
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
      specicalCondition.push(vmZqlCondition)
    }

    if (_extraConditionMap['vmInstanceUuid'] || _extraConditionMap['vmInstance.uuid']) {
      const vmInstanceUuid =
        _extraConditionMap['vmInstanceUuid']?.value ??
        _extraConditionMap['vmInstance.uuid']?.value ??
        null
      const isNull = vmInstanceUuid === null || vmInstanceUuid === 'null'
      const vmZqlCondition = {
        [ZOp.or]: {
          vmInstanceUuid: isNull ? { [ZOp.is]: null } : vmInstanceUuid,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['volumeUuid'],
                condition: {
                  vmInstanceUuid: isNull ? { [ZOp.is]: null } : vmInstanceUuid
                }
              }
            }
          }
        }
      }
      specicalCondition.push(vmZqlCondition)
    }

    if (_extraConditionMap['lastVmInstanceUuid']) {
      // 共享云盘vmInstanceUuid 本身就为空。
      // ShareableVolumeVmInstanceRef 里面的数据表示vm和volume有关联。
      const lastVmInstanceUuid = _extraConditionMap['lastVmInstanceUuid']?.value
      const vmZqlCondition = {
        lastVmInstanceUuid: lastVmInstanceUuid,
        vmInstanceUuid: {
          [ZOp.is]: null
        },
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: ['volumeUuid']
            }
          }
        }
      }
      specicalCondition.push(vmZqlCondition)
    }

    if (_extraConditionMap['__tagUuid__']) {
      const tagQueryOp = _extraConditionMap['__tagUuid__'].op
      if (['in', 'notIn'].indexOf(tagQueryOp) !== -1) {
        const tagFilterUuids = _extraConditionMap['__tagUuid__'].values
        if (tagFilterUuids?.filter(t => t === '__null__')?.length === 0) {
          specicalCondition.push({
            __tagUuid__: {
              [ZOp[tagQueryOp]]: {
                [ZOp.query]: {
                  tableName: 'UserTag',
                  fields: ['tagPatternUuid'],
                  condition: {
                    tagPatternUuid: {
                      [ZOp.in]: tagFilterUuids
                    }
                  }
                }
              }
            }
          })
        } else {
          //Null和正常标签
          specicalCondition.push({
            [ZOp.or]: [
              {
                __tagUuid__: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid']
                    }
                  }
                }
              },
              {
                __tagUuid__: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid'],
                      condition: {
                        tagPatternUuid: {
                          [ZOp.in]: tagFilterUuids.filter(t => t !== '__null__')
                        }
                      }
                    }
                  }
                }
              }
            ]
          })
        }
      } else {
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
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

  judgeIsHaveMemorySnapShot(uuid) {
    return this.isHaveMemorySnapshotDataLoader.load(uuid)
  }

  _judgeIsHaveMemorySnapShot = async (uuids: string[]) => {
    const tasks = []

    uuids.map(uuid => {
      tasks.push(
        this.getMemorySnapshotGroupReferenceAction.call({
          resourceUuid: uuid,
          resourceType: 'VolumeVO'
        })
      )
    })

    const results = await Promise.all(tasks)
    return uuids.map(uuid => {
      const resource = results?.find(_hy => _hy.resourceUuid === uuid)
      const result = get(resource, 'inventories[0]', null)
      if (!result) {
        return false
      }
      const volumeNameList = result.volumeSnapshotRefs.map(item => item.volumeType === 'Memory')
      const isHaveMemorySnapshot = volumeNameList.length > 0
      return isHaveMemorySnapshot
    })
  }

  async getBackupJobAndCdpTaskAttachableVolume() {
    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJob',
                fields: ['targetResourceUuid'],
                condition: {
                  schedulerJobGroupUuids: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJobGroup',
                        fields: ['uuid']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['uuid'],
                condition: {
                  [ZOp.or]: [
                    {
                      vmInstanceUuid: {
                        [ZOp.is]: null
                      }
                    },
                    {
                      // 使用参数vmInstanceUuid，表示该云盘已经实例化了。
                      vmInstanceUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'vminstance',
                            fields: ['uuid'],
                            condition: {
                              state: {
                                [ZOp.ne]: 'Running'
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      // 使用参数vmInstanceUuid，表示该云盘已经实例化了。
                      vmInstanceUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'CdpTaskResourceRef',
                            fields: ['resourceUuid'],
                            condition: {
                              resourceType: 'VmInstanceVO'
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
      ]
    }

    return zqlCondition
  }
  async getCandidatesVolumeForCreateVolumeSnapshot() {
    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'Volume',
            fields: ['uuid'],
            condition: {
              vmInstanceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'CdpTaskResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return zqlCondition
  }
  async getCandidatesVolumeForCreateVolumeSnapshotJob() {
    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['uuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'CdpTaskResourceRef',
                        fields: ['resourceUuid'],
                        condition: {
                          resourceType: 'VmInstanceVO'
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
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'volume',
                fields: ['uuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'vmInstance',
                        fields: ['uuid'],
                        condition: {
                          rootVolumeUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'schedulerjob',
                                fields: ['targetResourceUuid'], //vminstance - rootVolumeUuid
                                condition: {
                                  jobClassName:
                                    'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob'
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
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'schedulerjob',
                fields: ['targetResourceUuid'],
                condition: {
                  jobClassName: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob'
                }
              }
            }
          }
        }
      ]
    }
    return zqlCondition
  }

  // GET_VOLUME_BY_NOT_SNAPSHOT
  async getVolumeByNotSnapshot() {
    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'volumeSnapshot',
            fields: ['volumeUuid']
          }
        }
      }
    }
    return zqlCondition
  }

  async getVolumeBySchedulerJobGroup(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['schedulerJobGroupUuids']
    const params = _.pick(conditionsMap, candidateKeys) as {
      schedulerJobGroupUuids: string[] | string
    }
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SchedulerJob',
            fields: ['targetResourceUuid'],
            condition: {
              schedulerJobGroupUuids: {
                [ZOp.in]: _.isString(params.schedulerJobGroupUuids)
                  ? [params.schedulerJobGroupUuids]
                  : params.schedulerJobGroupUuids
              }
            }
          }
        }
      }
    }

    return params?.schedulerJobGroupUuids ? zqlCondition : undefined
  }

  async getTagAttachableVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['tagUuids', 'zoneUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      tagUuids: string[] | string
      zoneUuid: string
    }

    const zqlCondition = {
      type: 'Data',
      status: {
        [Op.ne]: 'Deleted'
      },
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'UserTag',
            fields: ['resourceUuid'],
            condition: {
              resourceType: 'VolumeVO',
              uuid: {
                [ZOp.in]: _.flatten([params.tagUuids])
              }
            }
          }
        }
      },
      [ZOp.and]: [
        {
          [ZOp.or]: [
            {
              format: {
                [Op.ne]: 'vmtx'
              }
            },
            {
              format: {
                [Op.is]: null
              }
            }
          ]
        }
      ]
    }

    if (params.zoneUuid) {
      _.set(
        zqlCondition,
        'and',
        _.get(zqlCondition, 'and', []).concat({
          [ZOp.or]: [
            {
              'primaryStorage.zone.uuid': params.zoneUuid
            },
            {
              status: 'NotInstantiated'
            }
          ]
        })
      )
    }

    return zqlCondition
  }

  // 获取云主机上面的云盘
  async getVolumeByVmInstanceUuid(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const isNull = params?.vmInstanceUuid === null || params?.vmInstanceUuid === 'null'
    const zqlCondition = {
      type: {
        [ZOp.ne]: 'Memory'
      },
      [ZOp.or]: {
        vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid,
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: ['volumeUuid'],
              condition: {
                vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid
              }
            }
          }
        }
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  // 获取云主机可挂载的云盘列表
  async getVmAttachableDataVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    // const zqlCondition = {
    //   uuid: {
    //     [ZOp.in]: `getapi(api='GetVmAttachableDataVolume',output='inventories.uuid',vmInstanceUuid='${params?.vmInstanceUuid}')`
    //   }
    // }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetVmAttachableDataVolume',
            output: 'inventories.uuid',
            condition: {
              vmInstanceUuid: `${params?.vmInstanceUuid}`
            }
          }
        }
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  //zsv
  async getVmAttachableNotSnapshotDataVolume(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const zqlCondition = {
      [ZOp.and]: [
        {
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.and]: {
                  [ZOp.in]: {
                    [ZOp.getapi]: {
                      action: ZQLAction.GET_API,
                      api: 'GetVmAttachableDataVolume',
                      output: 'inventories.uuid',
                      condition: {
                        vmInstanceUuid: `${params?.vmInstanceUuid}`
                      }
                    }
                  },
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'volumeSnapshot',
                      fields: ['volumeUuid']
                    }
                  }
                }
              }
            },
            {
              [ZOp.and]: {
                lastVmInstanceUuid: params?.vmInstanceUuid,
                vmInstanceUuid: {
                  [ZOp.is]: null
                }
              }
            }
          ]
        },
        // 排除已挂载到当前 VM 的共享盘
        {
          [ZOp.or]: [
            {
              isShareable: false
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'ShareableVolumeVmInstanceRef',
                    fields: ['volumeUuid'],
                    condition: {
                      vmInstanceUuid: params?.vmInstanceUuid
                    }
                  }
                }
              }
            }
          ]
        }
      ]
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  async getVolumeByAccount(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['accountUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      accountUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['resourceUuid'],
            condition: {
              resourceType: 'VolumeVO',
              type: 'Own',
              accountUuid: params?.accountUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  getCapabilities(uuid) {
    return this.volumeCapabilitiesDataLoader.load(uuid)
  }

  _getCapabilities = async (uuids: string[]) => {
    const volumeCapabilitieMap = {}
    await Promise.all(
      _.map(uuids, uuid =>
        (uuid =>
          this.getVolumeCapabilitiesAction
            .call({ uuid })
            .then(resp => {
              _.set(
                volumeCapabilitieMap,
                uuid,
                _.get(resp, 'capabilities', {
                  MigrationInCurrentPrimaryStorage: false,
                  MigrationToOtherPrimaryStorage: false
                })
              )
            })
            .catch(e => {
              console.log(e)
              _.set(volumeCapabilitieMap, uuid, {
                MigrationInCurrentPrimaryStorage: false,
                MigrationToOtherPrimaryStorage: false
              })
            }))(uuid)
      )
    )

    return uuids.map(uuid => _.get(volumeCapabilitieMap, uuid))
  }

  getRelatedResourceCount(uuid) {
    return this.volumeRelatedResourceCountLoader.load(uuid)
  }

  _getRelatedResourceCount = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'volumeBackup',
      condition: {
        volumeUuid: {
          [ZOp.in]: _.uniq(uuids)
        },
        status: 'Ready'
      },
      groupBy: 'volumeUuid',
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = _.get(results, ['0', 'inventoryCounts'], [])

    const volumeMap = _.reduce(
      inventoryCounts,
      (obj, it) => {
        const [vo, total = 0] = it
        obj[vo?.volumeUuid] = total || 0
        return obj
      },
      {}
    )

    return uuids.map(uuid => ({ backupData: _.get(volumeMap, uuid, 0) }))
  }

  getBackupStatus(uuid) {
    return this.volumeBackupStatusDataLoader.load(uuid)
  }

  _getBackupStatus = async (uuids: string[]) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'LongJob',
        condition: {
          targetResourceUuid: uuid,
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

  getVmInstance(uuid) {
    return this.vmInstanceDataLoader.load(uuid)
  }

  _getVmInstance = async (uuids: string[]) => {
    const multVmZql = _.map(uuids, uuid => {
      return {
        tableName: 'VmInstance',
        condition: {
          [ZOp.or]: {
            'allVolumes.uuid': uuid,
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'ShareableVolumeVmInstanceRef',
                  fields: ['vmInstanceUuid'],
                  condition: {
                    volumeUuid: uuid
                  }
                }
              }
            }
          },
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstance',
                    fields: ['uuid']
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstanceCache',
                    fields: ['cacheVmInstanceUuid']
                  }
                }
              }
            }
          ]
        },
        namedAs: uuid
      }
    })
    const zql = ZQL.multStringify(multVmZql)
    const { results } = await this.zqlService.call(zql)
    const vmMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'inventories')
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const vmInstanceList = _.get(vmMap, uuid)
      if (vmInstanceList) {
        return vmInstanceList
      } else {
        return []
      }
    })
  }

  getTemplatedVmInstance(uuid) {
    return this.templatedVmInstanceDataLoader.load(uuid)
  }

  _getTemplatedVmInstance = async (uuids: string[]) => {
    const uniqUuids = _.uniq(uuids)
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      condition: {
        [ZOp.or]: {
          'allVolumes.uuid': {
            [ZOp.in]: uniqUuids
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  volumeUuid: {
                    [ZOp.in]: uniqUuids
                  }
                }
              }
            }
          }
        },
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'TemplatedVmInstance',
              fields: ['uuid']
            }
          }
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const vmInstanceMap = new Map()
    list.forEach(item => {
      item.allVolumes.forEach(volume => {
        let vmList = vmInstanceMap.get(volume.uuid)
        if (!vmList) {
          vmList = []
          vmInstanceMap.set(volume.uuid, vmList)
        }
        vmList.push(item)
      })
    })
    return uuids.map(uuid => vmInstanceMap.get(uuid))
  }

  getTemplatedVmInstanceCache(uuid) {
    return this.templatedVmInstanceCacheDataLoader.load(uuid)
  }

  _getTemplatedVmInstanceCache = async (uuids: string[]) => {
    const uniqUuids = _.uniq(uuids)
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      condition: {
        [ZOp.or]: {
          'allVolumes.uuid': {
            [ZOp.in]: uniqUuids
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  volumeUuid: {
                    [ZOp.in]: uniqUuids
                  }
                }
              }
            }
          }
        },
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'TemplatedVmInstanceCache',
              fields: ['cacheVmInstanceUuid']
            }
          }
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const vmInstanceMap = new Map()
    list.forEach(item => {
      item.allVolumes.forEach(volume => {
        let vmList = vmInstanceMap.get(volume.uuid)
        if (!vmList) {
          vmList = []
          vmInstanceMap.set(volume.uuid, vmList)
        }
        vmList.push(item)
      })
    })
    return uuids.map(uuid => vmInstanceMap.get(uuid))
  }

  getLastAttachDate(volume, vmInstanceUuid) {
    this.lastAttachDateVolumeVmInstanceUuidMap[volume?.uuid] = {
      ...volume,
      vmInstanceUuid
    }

    return this.lastAttachDateDataLoader.load(volume?.uuid)
  }

  _getLastAttachDate = async (volumeUuids: string[]) => {
    const vmInstanceUuids = _.uniq(
      _.map(volumeUuids, volumeUuid =>
        _.get(this.lastAttachDateVolumeVmInstanceUuidMap, [volumeUuid, 'vmInstanceUuid'])
      )
    )

    const zqlObject = {
      tableName: 'ShareableVolumeVmInstanceRef',
      fields: ['volumeUuid', 'vmInstanceUuid', 'createDate'],
      condition: {
        volumeUuid: {
          [ZOp.in]: volumeUuids
        },
        vmInstanceUuid: {
          [ZOp.in]: vmInstanceUuids
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const volumeVmRefList = _.get(results, ['0', 'inventories'], [])

    // 一个共享云盘可能挂载了多个VM
    // 一个vm也有可能挂载了多个共享云盘
    const volumeVmRefMap = _.reduce(
      volumeVmRefList,
      (obj, it) => {
        const { vmInstanceUuid, volumeUuid, createDate } = it || {}
        const volume = _.get(this.lastAttachDateVolumeVmInstanceUuidMap, volumeUuid)
        const lastAttachDate = createDate || _.get(volume, 'lastAttachDate')

        const key = `${volumeUuid}-${vmInstanceUuid}`
        obj[key] = {
          lastAttachDate
        }

        return obj
      },
      {}
    )

    return volumeUuids.map(volumeUuid => {
      const volume = _.get(this.lastAttachDateVolumeVmInstanceUuidMap, volumeUuid)
      const vmInstanceUuid = _.get(this.lastAttachDateVolumeVmInstanceUuidMap, [
        volumeUuid,
        'vmInstanceUuid'
      ])
      const key = `${volumeUuid}-${vmInstanceUuid}`
      const lastAttachDate = _.get(volumeVmRefMap, [key, 'lastAttachDate'], volume?.lastAttachDate)

      return lastAttachDate
    })
  }

  getLastVmInstance(uuid) {
    return this.lastvmInstanceDataLoader.load(uuid)
  }

  _getLastVmInstance = async (uuids: string[]) => {
    const lastVmZql = {
      tableName: 'VmInstance',
      condition: {
        lastVmInstanceUuid: {
          [ZOp.in]: uuids
        },
        vmInstanceUuid: {
          [ZOp.is]: null
        }
      }
    }
    const zql = ZQL.stringify(lastVmZql)
    const { results } = await this.zqlService.call(zql)
    const lastVmList = _.get(results, ['0', 'inventories'], [])
    const vmMap = _.reduce(
      lastVmList,
      (obj, it) => {
        obj[it.uuid] = it
        return obj
      },
      {}
    )
    return uuids.map(uuid => _.get(vmMap, uuid, null))
  }

  getPrimaryStorage(uuid, primaryStorageUuid) {
    this.volumePrimaryStorageMap[uuid] = {
      uuid,
      primaryStorageUuid: primaryStorageUuid
    }
    return this.primaryStorageDataLoader.load(uuid)
  }

  _getPrimaryStorage = async (uuids: string[]) => {
    const primaryStorageUuidList: any[] = _.uniq(
      _.compact(
        uuids.map(uuid => _.get(this.volumePrimaryStorageMap, [uuid, 'primaryStorageUuid'], ''))
      )
    )
    const zql = ZQL.stringify({
      tableName: 'PrimaryStorage',
      condition: {
        uuid: {
          [ZOp.in]: primaryStorageUuidList
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const primaryStorages = results?.[0]?.inventories
    const primaryStorageMap = _.reduce(
      primaryStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const primaryStorage = _.get(
        primaryStorageMap,
        _.get(this.volumePrimaryStorageMap, [uuid, 'primaryStorageUuid'], ''),
        undefined
      )
      if (primaryStorage) {
        return primaryStorage
      } else {
        return null
      }
    })
  }

  getSystemTags = async (uuids: string[]) => {
    const params: QueryParam = {
      conditions: [{ key: 'resourceUuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.querySystemTagAction.call(params)
    const systemGroup = _.groupBy(resp.inventories, 'resourceUuid')
    const systemMap = {}
    uuids.forEach(uuid => {
      const tagMap = Object.create({
        VirtioSCSI: false,
        notSupportActualSize: false,
        cephStoragePool: ''
      })

      // 自动分配存储池的情况下，不会自动生成systemTag，需要手动处理
      if (this.installPathMap[uuid]?.installPath) {
        // 后端固定 ceph://poolName/xxx 格式,使用正则切割一下
        const matches = this.installPathMap[uuid].installPath.match(/ceph:\/\/([^/]+)/)
        if (matches && matches[1]) {
          tagMap.cephStoragePool = matches[1]
        }
      }

      _.forEach(_.get(systemGroup, uuid, []), item => {
        const tag = item.tag
        if (tag.indexOf('volumeAttributeUserConfig') > -1) {
          tagMap['volumeAttributeUserConfig'] = tag.split('::')[1]
        }
        if (tag.indexOf('kvm::volume::') > -1) {
          tagMap['WWN'] = tag.split('::')[2]
        }
        switch (tag) {
          case 'capability::virtio-scsi':
            tagMap['VirtioSCSI'] = true
            tagMap[tag.split('::')[0]] = tag.split('::')[1]
            break
          case 'volumeProvisioningStrategy::ThinProvisioning':
            tagMap['VolumeProvisioningStrategy'] = VolumeProvisioningStrategy.ThinProvisioning
            break
          case 'volumeProvisioningStrategy::ThickProvisioning':
            tagMap['VolumeProvisioningStrategy'] = VolumeProvisioningStrategy.ThickProvisioning
            break
          case 'notSupportActualSize::true':
            tagMap['notSupportActualSize'] = true
            break
          default:
            tagMap[tag.split('::')[0]] = tag.split('::')[1]
        }
      })
      systemMap[uuid] = tagMap
    })
    return systemMap
  }

  async getVolumeIoThreadPin(uuid) {
    let result: {
      pin?: string
      ioThreadId?: string
    } = {
      pin: '',
      ioThreadId: ''
    }

    try {
      result = await this.getVolumeIoThreadPinAction.call({ uuid })
    } catch (error) {
      console.log(error)
    }

    return result
  }

  //处理L2、L3被内存快照的虚拟机引用
  async getResource(uuids: string[], type: WithMemoryByResourceType) {
    const snapshotNameList = []
    const resourceUuids = []

    const task = uuids?.map((uuid: string) =>
      this.getMemorySnapshotGroupReferenceAction.call({
        resourceUuid: uuid,
        resourceType: type
      })
    )
    const resp = await Promise.all(task)
    const result = resp.filter((item: any) => item?.inventories?.length !== 0)

    result.forEach((i: any) => {
      i?.inventories && snapshotNameList.push(...(i?.inventories as any))
      i?.inventories && resourceUuids.push(i?.resourceUuid)
    })

    const resourceInfoList = await this.getMemorySnapPortGroup(resourceUuids, type)

    const memorySnapshotList = _.uniqBy(snapshotNameList, 'uuid')
    const withMemorySnapShotResourceList = _.uniqBy(resourceInfoList, 'uuid')

    return {
      memorySnapshotList,
      withMemorySnapShotResourceList
    }
  }

  getMemorySnapshotByResource(params) {
    const { uuids, type } = params
    return this.getResource(uuids, type)
  }

  async getMemorySnapPortGroup(uuids: string[], type: WithMemoryByResourceType) {
    if (!uuids || uuids.length === 0) {
      return []
    }
    const uuidList = _.chunk(_.uniq(uuids), 50)
    let resourceInfoList = []
    const resourceMap = {
      [WithMemoryByResourceType.L3NetworkVO]: 'L3Network',
      [WithMemoryByResourceType.L2NetworkVO]: 'L2Network'
    }

    await Promise.all(
      _.map(uuidList, async _uuids => {
        const zql = ZQL.stringify({
          tableName: resourceMap[type],
          fields: ['uuid', 'name'],
          condition: {
            uuid: {
              [ZOp.in]: _uuids
            }
          }
        })
        const { results } = await this.zqlService.call(zql)
        const inventories = results?.[0]?.inventories
        resourceInfoList = resourceInfoList.concat(inventories)
      })
    )
    return resourceInfoList
  }

  getVolumeSystemTag({ uuid, installPath }: { uuid: string; installPath: string }) {
    this.installPathMap[uuid] = {
      uuid,
      installPath
    }
    return this.systemTagDataLoader.load(uuid)
  }

  _getVolumeSystemTag = async (uuids: string[]) => {
    const systemMap = await this.getSystemTags(uuids)
    return uuids.map(uuid => {
      return systemMap[uuid] ? systemMap[uuid] : null
    })
  }

  getBackupTaskType(uuid) {
    return this.volumeBackupTaskTypeDataLoader.load(uuid)
  }

  _getBackupTaskType = async (uuids: string[]) => {
    const volumeUuids = _.uniq(uuids)
    const multZql = [
      {
        // Volume Vm ref
        tableName: 'Volume',
        fields: ['vmInstanceUuid', 'uuid'],
        condition: {
          uuid: {
            [ZOp.in]: volumeUuids
          }
        }
      },
      {
        // 云盘备份任务
        tableName: 'Volume',
        action: ZQLAction.COUNT,
        groupBy: 'uuid',
        condition: {
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJob',
                    fields: ['targetResourceUuid'],
                    condition: {
                      jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.in]: uuids
              }
            }
          ]
        }
      },
      {
        // 混合任务
        tableName: 'VmInstance',
        action: ZQLAction.COUNT,
        groupBy: 'uuid',
        condition: {
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'CdpTaskResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO',
                      resourceUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'Volume',
                            fields: ['vmInstanceUuid'],
                            condition: {
                              uuid: {
                                [ZOp.in]: volumeUuids
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
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'Volume',
                    fields: ['vmInstanceUuid'],
                    condition: {
                      [ZOp.and]: [
                        {
                          // 有点绕，绕的原因参考：
                          vmInstanceUuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'Volume',
                                fields: ['vmInstanceUuid'],
                                condition: {
                                  uuid: {
                                    [ZOp.in]: {
                                      [ZOp.query]: {
                                        tableName: 'SchedulerJob',
                                        fields: ['targetResourceUuid'],
                                        condition: {
                                          jobClassName:
                                            'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
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
                          uuid: {
                            [ZOp.in]: volumeUuids
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          ]
        }
      }
    ]

    const zql = ZQL.multStringify(multZql)
    const { results } = await this.zqlService.call(zql)

    const volumeVmMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, item) => {
        obj[item.uuid] = item.vmInstanceUuid
        return obj
      },
      {}
    )

    const backUpTaskCountResult: any[] = _.get(results, ['1', 'inventoryCounts'], [])

    const cdpTaskAndBackupCountResult: any[] = _.get(results, ['2', 'inventoryCounts'], [])

    const resultMap = {}

    _.forEach(backUpTaskCountResult || [], item => {
      const [volumeInfo, total = 0] = item
      _.set(resultMap, [volumeInfo.uuid, 'backUpTaskCount'], total)
    })

    _.forEach(cdpTaskAndBackupCountResult || [], item => {
      const [vmInfo, total = 0] = item
      _.set(resultMap, [vmInfo.uuid, 'cdpTaskCount'], total)
    })

    return uuids.map(uuid => {
      const cdpTaskAndBackupCount = _.get(resultMap, [_.get(volumeVmMap, uuid), 'cdpTaskCount'], 0)
      const backUpTaskCount = _.get(resultMap, [uuid, 'backUpTaskCount'], 0)
      if (backUpTaskCount > 0) {
        // 优先认为是纯粹的云盘备份任务。
        return VolumeBackupTaskType.BackupJob // 纯粹的云盘备份任务
      } else if (cdpTaskAndBackupCount > 0) {
        return VolumeBackupTaskType.OtherTasks // 混合任务，VM有CDP任务，VM有备份任务（包含云主机）
      } else {
        return null
      }
    })
  }

  getCdpTaskStatus(uuid, vmInstanceUuid) {
    this.volumeVmInstanceUuidMap[uuid] = vmInstanceUuid

    return this.volumeCdpTaskStatusDataLoader.load(uuid)
  }

  _getCdpTaskStatus = async (uuids: string[]) => {
    const volumeUuids = _.uniq(uuids)
    const multZql = [
      {
        tableName: 'CdpTaskResourceRef',
        fields: ['resourceUuid', 'taskUuid'],
        condition: {
          resourceType: 'VmInstanceVO',
          resourceUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmInstance',
                fields: ['uuid'],
                condition: {
                  'allVolumes.uuid': {
                    [ZOp.in]: volumeUuids
                  }
                }
              }
            }
          }
        }
      },
      {
        tableName: 'CdpTask',
        fields: ['uuid', 'status'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'CdpTaskResourceRef',
                fields: ['taskUuid'],
                condition: {
                  resourceType: 'VmInstanceVO',
                  resourceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'VmInstance',
                        fields: ['uuid'],
                        condition: {
                          'allVolumes.uuid': {
                            [ZOp.in]: volumeUuids
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
    ]

    const zql = ZQL.multStringify(multZql)
    const { results } = await this.zqlService.call(zql)

    const cdpTaskResourceRefList = _.get(results, ['0', 'inventories'])
    const cdpTaskList = _.get(results, ['1', 'inventories'])

    const vmTaskUuidMap = _.reduce(
      cdpTaskResourceRefList,
      (obj, cdpTaskResourceRef) => {
        _.set(obj, cdpTaskResourceRef.resourceUuid, cdpTaskResourceRef.taskUuid)
        return obj
      },
      {}
    )

    const cdpTaskMap = _.reduce(
      cdpTaskList,
      (obj, task) => {
        _.set(obj, task.uuid, task)
        return obj
      },
      {}
    )

    return uuids.map(uuid =>
      _.get(
        cdpTaskMap,
        [_.get(vmTaskUuidMap, _.get(this.volumeVmInstanceUuidMap, uuid), null), 'status'],
        null
      )
    )
  }

  getResourceConfig(uuid) {
    return this.volumeResourceConfigDataLoader.load(uuid)
  }

  _getResourceConfig = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'ResourceConfig',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        name: {
          [ZOp.in]: ['aio.native', 'vm.cacheMode']
        },
        category: {
          [ZOp.in]: ['kvm', 'mevoco']
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const resourceConfigList = _.get(results, ['0', 'inventories'])
    return uuids.map(uuid => {
      const resourceConfigs = resourceConfigList.filter(item => item.resourceUuid === uuid)
      if (!resourceConfigs?.length) {
        return null
      }
      const result = {}
      resourceConfigs.forEach(item => {
        result[item.name.replace(/\./g, '')] = item.value
      })
      return result
    })
  }

  judgeHaveSnapShot(uuid) {
    return this.haveSnapshotDataLoader.load(uuid)
  }

  _judgeHaveSnapShot = async (uuids: string[]) => {
    const genZql = uuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'volumeSnapshot',
        condition: {
          volumeUuid: uuid
        },
        namedAs: uuid
      }
    }
    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)
    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'total', 0)
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const count = map[uuid]
      return !!count
    })
  }

  getVolumeQos(volume: IVolume) {
    this.volumeQosMap[volume.uuid] = volume.volumeQos
    const { volumeQos = '' } = volume
    const volumeQosList = _.map(volumeQos.split(','), it => _.words(it))
    const volumeQosMap = {
      total: -1,
      read: -1,
      write: -1
    }
    _.forEach(volumeQosList, itemArr => {
      const [key, value] = itemArr
      if (!_.isUndefined(key) && !_.isUndefined(value)) {
        volumeQosMap[key] = value
      }
    })
    this.volumeQosMap[volume.uuid] = volumeQosMap
    return this.volumeQosDataLoader.load(volume.uuid)
  }

  _getVolumeQos = async (uuids: string[]) => {
    const tasks = uuids.map(uuid => {
      return this.getVolumeQosAction
        .call({ uuid })
        .then(result => {
          const {
            volumeBandwidth,
            volumeBandwidthRead,
            volumeBandwidthWrite,
            iopsTotal,
            iopsRead,
            iopsWrite,
            volumeBandwidthUpthreshold,
            volumeBandwidthReadUpthreshold,
            volumeBandwidthWriteUpthreshold,
            volumeUuid
          } = result
          this.volumeQosMap[volumeUuid] = {
            volumeUuid,
            volumeBandwidth,
            volumeBandwidthRead,
            volumeBandwidthWrite,
            iopsTotal,
            iopsRead,
            iopsWrite,
            volumeBandwidthUpthreshold,
            volumeBandwidthReadUpthreshold,
            volumeBandwidthWriteUpthreshold
          }
        })
        .catch(() => {
          return Promise.resolve()
        })
    })
    await Promise.all(tasks)
    return uuids.map(uuid => {
      return _.get(this.volumeQosMap, uuid, {
        volumeUuid: uuid,
        volumeBandwidth: -1,
        volumeBandwidthRead: -1,
        volumeBandwidthWrite: -1,
        iopsTotal: -1,
        iopsRead: -1,
        iopsWrite: -1,
        volumeBandwidthUpthreshold: -1,
        volumeBandwidthReadUpthreshold: -1,
        volumeBandwidthWriteUpthreshold: -1
      })
    })
  }

  async getSummarys(conditions) {
    const stateList = ['total', 'available', 'enabled', 'disabled', 'destroyed', 'notInstantiated']
    const result = {}
    await Promise.all(
      stateList.map(state => {
        return this.getSummary(state, conditions).then(resp => {
          result[state] = resp
        })
      })
    )
    return result
  }

  async getSummary(state, condtions = []) {
    let extrazqlConditions
    let baseConditons: ICondition[] = [
      {
        key: 'type',
        op: Op.eq,
        value: 'Data'
      }
    ].concat(condtions)

    switch (state) {
      case 'total':
        extrazqlConditions = {
          [ZOp.or]: [
            {
              format: {
                [ZOp.ne]: 'vmtx'
              }
            },
            {
              format: {
                [ZOp.is]: null
              }
            }
          ]
        }
        break
      case 'available': // 可用资源列表
        baseConditons = baseConditons.concat([
          {
            key: 'status',
            op: Op.ne,
            value: 'Deleted'
          },
          {
            key: 'format',
            op: Op.ne,
            value: 'vmtx'
          },
          {
            key: 'status',
            op: Op.ne,
            value: 'NotInstantiated'
          }
        ])
        break
      case 'enabled': // 可用资源列表
        baseConditons = baseConditons.concat([
          {
            key: 'status',
            op: Op.ne,
            value: 'Deleted'
          },
          {
            key: 'state',
            op: Op.eq,
            value: 'Enabled'
          },
          {
            key: 'format',
            op: Op.ne,
            value: 'vmtx'
          },
          {
            key: 'status',
            op: Op.ne,
            value: 'NotInstantiated'
          }
        ])
        break
      case 'disabled': // 可用资源列表
        baseConditons = baseConditons.concat([
          {
            key: 'status',
            op: Op.ne,
            value: 'Deleted'
          },
          {
            key: 'state',
            op: Op.eq,
            value: 'Disabled'
          },
          {
            key: 'format',
            op: Op.ne,
            value: 'vmtx'
          },
          {
            key: 'status',
            op: Op.ne,
            value: 'NotInstantiated'
          }
        ])
        break
      case 'destroyed': // 已删除列表
        baseConditons = baseConditons.concat([
          {
            key: 'status',
            op: Op.eq,
            value: 'Deleted'
          },
          {
            key: 'format',
            op: Op.ne,
            value: 'vmtx'
          }
        ])
        break
      case 'notInstantiated': // 未实例化列表
        baseConditons = [
          {
            key: 'status',
            op: Op.eq,
            value: 'NotInstantiated'
          },
          {
            key: 'type',
            op: Op.eq,
            value: 'Data'
          }
        ]
        break
      default:
        baseConditons.push({
          key: 'state',
          op: Op.eq,
          value: 'Enabled'
        })
        break
    }

    const zqlObject = {
      tableName: 'Volume',
      condition: QueryConditionTranslator.translate(baseConditons, extrazqlConditions),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }

  backupTaskStatus(uuid) {
    return this.backupTaskStatusDataloader.load(uuid)
  }

  _backupTaskStatus = async (uuids = []) => {
    const zqlObject = {
      tableName: 'SchedulerJob',
      fields: ['targetResourceUuid', 'state'],
      condition: {
        targetResourceUuid: {
          [ZOp.in]: uuids
        },
        jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories ?? []

    const volumeJobMap = _.reduce(
      inventories,
      (obj, it) => {
        obj[it?.targetResourceUuid] = it?.state
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(volumeJobMap, uuid, null))
  }
}

export interface GetResourceAccountActionParam {
  resourceUuids: any[]
}
