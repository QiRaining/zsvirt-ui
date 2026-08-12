import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  Op,
  QueryParam,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'
import { GetCpuMemoryCapacityAction } from '@/api/zstack/GetCpuMemoryCapacityAction'
import { GetEipAttachableVmNicsAction } from '@/api/zstack/GetEipAttachableVmNicsAction'
import { GetGlobalConfigOptionsAction } from '@/api/zstack/GetGlobalConfigOptionsAction'
import { GetLatestGuestToolsForVmAction } from '@/api/zstack/GetLatestGuestToolsForVmAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { GetResourceConfigAction } from '@/api/zstack/GetResourceConfigAction'
import { GetVmBootOrderAction } from '@/api/zstack/GetVmBootOrderAction'
import { GetVmConsoleAddressAction } from '@/api/zstack/GetVmConsoleAddressAction'
import { GetVmEmulatorPinningAction } from '@/api/zstack/GetVmEmulatorPinningAction'
import { GetVmGuestToolsInfoAction } from '@/api/zstack/GetVmGuestToolsInfoAction'
import { GetVmsCapabilitiesAction } from '@/api/zstack/GetVmsCapabilitiesAction'
import { GetVmsSchedulingStateFromSchedulingRuleAction } from '@/api/zstack/GetVmsSchedulingStateFromSchedulingRuleAction'
import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { ParseOvfAction } from '@/api/zstack/ParseOvfAction'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryEipAction } from '@/api/zstack/QueryEipAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { QuerySecurityGroupAction } from '@/api/zstack/QuerySecurityGroupAction'
import { QueryShareableVolumeVmInstanceRefAction } from '@/api/zstack/QueryShareableVolumeVmInstanceRefAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { RequestConsoleAccessAction } from '@/api/zstack/RequestConsoleAccessAction'
import { CdpTaskStatus, OperatorState, VmInstanceState } from '@/common/enum'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { AuditService } from '@/maintenance/audit/audit.service'
import { DependentResourceType } from '@/settings/resource-config/resource-config.model'
import { genUuid } from '@/utils'
import Utf8Base64 from '@/utils/utf8Base64'
import { ZsvSharedResourceQueryService } from '@/zsphere-administration/owner/zsv-shared-resource-query'
import { SchedulerJobState } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'
import { VGpuDeviceType } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.model'

import {
  BootOrderResp,
  GuestToolsState,
  QueryExportArgs,
  QueryVmArgs,
  VmBackupTaskType,
  VmInstanceQemuState,
  VmQueryType
} from '../vm-instance.model'

@Injectable()
export class VmInstanceQueryService {
  @Inject() apiQueryVmInstanceService: QueryVmInstanceAction
  @Inject() apiQuerySystemTagAction: QuerySystemTagAction
  @Inject() zqlService: ZQLService
  @Inject()
  apiQueryShareableVolumeVmInstanceRefAction: QueryShareableVolumeVmInstanceRefAction
  @Inject() apiQueryEipAction: QueryEipAction
  @Inject() apiQuerySecurityGroupAction: QuerySecurityGroupAction
  @Inject() getVmBootOrderAction: GetVmBootOrderAction
  @Inject() getResourceAccount: GetResourceAccountAction
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction
  @Inject() getEipAttachableVmNicsAction: GetEipAttachableVmNicsAction
  @Inject() requestConsoleAccessAction: RequestConsoleAccessAction
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() getVmConsoleAddressAction: GetVmConsoleAddressAction
  @Inject() getVmGuestToolsInfoAction: GetVmGuestToolsInfoAction
  @Inject() parseOvfAction: ParseOvfAction
  @Inject() getVmsCapabilitiesAction: GetVmsCapabilitiesAction
  @Inject() getCpuMemoryCapacityAction: GetCpuMemoryCapacityAction
  @Inject() getAccountQuotaUsageAction: GetAccountQuotaUsageAction
  @Inject() getVmEmulatorPinningAction: GetVmEmulatorPinningAction
  @Inject() getGlobalConfigOptions: GetGlobalConfigOptionsAction
  @Inject() getResourceConfig: GetResourceConfigAction
  @Inject() getLatestGuestToolsForVmAction: GetLatestGuestToolsForVmAction
  @Inject()
  getVmsSchedulingStateFromSchedulingRuleAction: GetVmsSchedulingStateFromSchedulingRuleAction
  @Inject()
  getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction
  @Inject() auditService: AuditService
  @Inject() zsvSharedResourceQueryService: ZsvSharedResourceQueryService

  private vmRelatedResourceDataLoader
  private vmAttachedShareableVolumeListDataLoader
  private vmEipDataLoader
  private vmSecurityGroupDataLoader
  private vmCdRomsDataLoader
  private systemTagDataLoader
  private vmHaDataLoader
  private gpuDeviceSpecDataLoader
  private globalConfigDataLoader
  private volumeAttributeUserConfigDataloader
  private vmCapabilitiesDataLoader
  private vmBackupStatusDataLoader
  private vmAffinityGroupDataloader
  private vmGroupDataloader
  private getCpuModeDataloader
  private vmCdpTaskStatusDataLoader
  private vmBackupTaskTypeDataLoader
  private vmBackupJobDataLoader
  private vmGroupPathDataLoader

  private vmQemuStateDataLoader
  private vmVnumaDataloader
  private sshKeyPairNumDataLoader
  private vmDeleteOperatorDataloader
  private backupTaskStatusDataloader
  private vmScsiLunDataloader
  private queryVmUsageDataloader
  private lastBackupJobResultDataloader
  private localBackupCountDataloader
  private localBackupSizeDataloader
  private backupJobDataloader
  private userGroupDataloader

  private vmRelatedResourceMap: any = {}
  private vmAttachedShareableVolumeListMap: any = {}
  private volumeAttributeUserConfigMap: any = {}
  private vmAttachedRootVolumeUuidMap: any = {}

  constructor() {
    this.vmCdpTaskStatusDataLoader = new DataLoader(this._getCdpTaskStatus)
    this.vmBackupTaskTypeDataLoader = new DataLoader(this._getBackupTaskType)
    this.vmRelatedResourceDataLoader = new DataLoader(this._getRelatedResource)
    this.backupTaskStatusDataloader = new DataLoader(this._backupTaskStatus)
    this.vmAttachedShareableVolumeListDataLoader = new DataLoader(
      this._getAttachedShareableVolumeList
    )
    this.vmEipDataLoader = new DataLoader(this._queryEip)
    this.vmSecurityGroupDataLoader = new DataLoader(this._querySecurityGroup)
    this.vmCdRomsDataLoader = new DataLoader(this._getVmCdRoms)
    this.systemTagDataLoader = new DataLoader(this._getVmInstanceSystemTag)
    this.vmHaDataLoader = new DataLoader(this._getVmHa)
    this.gpuDeviceSpecDataLoader = new DataLoader(this._getGpuDeviceSpec)
    this.globalConfigDataLoader = new DataLoader(this._getVmInstanceGlobalConfig)
    this.volumeAttributeUserConfigDataloader = new DataLoader(this._getVolumeAttributeUserConfig)

    this.vmAffinityGroupDataloader = new DataLoader(this._getAffinityGroup)
    this.vmGroupDataloader = new DataLoader(this._getVmGroup)

    this.sshKeyPairNumDataLoader = new DataLoader(this._getSshKeyPairNum)
    this.vmCapabilitiesDataLoader = new DataLoader(this._getCapabilities)
    this.vmBackupStatusDataLoader = new DataLoader(this._getBackupStatus)
    this.vmBackupJobDataLoader = new DataLoader(this._getVMBackupJob)

    this.getCpuModeDataloader = new DataLoader(this._getCpuMode)
    this.vmGroupPathDataLoader = new DataLoader(this._getVmGroupPath)

    this.vmQemuStateDataLoader = new DataLoader(this._getVmInstanceQemuState)
    this.vmVnumaDataloader = new DataLoader(this._getVmVnuma)
    this.vmDeleteOperatorDataloader = new DataLoader(this._getVmDeleteOperator)
    this.vmScsiLunDataloader = new DataLoader(this._getScsiLun)
    this.queryVmUsageDataloader = new DataLoader(this._queryVmUsage)

    this.lastBackupJobResultDataloader = new DataLoader(this._getLastBackupJobResult)
    this.localBackupCountDataloader = new DataLoader(this._getLocalBackupCount)
    this.localBackupSizeDataloader = new DataLoader(this._getLocalBackupSize)
    this.backupJobDataloader = new DataLoader(this._getBackupJob)
    this.userGroupDataloader = new DataLoader(this._getUserGroup)
  }

  async getGuestTool(uuid: string) {
    return this.getVmGuestToolsInfoAction.call({ uuid })
  }

  async get(param: QueryVmArgs) {
    const { type = VmQueryType.Normal } = param
    let _extrazqlConditions

    switch (type) {
      case VmQueryType.Normal:
        _extrazqlConditions = {
          [ZOp.and]: {
            hypervisorType: {
              [ZOp.ne]: 'ESX'
            }
          }
        }
        break
      case VmQueryType.GetInstanceWithSnapshotStrategy:
        _extrazqlConditions = await this.getInstanceWithSnapshotStrategy(param.extraConditions)
        break
      case VmQueryType.GetCandidatesForSnapshotStrategy:
        _extrazqlConditions = await this.getCandidatesForSnapshotStrategy()
        break
      case VmQueryType.GetVmBySchedulerJobGroup:
        _extrazqlConditions = await this.getVmBySchedulerJobGroup(param.extraConditions)
        break
      case VmQueryType.Se:
        _extrazqlConditions = await this.getVmBySe()
        break
      case VmQueryType.GetBackupJobAttachableVM:
        _extrazqlConditions = await this.getBackupJobAttachableVM(param.extraConditions)
        break
      case VmQueryType.GetCdpTaskAttachableVM:
        _extrazqlConditions = await this.getCdpTaskAttachableVM()
        break
      case VmQueryType.GetCandidatesVmForCreateVmSnapshot:
        _extrazqlConditions = await this.getCandidatesVmForCreateVmSnapshot()
        break
      case VmQueryType.GetCandidatesVmForCreateVmSnapshotGroup:
        _extrazqlConditions = await this.GetCandidatesVmForCreateVmSnapshotGroup()
        break
      case VmQueryType.GetCandidatesVmForCreateVmSnapshotJob: //单盘快照定时任务
        _extrazqlConditions = await this.getCandidatesVmForCreateVmSnapshotJob()
        break
      case VmQueryType.GetCandidatesVmForCreateVmSnapshotGroupJob: //快照组快照定时任务
        _extrazqlConditions = await this.GetCandidatesVmForCreateVmSnapshotGroupJob()
      case VmQueryType.GetCandidatesVmForAttachSshKeyPair:
        _extrazqlConditions = await this.getCandidatesVmForAttachSshKeyPair(param.extraConditions)
        break
      case VmQueryType.GetCandidatesVmForDetachSshKeyPair:
        _extrazqlConditions = await this.getCandidatesVmForDetachSshKeyPair(param.extraConditions)
        break
      case VmQueryType.GetDataVolumeAttachableVm:
        _extrazqlConditions = await this.getDataVolumeAttachableVm(param.extraConditions)
        break
      case VmQueryType.GetVmCandidatesForAttachingScsiLun:
        _extrazqlConditions = await this.getVmCandidatesForAttachingScsiLun(param.extraConditions)
        break
      case VmQueryType.GetVmCandidatesForDetachScsiLun:
        _extrazqlConditions = await this.getVmCandidatesForDetachScsiLun(param.extraConditions)
        break
      case VmQueryType.GetVmForPortForwardingAttachVmNic:
        // _extrazqlConditions = await this.getVmForPortForwardingAttachVmNic(
        //   param.extraConditions
        // )
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetPortForwardingAttachableVmNics',output='inventories.vmInstanceUuid',ruleUuid='${
              conditionsToObject(param.extraConditions)['ruleUuid']
            }')`
          }
        }
        break
      case VmQueryType.GetVmCandidatesForPortMirror:
        const portMirrorUuid = conditionsToObject(param.extraConditions)['portMirrorUuid']
        const type = conditionsToObject(param.extraConditions)['type']
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetCandidateVmNicsForPortMirror',output='inventories.vmInstanceUuid',portMirrorUuid='${portMirrorUuid}',type='${type}')`
          }
        }
        break
      case VmQueryType.eipAttachCandidate:
        _extrazqlConditions = await this.getEipAttachCandidateCondition(param)
        break
      case VmQueryType.GetAffinityGroupAttachableVM:
        _extrazqlConditions = await this.getAffinityGroupAttachableVM(param)
        break

      case VmQueryType.Account:
        _extrazqlConditions = await this.getAccountRelatedVms(param)
        break

      case VmQueryType.GetVmCandidatesForAddToVmGroup:
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VMInstance',
                fields: ['uuid'],
                condition: {
                  uuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'VmSchedulingRuleGroupRef',
                        fields: ['vmUuid']
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break

      case VmQueryType.GetVmByVmGroup:
        _extrazqlConditions = await this.getVmByVmGroup(param)
        break

      case VmQueryType.GetInstanceWithSnapshotGroup:
        _extrazqlConditions = await this.getInstanceWithSnapshotGroup()
        break

      case VmQueryType.GetVmInstanceTemplate:
        _extrazqlConditions = await this.getVmInstanceTemplate()
        break

      case VmQueryType.GetVmInstanceTemplateRelatedVM:
        _extrazqlConditions = await this.getVmInstanceTemplateRelatedVM(param)
        break
      //被共享后的vm,extraConditions为对应accountUuid
      case VmQueryType.ZSV_SHARED_RESOURCE:
        _extrazqlConditions = this.zsvSharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'VmInstanceVO'
        )
        break
      //vmTemlate共享
      case VmQueryType.Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE:
        _extrazqlConditions = await this.getVmInstanceTemplateBySharedResource({
          param
        })
        break
      //未被共享的vm
      case VmQueryType.ZSV_NOT_SHARED_RESOURCE:
        _extrazqlConditions = this.zsvSharedResourceQueryService.getSharedResourceList(
          param.extraConditions,
          'VmInstanceVO',
          false
        )
        break
      //未被共享的vm模板
      case VmQueryType.Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE:
        _extrazqlConditions = await this.getVmInstanceTemplateBySharedResource({
          param,
          isShared: false
        })
        break
      // kms
      case VmQueryType.GetKeyProviderRelatedResource:
        _extrazqlConditions = await this.getKeyProviderRelatedResource(param.extraConditions)
        break
    }

    const baseCondition = []

    // 提取并移除 __excludeGatewayVm__ 条件，避免传入 ZQL 查询
    const excludeGatewayVmCondition = _.remove(
      param.conditions,
      condition => condition.key === '__excludeGatewayVm__'
    )

    if (!param.conditions.some(condition => condition.key === 'type')) {
      baseCondition.push({
        key: 'type',
        op: Op.eq,
        value: 'UserVM'
      })
    }

    const _zqlCondition = this.buildZqlCondition(
      param.conditions.concat(baseCondition),
      _extrazqlConditions,
      type
    )

    const zqlObject = {
      tableName: 'vmInstance',
      condition: _zqlCondition,
      action: param?.count ? ZQLAction.COUNT : ZQLAction.QUERY,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = ZQL.stringify(zqlObject)

    const vmResp = await this.zqlService.call(zql)
    // 批量查询云主机的调度状态
    if (vmResp.results[0].inventories?.length && param?.extraConditions?.length) {
      const vmSchedulingRuleUuid = conditionsToObject(param?.extraConditions)?.[
        'vmSchedulingRuleUuid'
      ]
      if (vmSchedulingRuleUuid) {
        const vmUuids = vmResp.results[0].inventories?.map(vm => vm?.uuid)
        const schedulingStateResult = await this.getVmsSchedulingStateFromSchedulingRuleAction.call(
          {
            vmUuids,
            ruleUuid: vmSchedulingRuleUuid
          }
        )
        const schedulingStateMap = schedulingStateResult?.ruleMapState
        vmResp.results[0].inventories?.map(vm => {
          vm.schedulingState = schedulingStateMap?.[vm?.uuid]
        })
      }
    }

    // 处理迁移网关虚拟机
    try {
      const gatewayVmResult = await this.getZMigrateGatewayVmInstancesAction.call({})
      const gatewayVmInstances = gatewayVmResult?.gatewayVmInstances ?? []

      // 当传入 __excludeGatewayVm__ 条件时，将网关 VM 标记 zmigrateType 后 concat 到结果中
      if (excludeGatewayVmCondition?.length > 0) {
        const taggedGatewayVms = gatewayVmInstances.map(vm => ({
          ...vm,
          zmigrateType: 'gatewayVm'
        }))
        vmResp.results[0].inventories = (vmResp.results[0].inventories || []).concat(
          taggedGatewayVms
        )
        vmResp.results[0].total = vmResp.results[0].inventories.length
      }
    } catch {
      // 获取迁移网关虚拟机列表失败时不影响正常查询
    }

    return {
      list: vmResp.results[0].inventories,
      total: vmResp.results[0].total
    }
  }

  getVmTemplate() {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'templatedVminstance',
            fields: ['uuid']
          }
        }
      }
    }

    return zqlCondition
  }

  buildZqlCondition(
    conditions: ICondition[],
    extrazqlConditions: ZqlObject['condition'],
    type?: VmQueryType
  ) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      '__tagUuid__',
      '__HostName__',
      '__BackupTaskType__',
      '__backupStorageUuid__',
      '__backupPriority__',
      '__backupJobState__',
      '__SshKeyPairUuids__',
      'schedulingState',
      'qemuState',
      '__zoneUuid__',
      'shareType'
    ])

    const vmGroupCondition = _.remove(conditions, condition => condition.key === 'vmgroup')
    const groupPathCondition = _.remove(conditions, condition => condition.key === 'groupPath')

    const vmHaCondition = _.remove(conditions, condition => condition.key === '__HaLevel__')

    const vmGuestToolsCondition = _.remove(
      conditions,
      condition => condition.key === '__VmGuestTools__'
    )
    const eipIsAttachedCondition = _.remove(
      conditions,
      condition => condition.key === 'eip.is.attached'
    )

    const hostCondition = _.remove(conditions, condition => condition.key === 'host.managementIp')

    const ownerCondition = _.remove(conditions, condition => condition.key === 'ownerName')
    const hostUuidCondition = _.remove(
      // 查询该host上所有VM
      conditions,
      condition => condition.key === 'hostUuid'
    )

    const volumeUuidCondition = _.remove(
      // 查询该volume上所有VM
      conditions,
      condition => condition.key === 'volumeUuid'
    )

    const scsiLunUuidCondition = _.remove(
      // 查询该scsiLun上所有VM
      conditions,
      condition => condition.key === 'scsiLunUuid'
    )

    const systemTagCondition = _.remove(conditions, condition => condition.key === '__systemTag__')

    const cdpTaskStatusConditon = _.remove(
      conditions,
      condition => condition.key === '__CdpTaskStatus__'
    )

    const hasCdpTaskConditon = _.remove(conditions, condition => condition.key === '__HasCdpTask__')

    _.remove(conditions, condition => condition.key === 'tag')

    const guestOsTypeConditions = _.remove(conditions, condition => condition.key === 'guestOsType')

    const specicalCondition = []

    //过滤是模版的VM type为GetVmInstanceTemplate|Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE|Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE 不过滤
    if (
      type &&
      ![
        VmQueryType.GetVmInstanceTemplate,
        VmQueryType.Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE,
        VmQueryType.Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE
      ].includes(type)
    ) {
      const filterVmTemplateCondition = {
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

      //过滤是模版的VM
      specicalCondition.push(filterVmTemplateCondition)
    }

    if (hasCdpTaskConditon?.length > 0) {
      const hasCdpTask = hasCdpTaskConditon?.[0]?.value === 'true'
      // 有CDP任务
      if (hasCdpTask) {
        specicalCondition.push({
          uuid: {
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
        })
      } else {
        // 无CDP任务
        specicalCondition.push({
          uuid: {
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
        })
      }
    }

    if (cdpTaskStatusConditon?.length > 0) {
      /*
       *   分三种情况：
       *   1, 没有状态，hasNull为true
       *   2, 有状态，_cdpStatus.length > 0
       *   3, 以上两种同时存在，hasNull为true 并且 _cdpStatus.length > 0
       */
      const cdpStatus = cdpTaskStatusConditon?.[0]?.values
      const hasStarting = _.includes(cdpStatus, 'Starting')
      const hasRunning = _.includes(cdpStatus, 'Running')
      const hasStopped = _.includes(cdpStatus, 'Stopped')
      const hasNull = _.includes(cdpStatus, 'null')

      const _cdpStatus = []

      if (hasStarting) {
        _cdpStatus.push(CdpTaskStatus.Starting)
      }

      if (hasRunning) {
        _cdpStatus.push(CdpTaskStatus.Running)
        _cdpStatus.push(CdpTaskStatus.DataMerging)
      }
      if (hasStopped) {
        _cdpStatus.push(CdpTaskStatus.Created)
        _cdpStatus.push(CdpTaskStatus.Stopped)
        _cdpStatus.push(CdpTaskStatus.Unknown)
        _cdpStatus.push(CdpTaskStatus.Failed)
      }

      // 同时存在需要用or
      if (hasNull && _cdpStatus?.length > 0) {
        specicalCondition.push({
          [ZOp.or]: [
            {
              uuid: {
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
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'CdpTaskResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO',
                      taskUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'CdpTask',
                            fields: ['uuid'],
                            condition: {
                              taskType: 'VM',
                              status: {
                                [ZOp.in]: _cdpStatus
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
        })
      } else if (hasNull) {
        specicalCondition.push({
          uuid: {
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
        })
      } else if (_cdpStatus?.length > 0) {
        specicalCondition.push({
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'CdpTaskResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'VmInstanceVO',
                  taskUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'CdpTask',
                        fields: ['uuid'],
                        condition: {
                          taskType: 'VM',
                          status: {
                            [ZOp.in]: _cdpStatus
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        })
      }
    }

    if (hostCondition.length > 0) {
      const hostIp = hostCondition[0].value
      const hostZqlCondition = {
        [ZOp.or]: [
          {
            'host.managementIp': {
              [ZOp.like]: hostIp
            }
          },
          {
            rootVolumeUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'localStorageResourceRef',
                  fields: 'resourceUuid',
                  condition: {
                    hostUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'host',
                          fields: 'uuid',
                          condition: {
                            managementIp: {
                              [ZOp.like]: hostIp
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
      specicalCondition.push(hostZqlCondition)
    }

    if (_extraConditionMap['__BackupTaskType__']) {
      const typeList = _extraConditionMap['__BackupTaskType__'].values
      const backupStorageUuid = _extraConditionMap['__backupStorageUuid__']?.value

      const hasCdpTask: boolean = _.includes(typeList, 'CdpTask')
      const hasBackupTask: boolean = _.includes(typeList, 'BackupTask')
      const hasNone: boolean = _.includes(typeList, '__None__')
      const hasBackupTaskWithoutData = _.includes(typeList, 'BackupTaskNoData')
      const hasRemoteBackupTaskWithoutData = _.includes(typeList, 'BackupTaskNoDataRemote')

      const arrayLength = _.get(
        _.compact([
          hasCdpTask,
          hasBackupTask,
          hasNone,
          hasBackupTaskWithoutData,
          hasRemoteBackupTaskWithoutData
        ]),
        'length',
        0
      )

      let _zqlObject = {}

      if (arrayLength === 0) {
      } else if (arrayLength === 1) {
        if (hasCdpTask) {
          _zqlObject = {
            uuid: {
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

        if (hasBackupTask) {
          _zqlObject = {
            uuid: {
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
                            jobClassName: {
                              [ZOp.in]: [
                                'org.zstack.storage.backup.CreateVmBackupJob',
                                'org.zstack.storage.backup.CreateRootVolumeBackupJob'
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
          }
        }

        if (hasNone) {
          _zqlObject = {
            [ZOp.and]: [
              {
                uuid: {
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
                uuid: {
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
                                jobClassName: {
                                  [ZOp.in]: [
                                    'org.zstack.storage.backup.CreateVmBackupJob',
                                    'org.zstack.storage.backup.CreateRootVolumeBackupJob'
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
              }
            ]
          }
        }

        if (hasBackupTaskWithoutData) {
          _zqlObject = {
            [ZOp.and]: [
              {
                uuid: {
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
                                jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob',
                                schedulerJobGroupUuids: {
                                  [ZOp.notIn]: ['']
                                },
                                ...(!!backupStorageUuid && {
                                  jobData: {
                                    [ZOp.like]: backupStorageUuid
                                  }
                                })
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
                      tableName: 'VolumeBackup',
                      fields: ['vmInstanceUuid'],
                      condition: {
                        status: 'Ready',
                        type: 'Root',
                        'backupStorage.__systemTag__': {
                          [ZOp.in]: ['onlybackup', 'allowbackup']
                        },
                        ...(!!backupStorageUuid && {
                          'backupStorage.uuid': backupStorageUuid
                        }),
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
                                          [ZOp.in]: ['onlybackup', 'allowbackup']
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
            ]
          }
        }

        if (hasRemoteBackupTaskWithoutData) {
          _zqlObject = {
            [ZOp.and]: [
              {
                uuid: {
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
                                [ZOp.and]: [
                                  {
                                    jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob'
                                  },
                                  {
                                    schedulerJobGroupUuids: {
                                      [ZOp.notIn]: ['']
                                    }
                                  },
                                  {
                                    jobData: {
                                      [ZOp.like]: '%remoteBackupStorageUuid%'
                                    }
                                  },
                                  ...(!!backupStorageUuid
                                    ? [
                                        {
                                          jobData: {
                                            [ZOp.like]: backupStorageUuid
                                          }
                                        }
                                      ]
                                    : [])
                                ]
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
                      tableName: 'VolumeBackup',
                      fields: ['vmInstanceUuid'],
                      condition: {
                        status: 'Ready',
                        type: 'Root',
                        'backupStorage.__systemTag__': {
                          [ZOp.in]: ['remotebackup']
                        },
                        ...(!!backupStorageUuid && {
                          'backupStorage.uuid': backupStorageUuid
                        }),
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
                                          [ZOp.in]: ['remotebackup']
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
            ]
          }
        }
      } else if (arrayLength >= 2) {
        _zqlObject = {
          [ZOp.or]: []
        }

        if (hasCdpTask) {
          _zqlObject[ZOp.or].push({
            uuid: {
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
          })
        }

        if (hasBackupTask) {
          _zqlObject[ZOp.or].push({
            uuid: {
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
                            jobClassName: {
                              [ZOp.in]: [
                                'org.zstack.storage.backup.CreateVmBackupJob',
                                'org.zstack.storage.backup.CreateRootVolumeBackupJob'
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
          })
        }

        if (hasNone) {
          _zqlObject[ZOp.or] = _zqlObject[ZOp.or].concat({
            [ZOp.and]: [
              {
                uuid: {
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
                uuid: {
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
                                jobClassName: {
                                  [ZOp.in]: [
                                    'org.zstack.storage.backup.CreateVmBackupJob',
                                    'org.zstack.storage.backup.CreateRootVolumeBackupJob'
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
              }
            ]
          })
        }
      }

      if (!_.isEmpty(_zqlObject)) {
        specicalCondition.push(_zqlObject)
      }
    }

    if (_extraConditionMap['__backupPriority__']?.values?.length === 1) {
      const priority = _extraConditionMap['__backupPriority__'].values[0]
      specicalCondition.push({
        rootVolumeUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SchedulerJob',
              fields: ['targetResourceUuid'],
              condition: {
                jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob',
                schedulerJobGroupUuids: {
                  [ZOp.notIn]: ['']
                },
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SchedulerJobGroupJobRef',
                      fields: ['schedulerJobUuid'],
                      condition: {
                        priority: {
                          [priority === 'high' ? ZOp.lt : ZOp.eq]: 0
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap['__backupJobState__']?.values?.length === 1) {
      specicalCondition.push({
        rootVolumeUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SchedulerJob',
              fields: ['targetResourceUuid'],
              condition: {
                jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob',
                schedulerJobGroupUuids: {
                  [ZOp.notIn]: ['']
                },
                state: _extraConditionMap['__backupJobState__'].values[0]
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap['__SshKeyPairUuids__']) {
      const sshKeyPairUuids: string[] = _.compact(
        _.flatten([
          _extraConditionMap['__SshKeyPairUuids__']?.value ||
            _extraConditionMap['__SshKeyPairUuids__']?.values
        ])
      )

      const zqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SshKeyPairRef',
              fields: 'resourceUuid',
              condition: {
                sshKeyPairUuid: {
                  [ZOp.in]: sshKeyPairUuids
                }
              }
            }
          }
        }
      }

      return zqlCondition
    }

    if (_extraConditionMap['__HostName__']) {
      const hostName = _extraConditionMap['__HostName__'].value
      const hostNameZqlCondition = {
        [ZOp.or]: [
          {
            'host.name': {
              [ZOp.like]: hostName
            }
          },
          {
            rootVolumeUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'localStorageResourceRef',
                  fields: 'resourceUuid',
                  condition: {
                    hostUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'host',
                          fields: 'uuid',
                          condition: {
                            name: {
                              [ZOp.like]: hostName
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
      specicalCondition.push(hostNameZqlCondition)
    }

    if (ownerCondition.length > 0) {
      const ownerName = ownerCondition[0].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'VmInstanceVO')
      )
    }

    if (volumeUuidCondition.length > 0) {
      const volumeUuid = volumeUuidCondition?.[0]?.value
      const volumeZqlCondition = {
        [ZOp.or]: {
          'allVolumes.uuid': volumeUuid,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['vmInstanceUuid'],
                condition: {
                  volumeUuid: volumeUuid
                }
              }
            }
          }
        }
      }
      specicalCondition.push(volumeZqlCondition)
    }

    if (scsiLunUuidCondition.length > 0) {
      const scsiLunUuids = _.compact(
        _.flatten([scsiLunUuidCondition?.[0]?.value || scsiLunUuidCondition?.[0]?.values])
      )
      const scsiLunZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ScsiLunVmInstanceRef',
              fields: ['vmInstanceUuid'],
              condition: {
                scsiLunUuid: {
                  [ZOp.in]: scsiLunUuids
                }
              }
            }
          }
        }
      }
      specicalCondition.push(scsiLunZqlCondition)
    }

    if (hostUuidCondition.length > 0) {
      const hostUuid = hostUuidCondition?.[0]?.value

      const hostZqlCondition = {
        [ZOp.or]: [
          {
            [ZOp.and]: {
              lastHostUuid: hostUuid,
              // state: 'Stopped',
              hostUuid: { [ZOp.is]: null }
            }
          },
          {
            hostUuid: hostUuid
          },
          {
            'rootVolume.localStorageHostRef.hostUuid': hostUuid
          }
        ]
      }
      specicalCondition.push(hostZqlCondition)
    }

    if (systemTagCondition.length > 0) {
      systemTagCondition.forEach(item => {
        switch (item.value) {
          case '!qemuga':
            item.op = Op.ne
            item.value = 'qemuga'
            break
          case 'Legacy':
            item.op = Op.ne
            item.value = 'bootMode::UEFI'
            break
          case 'UEFI':
            item.value = 'bootMode::UEFI'
            break
          case 'resourceBindings':
            item.op = Op.like
            item.value = 'resourceBindings'
            break
          case '!resourceBindings':
            item.op = Op.notLike
            item.value = 'resourceBindings'
            break
          default:
            break
        }
      })
      const systemTagZqlConditon = QueryConditionTranslator.translate(systemTagCondition)
      specicalCondition.push(systemTagZqlConditon)
    }

    if (vmGroupCondition.length > 0) {
      const groupName = vmGroupCondition?.[0]?.value

      if (groupName === '-2') {
        //未分组
        specicalCondition.push({
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid']
              }
            }
          }
        })
      } else if (groupName !== '-1') {
        const dirZqlCondition = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid'],
                condition: {
                  directoryUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'directory',
                        fields: ['uuid'],
                        condition: {
                          [ZOp.or]: [
                            {
                              groupName: {
                                [ZOp.exactLike]: `'${groupName}/%'`
                              }
                            },
                            {
                              groupName: {
                                [ZOp.eq]: groupName
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
        specicalCondition.push(dirZqlCondition)
      }
    }

    if (groupPathCondition.length > 0) {
      const groupName = groupPathCondition?.[0]?.value

      //需要考虑传入'默认分组'的情况，并不是对应vm的真实groupPath，目前（2023/4/10）查不到groupPath的vm都归到'默认分组'里，这里在查询的时候需要做判断

      if ('默认分组'.includes(groupName)) {
        const groupPathZqlCondition = {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid']
              }
            }
          }
        }
        specicalCondition.push(groupPathZqlCondition)
      } else {
        const groupPathZqlCondition = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid'],
                condition: {
                  directoryUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'directory',
                        fields: ['uuid'],
                        condition: {
                          groupName: {
                            [ZOp.like]: groupName
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

        specicalCondition.push(groupPathZqlCondition)
      }
    }

    if (vmGuestToolsCondition.length > 0) {
      const stateList = vmGuestToolsCondition[0]?.values
      if (stateList.length === 1) {
        let toolsCondition: any
        if (stateList.includes('Installed')) {
          toolsCondition = {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'GuestToolsState.vmInstanceUuid',
                  condition: {
                    [ZOp.or]: [
                      {
                        qgaState: {
                          [ZOp.in]: ['NotRunning', 'Running', 'NotUpgraded']
                        }
                      },
                      {
                        zwatchState: {
                          [ZOp.in]: ['NotRunning', 'Running']
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
        if (stateList.includes('UnInstall') || stateList.includes(GuestToolsState.Uninstall)) {
          toolsCondition = {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'GuestToolsState.vmInstanceUuid',
                  condition: {
                    qgaState: 'NotInstalled',
                    zwatchState: 'NotInstalled'
                  }
                }
              }
            }
          }
        }

        // let toolsCondition: any = guestToolsZqlCondition
        // 未安装的过滤 包含没有GuestToolsState信息的云主机。和后端沟通，云主机应该都需要有GuestToolsState的信息
        // if (stateList.includes('UnInstall')) {
        //   toolsCondition = {
        //     [ZOp.or]: [
        //       guestToolsZqlCondition,
        //       {
        //         uuid: {
        //           [ZOp.notIn]: {
        //             [ZOp.query]: {
        //               tableName: 'GuestToolsState.vmInstanceUuid'
        //             }
        //           }
        //         }
        //       }
        //     ]
        //   }
        // }
        specicalCondition.push(toolsCondition)
      }
    }

    if (vmHaCondition.length > 0) {
      // ZSV-7867: 使用 VmHaVO（vmHa.haLevel）替换原 systemTag.ha 查询
      // 后端 VmHaVO 表存储 VM 高可用信息，haLevel 取值：
      // "Undefined" / "None" / "OnHostFailure" / "NeverStop"
      const isNeverStop = _.isEqual(vmHaCondition[0]?.values, ['NeverStop'])
      const isNone = _.isEqual(vmHaCondition[0]?.values, ['None'])
      const isNeverStopAndNone = _.isEqual(
        vmHaCondition[0]?.values?.sort(),
        ['None', 'NeverStop'].sort()
      )

      if (isNeverStop) {
        const haZqlCondition = {
          'vmHa.haLevel': {
            [ZOp.eq]: 'NeverStop'
          }
        }
        specicalCondition.push(haZqlCondition)
      } else if (isNone) {
        const haZqlCondition = {
          'vmHa.haLevel': {
            [ZOp.not]: 'NeverStop'
          }
        }
        specicalCondition.push(haZqlCondition)
      } else if (isNeverStopAndNone) {
      }
    }

    if (eipIsAttachedCondition.length > 0) {
      const isAttached = eipIsAttachedCondition?.[0]?.value
      const eipIsAttachedZqlCondition =
        isAttached === 'true' || isAttached === true
          ? {
              'vmNics.eip.uuid': {
                [ZOp.not]: null
              }
            }
          : {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'vminstance',
                    fields: ['uuid'],
                    condition: {
                      'vmNics.eip.uuid': {
                        [ZOp.not]: null
                      }
                    }
                  }
                }
              }
            }
      specicalCondition.push(eipIsAttachedZqlCondition)
    }

    if (guestOsTypeConditions?.length > 0) {
      const conditions = []
      guestOsTypeConditions?.[0]?.values?.map(it => {
        conditions.push({
          guestOsType: {
            [ZOp.like]: it
          }
        })
      })
      specicalCondition.push({
        [ZOp.or]: conditions
      })
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
        //非in notIn condition还原
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
          }
        })
      }
    }

    if (_extraConditionMap['qemuState']) {
      const qemuStateArr: string[] = _.uniq(
        _.compact(
          _.flatten([
            _extraConditionMap['qemuState'].value || _extraConditionMap['qemuState'].values
          ])
        )
      )
      const hasUnknown: boolean = _.includes(qemuStateArr, 'Unknown')

      //云主机处于关机状态 qemu会被删除 想达到过滤需新增条件
      if (hasUnknown) {
        specicalCondition.push({
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'KvmHypervisorInfo',
                    fields: ['uuid'],
                    condition: {
                      matchState: {
                        [ZOp.in]: qemuStateArr
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
                    tableName: 'KvmHypervisorInfo',
                    fields: ['uuid']
                  }
                }
              }
            }
          ]
        })
      } else {
        specicalCondition.push({
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'KvmHypervisorInfo',
                fields: ['uuid'],
                condition: {
                  matchState: {
                    [ZOp.in]: qemuStateArr
                  }
                }
              }
            }
          }
        })
      }
    }

    if (_extraConditionMap['__zoneUuid__']) {
      specicalCondition.push({
        vmUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VMInstance',
              fields: ['uuid'],
              condition: {
                zoneUuid: _extraConditionMap['__zoneUuid__'].value
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap['shareType']) {
      const shareType = _extraConditionMap['shareType'].values
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(shareType, 'VmInstanceVO')
      )
    }

    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'VmInstanceVO',
      conditions
    })
    if (resourceAttributeZqlCondition) {
      specicalCondition.push(resourceAttributeZqlCondition)
    }

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async ismemoryReservationOpened(uuid: string) {
    const data = await this.getResourceConfig.call({
      name: 'memory.auto.balloon',
      category: 'kvm',
      resourceUuid: uuid
    })

    return data?.value === 'true'
  }

  async getConsoleAddress(uuid: string) {
    //
    // 该API需要去host上获取信息，需要保证vm是running状态，并且host状态正常。
    /*
     *
     * 这里只考虑了vm是running的情况，host状态不对会导致vm状态变化，如：迁移中/未知等
     * 理论上这里要查询host的状态，根据host的状态才能判断是否要做查询。
     * 但是如jira中描述，这里是人为促使host变化，其结果可能导致查询host状态，host状态是正常的，调用GetVmConsoleAddress的时候host状态又变成了不正常。
     * 所以这里用Promise.race 加1秒的时间限制来处理该问题。如果1秒内没有返回，有可能是网络问题，也有可能是host状态不对。
     *
     */
    const resp = await Promise.race([
      this.getVmConsoleAddressAction.call({ uuid }),
      new Promise(function (resolve, reject) {
        setTimeout(() => {
          resolve({
            vdiPortInfo: undefined
          })
        }, 1000)
      }) as {
        hostIp?: string
        port?: number
        protocol?: string
        vdiPortInfo?: any
      }
    ])

    if (!resp?.vdiPortInfo) {
      return []
    }
    switch (resp?.protocol) {
      case 'vnc':
        return [`vnc://${resp.hostIp}:${resp?.vdiPortInfo?.vncPort}`]
      case 'spice':
        return !resp.vdiPortInfo.spiceTlsPort
          ? [`spice://${resp.hostIp}:${resp.vdiPortInfo.spicePort}`]
          : [`spice://${resp.hostIp}?tls-port=${resp.vdiPortInfo.spiceTlsPort}`]
      case 'vncAndSpice':
        return !resp.vdiPortInfo.spiceTlsPort
          ? [
              `vnc://${resp.hostIp}:${resp.vdiPortInfo.vncPort}`,
              `spice://${resp.hostIp}:${resp.vdiPortInfo.spicePort}`
            ]
          : [
              `vnc://${resp.hostIp}:${resp.vdiPortInfo.vncPort}`,
              `spice://${resp.hostIp}?tls-port=${resp.vdiPortInfo.spiceTlsPort}`
            ]
      default:
        return []
    }
  }

  async getInstanceWithSnapshotGroup() {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'volumesnapshotGroup',
            fields: ['vmInstanceUuid']
          }
        }
      }
    }

    return zqlCondition
  }

  async getKeyProviderRelatedResource(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions) as Record<string, string>
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'Tpm',
            fields: ['vmInstanceUuid'],
            condition: {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'EncryptedResourceKeyRef',
                    fields: ['resourceUuid'],
                    condition: {
                      providerUuid: conditionsMap.providerUuid
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

  async getVmInstanceTemplateBySharedResource({
    param,
    isShared
  }: {
    param: any
    isShared?: boolean
  }): Promise<ZqlObject['condition']> {
    const zqlCondition = {
      [ZOp.and]: [
        {
          ...(await this.getVmInstanceTemplate())
        },
        {
          ...this.zsvSharedResourceQueryService.getSharedResourceList(
            param.extraConditions,
            'VmInstanceVO',
            isShared
          )
        }
      ]
    }
    return zqlCondition
  }

  async getVmInstanceTemplate() {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'templatedVminstance',
            fields: ['uuid']
          }
        }
      }
    }

    return zqlCondition
  }

  async getVmInstanceTemplateRelatedVM(param) {
    const { extraConditions } = param

    const extraConditionsMap = conditionsToObject(extraConditions)

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'templatedVmInstanceRef',
            fields: ['vmInstanceUuid'],
            condition: {
              templatedVmInstanceUuid: extraConditionsMap['templatedVMUuid']
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getEipAttachCandidateCondition(param) {
    const { extraConditions, conditions } = param

    const extraConditionsMap = conditionsToObject(extraConditions)
    const conditionsMap = conditionsToObject(conditions)

    const condition: any = {
      eipUuid: extraConditionsMap['eipUuid']
    }

    if (conditionsMap['name']) {
      condition.vmName = {
        [ZOp.eq]: conditionsMap['name']
      }
    }

    if (conditionsMap['uuid']) {
      condition.vmUuid = {
        [ZOp.eq]: conditionsMap['uuid']
      }
    }

    const zqlCondition = {
      'vmNics.uuid': {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetEipAttachableVmNics',
            output: 'inventories.uuid',
            condition
          }
        }
      },
      state: {
        [ZOp.in]: ['Running', 'Stopped']
      },
      type: 'UserVm'
    }

    return zqlCondition
  }

  async getBackupJobAttachableVM(extraConditions) {
    const conditionMap = conditionsToObject(extraConditions)
    const currentSchedulerJobGroupUuids = conditionMap['__currentSchedulerJobGroupUuids__'] ?? []
    const zqlCondition = {
      rootVolumeUuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SchedulerJob',
            fields: ['targetResourceUuid'],
            condition: {
              schedulerJobGroupUuids: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'SchedulerJobGroup',
                    fields: ['uuid'],
                    condition: {
                      uuid: {
                        [ZOp.notIn]: currentSchedulerJobGroupUuids
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

    return zqlCondition
  }

  async getCdpTaskAttachableVM() {
    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
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
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['vmInstanceUuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.not]: null // 本来创建云盘备份任务的时候要求必须挂载了云主机，但是可能用户先创建云盘备份任务再删除云主机就会出现问题。 //
                  },
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJob',
                        fields: ['targetResourceUuid'],
                        condition: {
                          [ZOp.or]: [
                            {
                              schedulerJobGroupUuids: {
                                [ZOp.in]: {
                                  [ZOp.query]: {
                                    tableName: 'SchedulerJobGroup',
                                    fields: ['uuid']
                                  }
                                }
                              }
                            },
                            {
                              jobClassName: {
                                [ZOp.in]: [
                                  'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob',
                                  'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob'
                                ]
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
      ]
    }

    return zqlCondition
  }

  async getCandidatesVmForCreateVmSnapshot() {
    const zqlCondition = {
      uuid: {
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
    }

    return zqlCondition
  }

  //
  async GetCandidatesVmForCreateVmSnapshotGroup() {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'vminstance',
            fields: ['uuid'],
            condition: {
              'allVolumes.primaryStorage.uuid': {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'PrimaryStorage',
                    fields: 'uuid',
                    condition: {
                      type: {
                        [ZOp.in]: ['Ceph']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        [ZOp.notIn]: {
          [ZOp.and]: {
            [ZOp.query]: {
              tableName: 'CdpTaskResourceRef',
              fields: ['resourceUuid'],
              condition: {
                resourceType: 'VmInstanceVO'
              }
            },
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'vminstance',
                fields: ['uuid'],
                condition: {
                  'allVolumes.primaryStorage.uuid': {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'PrimaryStorage',
                        fields: 'uuid',
                        condition: {
                          type: {
                            [ZOp.in]: ['Ceph']
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

    return zqlCondition
  }

  async getCandidatesVmForCreateVmSnapshotJob() {
    const zqlCondition = {
      [ZOp.and]: [
        //cdp任务逻辑
        {
          uuid: {
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
        //定时任务逻辑
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'vminstance',
                fields: ['uuid'],
                condition: {
                  rootVolumeUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'schedulerjob',
                        fields: ['targetResourceUuid'],
                        condition: {
                          jobClassName: {
                            [ZOp.in]: [
                              'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob',
                              'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob'
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
        }
      ]
    }

    return zqlCondition
  }

  async GetCandidatesVmForCreateVmSnapshotGroupJob() {
    const zqlCondition = {
      [ZOp.and]: [
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'volume',
                fields: ['vmInstanceUuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'volume',
                        fields: ['uuid'],
                        condition: {
                          uuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'schedulerjob',
                                fields: ['targetResourceUuid'],
                                condition: {
                                  jobClassName: {
                                    [ZOp.in]: [
                                      'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob',
                                      'org.zstack.scheduler.snapshot.CreateVolumeSnapshotJob'
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
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'vminstance',
                fields: ['uuid'],
                condition: {
                  'allVolumes.primaryStorage.uuid': {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'PrimaryStorage',
                        fields: 'uuid',
                        condition: {
                          type: {
                            [ZOp.in]: ['Ceph']
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            [ZOp.notIn]: {
              [ZOp.and]: {
                [ZOp.query]: {
                  tableName: 'CdpTaskResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'VmInstanceVO'
                  }
                },
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'vminstance',
                    fields: ['uuid'],
                    condition: {
                      'allVolumes.primaryStorage.uuid': {
                        [ZOp.notIn]: {
                          [ZOp.query]: {
                            tableName: 'PrimaryStorage',
                            fields: 'uuid',
                            condition: {
                              type: {
                                [ZOp.in]: ['Ceph']
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
      ]
    }

    return zqlCondition
  }

  async getCandidatesVmForAttachSshKeyPair(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['__SshKeyPairUuids__']
    const params = _.pick(conditionsMap, candidateKeys) as {
      __SshKeyPairUuids__: string | string[]
    }

    const sshKeyPairUuids = _.compact(_.flatten([params?.__SshKeyPairUuids__]))

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SshKeyPairRef',
            fields: ['resourceUuid'],
            condition: {
              sshKeyPairUuid: {
                [ZOp.in]: sshKeyPairUuids
              }
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getCandidatesVmForDetachSshKeyPair(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['__SshKeyPairUuids__']
    const params = _.pick(conditionsMap, candidateKeys) as {
      __SshKeyPairUuids__: string | string[]
    }

    const sshKeyPairUuids = _.compact(_.flatten([params?.__SshKeyPairUuids__]))

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SshKeyPairRef',
            fields: ['resourceUuid'],
            condition: {
              sshKeyPairUuid: {
                [ZOp.in]: sshKeyPairUuids
              }
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getVmCandidatesForAttachingScsiLun(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['scsiLunUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      scsiLunUuid: string
    }

    const zqlCondition = {
      hostUuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'ScsiLunHostRef',
            fields: ['hostUuid'],
            condition: {
              [ZOp.and]: [
                {
                  scsiLunUuid: params?.scsiLunUuid
                },
                {
                  scsiLunUuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'ScsiLun',
                        fields: ['uuid'],
                        condition: {
                          wwid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'SharedBlock',
                                fields: ['diskUuid']
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
          }
        }
      },
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'ScsiLunVmInstanceRef',
            fields: ['vmInstanceUuid'],
            condition: {
              [ZOp.and]: [
                {
                  scsiLunUuid: params?.scsiLunUuid
                },
                {
                  scsiLunUuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'ScsiLun',
                        fields: ['uuid'],
                        condition: {
                          wwid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'SharedBlock',
                                fields: ['diskUuid']
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
          }
        }
      }
    }

    return params?.scsiLunUuid ? zqlCondition : undefined
  }

  async getVmCandidatesForDetachScsiLun(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['scsiLunUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      scsiLunUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'ScsiLunVmInstanceRef',
            fields: ['vmInstanceUuid'],
            condition: {
              scsiLunUuid: params?.scsiLunUuid
            }
          }
        }
      }
    }

    return params?.scsiLunUuid ? zqlCondition : undefined
  }

  async getDataVolumeAttachableVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
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

    return params?.volumeUuid ? zqlCondition : _zqlCondition
  }

  async getVmBySe() {
    return {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'MdevDevice',
            fields: ['vmInstanceUuid'],
            condition: {
              vmInstanceUuid: { [ZOp.not]: null }
            }
          }
        }
      }
    }
  }

  async getInstanceWithSnapshotStrategy(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const params = _.pick(conditionsMap, '__schedulerJobGroupUuid__')
    const zqlCondition = {
      rootVolumeUuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SchedulerJob',
            fields: ['targetResourceUuid'],
            condition: {
              schedulerJobGroupUuids: {
                [ZOp.in]: [params['__schedulerJobGroupUuid__']]
              },
              state: {
                [ZOp.eq]: SchedulerJobState.Enabled
              }
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getCandidatesForSnapshotStrategy() {
    const zqlCondition: any[] = [
      {
        state: {
          [ZOp.notIn]: [
            VmInstanceState.Destroyed,
            VmInstanceState.Destroying,
            VmInstanceState.Expunging
          ]
        }
      },
      {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: 'vmInstanceUuid'
            }
          }
        }
      },
      {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ScsiLunVmInstanceRef',
              fields: ['vmInstanceUuid']
            }
          }
        }
      },
      {
        rootVolumeUuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SchedulerJob',
              fields: ['targetResourceUuid'],
              condition: {
                jobClassName: {
                  [ZOp.eq]: 'org.zstack.scheduler.snapshot.CreateVolumeSnapshotGroupJob'
                },
                state: {
                  [ZOp.eq]: SchedulerJobState.Enabled
                },
                schedulerJobGroupUuids: {
                  [ZOp.notIn]: ['']
                }
              }
            }
          }
        }
      },
      {
        // XXX: 定时快照 后端暂时只支持 Ceph 主存储
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'VmInstance',
              fields: ['uuid'],
              condition: {
                'allVolumes.primaryStorage.uuid': {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'PrimaryStorage',
                      fields: 'uuid',
                      condition: {
                        type: {
                          [ZOp.ne]: 'Ceph'
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
    return { [ZOp.and]: zqlCondition }
  }

  async getVmBySchedulerJobGroup(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['schedulerJobGroupUuids']
    const params = _.pick(conditionsMap, candidateKeys) as {
      schedulerJobGroupUuids: string[] | string
    }
    const zqlCondition = {
      [ZOp.or]: [
        {
          rootVolumeUuid: {
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
        },
        {
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
      ]
    }

    return params?.schedulerJobGroupUuids ? zqlCondition : undefined
  }

  async getVmForPortForwardingAttachVmNic(param) {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPortForwardingAttachableVmNics',
            output: 'inventories.vmInstanceUuid',
            condition: {
              ruleUuid: `${conditionsToObject(param.extraConditions)['ruleUuid']}`
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getAffinityGroupAttachableVM(param) {
    const conditionsMap = conditionsToObject(param?.extraConditions) as any
    const zqlCondition = {
      uuid: {
        [ZOp.in]: `getapi(api='GetCandidateVMForAttachingAffinityGroup',output='inventories.uuid',affinityGroupUuid='${conditionsMap?.affinityGroupUuid}')`
      }
    }
    return zqlCondition
  }

  getAccountRelatedVms(param) {
    const conditionsMap = conditionsToObject(param?.extraConditions)
    const accountUuid = conditionsMap?.['accountUuid']
    const zoneUuid = conditionsMap?.['zoneUuid']
    const commonConditions = {
      type: 'UserVm',
      state: {
        [ZOp.ne]: 'Destroyed'
      },
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'accountResourceRef',
            fields: ['resourceUuid'],
            condition: {
              resourceType: 'VmInstanceVO',
              type: 'Own',
              accountUuid
            }
          }
        }
      }
    }
    if (zoneUuid) {
      return {
        zoneUuid,
        ...commonConditions
      }
    }
    return commonConditions
  }

  getVmByVmGroup(param) {
    const conditionsMap = conditionsToObject(param?.conditions)
    const extraConditionsMap = conditionsToObject(param?.extraConditions)
    const schedulingStateList = conditionsMap?.['schedulingState']
    const vmGroupUuid = extraConditionsMap?.['vmGroupUuid']
    const vmSchedulingRuleUuid = extraConditionsMap?.['vmSchedulingRuleUuid']
    if (vmSchedulingRuleUuid && schedulingStateList?.length) {
      console.log('schedulingStateList===', schedulingStateList)
      return {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmSchedulingRuleGroupRef',
              fields: ['vmUuid'],
              condition: {
                vmGroupUuid: vmGroupUuid,
                vmUuid: {
                  [ZOp.in]: {
                    [ZOp.getapi]: {
                      action: ZQLAction.GET_API,
                      api: 'ListVmsFromSchedulingState',
                      output: 'uuids',
                      condition: {
                        ruleUuid: vmSchedulingRuleUuid,
                        executeStates: {
                          [ZOp.in]: schedulingStateList
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
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'VmSchedulingRuleGroupRef',
            fields: ['vmUuid'],
            condition: {
              vmGroupUuid: vmGroupUuid
            }
          }
        }
      }
    }
  }

  getCpuMode(uuid: string) {
    return this.getCpuModeDataloader.load(uuid)
  }

  _getCpuMode = async (uuids: string[]) => {
    const zql = ZQL.multStringify([
      {
        tableName: 'ResourceConfig',
        fields: ['resourceUuid', 'resourceType', 'value'],
        condition: {
          name: 'vm.cpuMode',
          category: 'kvm',
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])

    // 这里的resourceType一般是 'VmInstanceVO', 暂时不修改condition
    const { results } = await this.zqlService.call(zql)
    const resourceConfigList = results?.[0]?.inventories ?? []

    const cpuModeMap = _.reduce(
      resourceConfigList,
      (obj, item) => {
        if (!obj[item.resourceUuid]) {
          obj[item.resourceUuid] = {
            value: item?.value,
            dependentResourceType: item?.resourceType
          }
        }
        return obj
      },
      {}
    )

    // 无资源配置的资源UUID
    const noResourceConfigUuids = _.differenceWith(
      uuids,
      resourceConfigList,
      (uuid, resourceConfig) => uuid === _.get(resourceConfig, 'resourceUuid')
    )

    if (noResourceConfigUuids?.length > 0) {
      try {
        await Promise.all(
          noResourceConfigUuids.map(resourceUuid =>
            this.getResourceConfig
              .call({
                name: 'vm.cpuMode',
                category: 'kvm',
                resourceUuid: resourceUuid
              })
              .then(resp => {
                // 这里的resourceType 一般没有 'VmInstanceVO'
                const effectiveConfigs = _.get(resp, 'effectiveConfigs', [])
                let resourceType = DependentResourceType.GlobalConfig // effectiveConfigs 不存在的话表示使用的是全局配置。

                if (effectiveConfigs?.length > 0) {
                  // 随机找一个，其实应该按照Host PrimaryStorage Cluster等资源顺序来查找。目前Host 没有资源配置。
                  const effectiveConfig = _.find(effectiveConfigs, it => it?.value === resp?.value)

                  resourceType = effectiveConfig?.resourceType || resourceType
                }

                _.set(cpuModeMap, resourceUuid, {
                  value: resp?.value,
                  dependentResourceType: resourceType
                })
              })
          )
        )
      } catch (error) {
        console.log(error)
      }
    }

    return uuids.map(uuid => _.get(cpuModeMap, uuid, null))
  }

  getSystemTags = async (uuids: string[]) => {
    const vmTimeSyncList = await this.getVmTimeSync(uuids)
    const vmTimeBIOSList = await this.getBIOSSync(uuids)

    // const params: QueryParam = {
    //   conditions: [{ key: 'resourceUuid', op: Op.in, values: uuids }],
    //   start: 0,
    //   limit: 1000
    // }

    const paramsByChunk: QueryParam[] = _.chunk(uuids, 20).map(_uuids => ({
      conditions: [{ key: 'resourceUuid', op: Op.in, values: _uuids }],
      start: 0,
      limit: 1000
    }))

    let _systemTagList = []

    await Promise.all(
      paramsByChunk.map(params =>
        this.apiQuerySystemTagAction
          .call(params)
          .then(resp => (_systemTagList = _systemTagList.concat(resp.inventories)))
      )
    )

    // const resp = await this.apiQuerySystemTagAction.call(params)
    const systemTagList = [..._systemTagList, ...vmTimeSyncList, ...vmTimeBIOSList]
    const systemGroup = _.groupBy(systemTagList, 'resourceUuid')
    const systemMap = {}
    uuids.forEach(uuid => {
      if (!systemGroup[uuid]) {
        systemMap[uuid] = null
      } else {
        const tagMap = {
          isoList: [],
          vmCpuPinningList: [],
          haStickStragedy: true,
          staticIp: [],
          vmDriver: false
        }
        systemGroup[uuid].forEach(item => {
          const tag = item.tag.split('::')
          switch (tag[0]) {
            case 'iso':
              tagMap.isoList.push({
                uuid: tag[1],
                index: tag[2]
              })
              break
            case 'bootOrderOnce':
            case 'RDPEnable':
            case 'usbRedirect':
              tagMap[tag[0]] = tag[1] === 'true'
              break
            case 'qemuga':
            case 'autoReleaseSpecReleatedPhysicalPciDevice':
            case 'autoReleaseSpecReleatedVirtualPciDevice':
              tagMap[tag[0]] = true
              break
            case 'resourceBindings':
              if (tag[1].includes('Cluster')) {
                tagMap.haStickStragedy = false
              }
              break
            case 'bootOrder':
              tagMap[tag[0]] = tag[1].split(',')
              break
            case 'cleanTraffic':
              tagMap['antiSpoofing'] = tag[1] === 'true'
              break
            case 'userdata':
              tagMap[tag[0]] = Utf8Base64.decode(tag[1])
              break
            case 'staticIp':
              tagMap.staticIp.push({
                l3NetworkUuid: tag?.[1],
                ip: tag?.[2]
              })
              break
            case 'vmCpuPinning':
              tagMap['vmCpuPinningList'] = tag[1]
                ?.split(';')
                ?.slice(0, -1)
                ?.filter(val => !!val)
                ?.map(cv => {
                  const [vCPU, pCPU] = cv?.split(':')
                  return {
                    vCPU,
                    pCPU
                  }
                })
              break
            case 'driver':
              tagMap['vmDriver'] = true
              break
            case 'hostname':
              tagMap['hostname'] = tag[1]
              break
            case 'qxlMemory':
              tagMap['qxlMemory'] = {
                ram: +tag?.[1] || null,
                vram: +tag?.[2] || null,
                vgamem: +tag?.[3] || null
              }
              break
            default:
              tagMap[tag[0]] = tag[1]
              break
          }
        })
        systemMap[uuid] = tagMap
      }
    })
    return systemMap
  }

  getBIOSSync = async (uuids: string[]) => {
    const zql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        condition: {
          name: 'vm.clock.track',
          category: 'vm'
        }
      },
      {
        tableName: 'ResourceConfig',
        condition: {
          name: 'vm.clock.track',
          category: 'vm',
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])
    const { results } = await this.zqlService.call(zql)
    const globalVmBIOSSync = results[0]?.inventories[0]?.value ?? 'guest'
    const BIOSSyncList = results[1]?.inventories ?? []

    const timeSyncMap = _.reduce(
      BIOSSyncList,
      (obj, item) => {
        if (!obj[item.resourceUuid]) {
          obj[item.resourceUuid] = item
        }
        return obj
      },
      {}
    )

    uuids.forEach(uuid => {
      let timeSyncItem = timeSyncMap[uuid]
      if (!timeSyncItem) {
        timeSyncItem = {
          uuid: genUuid(),
          resourceUuid: uuid,
          name: 'vm.clock.track',
          category: 'vm'
        }
        timeSyncMap[uuid] = timeSyncItem
      }
      timeSyncItem.value = timeSyncItem.value ?? globalVmBIOSSync
      timeSyncItem.tag = `clockTrack::${timeSyncItem.value}`
    })

    return Object.values(timeSyncMap)
  }

  getVmTimeSync = async (uuids: string[]) => {
    const zql = ZQL.multStringify([
      {
        tableName: 'GlobalConfig',
        condition: {
          name: 'vm.clock.sync.interval.in.seconds',
          category: 'vm'
        }
      },
      {
        tableName: 'ResourceConfig',
        condition: {
          name: 'vm.clock.sync.interval.in.seconds',
          category: 'vm',
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])
    const { results } = await this.zqlService.call(zql)
    const globalVmTimeSync = results[0]?.inventories[0]?.value ?? 0
    const timeSyncList = results[1]?.inventories ?? []

    const timeSyncMap = _.reduce(
      timeSyncList,
      (obj, item) => {
        if (!obj[item.resourceUuid]) {
          obj[item.resourceUuid] = item
        }
        return obj
      },
      {}
    )

    uuids.forEach(uuid => {
      let timeSyncItem = timeSyncMap[uuid]
      if (!timeSyncItem) {
        timeSyncItem = {
          uuid: genUuid(),
          resourceUuid: uuid,
          name: 'vm.clock.sync.interval.in.seconds',
          category: 'vm'
        }
        timeSyncMap[uuid] = timeSyncItem
      }
      timeSyncItem.value = timeSyncItem.value ?? globalVmTimeSync
      timeSyncItem.tag = `timeTrack::${timeSyncItem.value}`
    })

    return Object.values(timeSyncMap)
  }

  getVmInstanceSystemTag(uuid) {
    return this.systemTagDataLoader.load(uuid)
  }

  getVmHa(uuid) {
    return this.vmHaDataLoader.load(uuid)
  }

  _getVmHa = async (uuids: string[]) => {
    // ZSV-7867: 通过 VmHaVO 查询 VM 的高可用配置
    const zqlObject = {
      tableName: 'vmHa',
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const { results } = await this.zqlService.call(ZQL.stringify(zqlObject))
    const vmHaList = results?.[0]?.inventories ?? []
    const vmHaMap = _.keyBy(vmHaList, 'uuid')
    return uuids.map(uuid => vmHaMap[uuid] ?? null)
  }

  _getVmInstanceSystemTag = async (uuids: string[]) => {
    const systemMap = await this.getSystemTags(uuids)
    return uuids.map(uuid => {
      if (!systemMap[uuid]) {
        return null
      }
      // vmMachineType 为 "pc" 时实际是 i440fx，参见 ZSV-11754
      if (systemMap[uuid].vmMachineType === 'pc') {
        systemMap[uuid].vmMachineType = 'i440fx'
      }
      return systemMap[uuid]
    })
  }

  getAffinityGroup(vmUuid) {
    return this.vmAffinityGroupDataloader.load(vmUuid)
  }

  _getAffinityGroup = async (uuids: string[]) => {
    const zqlObject = _.map(uuids, uuid => {
      return {
        tableName: 'AffinityGroup',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AffinityGroupUsage',
                fields: ['affinityGroupUuid'],
                condition: {
                  resourceUuid: uuid
                }
              }
            }
          }
        },
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const vmAffinityGroupMap = _.reduce(
      results,
      (obj, it) => {
        // 这里应该取数组
        obj[it.name] = _.get(it, ['inventories', '0'])
        return obj
      },
      {}
    )
    return uuids.map(uuid => _.get(vmAffinityGroupMap, uuid, null))
  }

  getVmGroup(vmUuid) {
    return this.vmGroupDataloader.load(vmUuid)
  }

  _getVmGroup = async (uuids: string[]) => {
    const relatedZqlObject = {
      tableName: 'VmSchedulingRuleGroupRef',
      fields: ['vmGroupUuid', 'vmUuid'],
      condition: {
        vmUuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const { results: relatedResults } = await this.zqlService.call(ZQL.stringify(relatedZqlObject))
    const vmGroupMapVm = relatedResults?.[0]?.inventories

    const vmGroupZqlObject = {
      tableName: 'VmSchedulingRuleGroup',
      condition: {
        uuid: {
          [ZOp.in]: vmGroupMapVm?.map(it => it?.vmGroupUuid)
        }
      }
    }

    const { results: vmGroupResults } = await this.zqlService.call(ZQL.stringify(vmGroupZqlObject))
    const vmGroupList = vmGroupResults?.[0]?.inventories

    return uuids.map(uuid => {
      const vmGroupUuid = vmGroupMapVm?.find(it => it?.vmUuid === uuid)?.vmGroupUuid
      return vmGroupList?.find(it => it?.uuid === vmGroupUuid)
    })
  }

  getEmulatorPin = async uuid => {
    const result = await this.getVmEmulatorPinningAction.call({ uuid })
    return result.emulatorPinning ?? ''
  }

  getCdpTaskStatus(uuid) {
    return this.vmCdpTaskStatusDataLoader.load(uuid)
  }

  _getCdpTaskStatus = async (uuids: string[]) => {
    const vmUuids = _.uniq(uuids)
    const multZql = [
      {
        tableName: 'CdpTaskResourceRef',
        fields: ['resourceUuid', 'taskUuid'],
        condition: {
          resourceType: 'VmInstanceVO',
          resourceUuid: {
            [ZOp.in]: vmUuids
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
                    [ZOp.in]: vmUuids
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

    return uuids.map(uuid => _.get(cdpTaskMap, [_.get(vmTaskUuidMap, uuid, null), 'status'], null))
  }

  getBackupTaskType(uuid) {
    return this.vmBackupTaskTypeDataLoader.load(uuid)
  }

  _getBackupTaskType = async (uuids: string[]) => {
    const vmUuids = _.uniq(uuids)
    const multZql = [
      {
        // CDP task
        tableName: 'CdpTaskResourceRef',
        action: ZQLAction.COUNT,
        groupBy: 'resourceUuid',
        condition: {
          resourceType: 'VmInstanceVO',
          resourceUuid: {
            [ZOp.in]: vmUuids
          }
        }
      },
      {
        // 备份任务
        tableName: 'VmInstance',
        action: ZQLAction.COUNT,
        groupBy: 'uuid',
        condition: {
          [ZOp.and]: [
            {
              uuid: {
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
                              jobClassName: {
                                [ZOp.in]: [
                                  'org.zstack.storage.backup.CreateVmBackupJob',
                                  'org.zstack.storage.backup.CreateRootVolumeBackupJob'
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
            },
            {
              uuid: {
                [ZOp.in]: uuids
              }
            }
          ]
        }
      }
    ]

    const zql = ZQL.multStringify(multZql)
    const { results } = await this.zqlService.call(zql)

    const cdpTaskCountResult: any[] = _.get(results, ['0', 'inventoryCounts'], [])
    const backUpTaskCountResult: any[] = _.get(results, ['1', 'inventoryCounts'], [])

    const resultMap = {}

    _.forEach(cdpTaskCountResult || [], item => {
      const [vmInfo, total = 0] = item
      _.set(resultMap, [vmInfo.resourceUuid, 'cdpTaskCount'], total)
    })

    _.forEach(backUpTaskCountResult || [], item => {
      const [vmInfo, total = 0] = item
      _.set(resultMap, [vmInfo.uuid, 'backUpTaskCount'], total)
    })

    return uuids.map(uuid => {
      const cdpTaskCount = _.get(resultMap, [uuid, 'cdpTaskCount'], 0)
      const backUpTaskCount = _.get(resultMap, [uuid, 'backUpTaskCount'], 0)
      if (cdpTaskCount > 0) {
        return VmBackupTaskType.CdpTask
      } else if (backUpTaskCount > 0) {
        return VmBackupTaskType.BackupTask
      } else {
        return null
      }
    })
  }

  getSshKeyPairNum(uuid) {
    return this.sshKeyPairNumDataLoader.load(uuid)
  }

  _getSshKeyPairNum = async (uuids: string[]) => {
    const vmZql = {
      tableName: 'SshKeyPairRef',
      action: ZQLAction.COUNT,
      groupBy: 'resourceUuid',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(vmZql)
    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = _.get(results, ['0', 'inventoryCounts'], [])

    const pairMap = _.reduce(
      inventoryCounts,
      (obj, it) => {
        const [pairInfo, total = 0] = it

        obj[pairInfo?.resourceUuid] = total

        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(pairMap, uuid, 0))
  }

  getVMBackupJob(uuid) {
    return this.vmBackupJobDataLoader.load(uuid)
  }

  _getVMBackupJob = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'VmInstance',
      fields: ['uuid'],
      condition: {
        [ZOp.and]: [
          {
            uuid: {
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
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const vmMap = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, it) => {
        obj[it.uuid] = true
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(vmMap, uuid, false))
  }

  getBackupStatus(rootVolumeUuid) {
    return this.vmBackupStatusDataLoader.load(rootVolumeUuid)
  }

  _getBackupStatus = async (uuids: string[]) => {
    const uuidBatches = _.chunk(uuids, 50)

    const inventoryCounts = []

    // 并行执行所有批次查询
    await Promise.all(
      uuidBatches.map(async batch => {
        const zqlObject = {
          action: ZQLAction.COUNT,
          groupBy: 'targetResourceUuid',
          tableName: 'LongJob',
          condition: {
            targetResourceUuid: { [ZOp.in]: batch },
            jobName: {
              [ZOp.in]: ['APICreateVolumeBackupMsg', 'APICreateVmBackupMsg']
            },
            state: 'Running'
          }
        }

        const zql = ZQL.stringify(zqlObject)
        const { results } = await this.zqlService.call(zql)
        const batchCounts = _.get(results, ['0', 'inventoryCounts'], [])
        inventoryCounts.push(...batchCounts)
      })
    )

    const volumeMap = _.reduce(
      inventoryCounts,
      (obj, it) => {
        const [job = {}, total = 0] = it
        obj[job?.targetResourceUuid] = total > 0 ? 'BackingUp' : 'Ready'
        return obj
      },
      {}
    )

    return uuids.map(uuid => volumeMap[uuid] || 'Ready')
  }

  getRelatedResource(vm) {
    this.vmRelatedResourceMap[vm.uuid] = {
      uuid: vm.uuid,
      vmNic: vm.vmNics.length,
      volume: vm.allVolumes.length
    }
    return this.vmRelatedResourceDataLoader.load(vm)
  }

  _getRelatedResource = async vms => {
    const snapshotQueryCondition = []
    const alarmQueryCondition = []
    const schedulerJobCondition = []
    const backupDataCondition = []
    const detachedVolumeCondition = []
    vms.forEach(vm => {
      snapshotQueryCondition.push({
        tableName: 'volumesnapshot',
        condition: { volumeUuid: vm.rootVolumeUuid },
        namedAs: vm.uuid,
        action: ZQLAction.COUNT
      })
      alarmQueryCondition.push({
        tableName: 'alarm',
        condition: { 'labels.value': vm.uuid },
        namedAs: vm.uuid,
        action: ZQLAction.COUNT
      })
      schedulerJobCondition.push({
        tableName: 'schedulerJob',
        condition: { targetResourceUuid: vm.uuid },
        namedAs: vm.uuid,
        action: ZQLAction.COUNT
      })
      backupDataCondition.push({
        tableName: 'volumeBackup',
        condition: {
          volumeUuid: {
            [ZOp.in]: [vm.uuid, vm.rootVolumeUuid]
          },
          status: 'Ready',
          'backupStorage.__systemTag__': {
            [ZOp.in]: ['onlybackup', 'allowbackup']
          }
        },
        namedAs: vm.uuid,
        action: ZQLAction.COUNT
      })
      detachedVolumeCondition.push({
        tableName: 'volume',
        condition: {
          lastVmInstanceUuid: vm.uuid,
          vmInstanceUuid: {
            [ZOp.is]: null
          }
        },
        namedAs: vm.uuid,
        action: ZQLAction.COUNT
      })
    })
    const snapshotZql = ZQL.multStringify(snapshotQueryCondition)
    const alarmZql = ZQL.multStringify(alarmQueryCondition)
    const schedulerJobZql = ZQL.multStringify(schedulerJobCondition)
    const backupDataZql = ZQL.multStringify(backupDataCondition)
    const detachedVolumeZql = ZQL.multStringify(detachedVolumeCondition)

    const snapshotResp = await this.zqlService.call(snapshotZql)
    const alarmResp = await this.zqlService.call(alarmZql)
    const schedulerJobResp = await this.zqlService.call(schedulerJobZql)
    const backupDataResp = await this.zqlService.call(backupDataZql)
    const detachedVolumeResp = await this.zqlService.call(detachedVolumeZql)

    return vms.map(vm => {
      const uuid = vm.uuid
      const snapshot = snapshotResp.results.find(item => item.name === uuid)
      const alarm = alarmResp.results.find(item => item.name === uuid)
      const schedulerJob = schedulerJobResp.results.find(item => item.name === uuid)
      const backupData = backupDataResp.results.find(item => item.name === uuid)
      const lastVolume = detachedVolumeResp.results.find(item => item.name === uuid)
      return {
        snapshot: _.get(snapshot, 'total', 0),
        alarm: _.get(alarm, 'total', 0),
        schedulerJob: _.get(schedulerJob, 'total', 0),
        backupData: _.get(backupData, 'total', 0),
        lastVolume: _.get(lastVolume, 'total', 0),
        ...this.vmRelatedResourceMap[uuid]
      }
    })
  }

  getAttachedShareableVolumeList(uuid) {
    this.vmAttachedShareableVolumeListMap[uuid] = {
      uuid,
      shareableVolumeList: []
    }
    return this.vmAttachedShareableVolumeListDataLoader.load(uuid)
  }

  _getAttachedShareableVolumeList = async uuidList => {
    const zqlObject = {
      tableName: 'ShareableVolumeVmInstanceRef',
      fields: ['vmInstanceUuid', 'volumeUuid'],
      condition: {
        vmInstanceUuid: {
          [ZOp.in]: _.uniq(uuidList)
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const shareableVolumeVmInstanceRefList = results?.[0]?.inventories ?? []

    shareableVolumeVmInstanceRefList.forEach(item => {
      this.vmAttachedShareableVolumeListMap[item.vmInstanceUuid].shareableVolumeList.push(
        item.volumeUuid
      )
    })
    return uuidList.map(uuid => this.vmAttachedShareableVolumeListMap[uuid].shareableVolumeList)
  }

  queryEip(vm) {
    return this.vmEipDataLoader.load(vm)
  }

  _queryEip = async vmList => {
    const params: QueryParam = {
      conditions: [
        {
          key: 'vmNic.vmInstanceUuid',
          op: Op.in,
          values: vmList.map(vm => vm.uuid)
        }
      ],
      start: 0,
      limit: 1000
    }
    try {
      const resp = await this.apiQueryEipAction.call(params)
      return vmList.map(vm => {
        return resp.inventories.filter(item => !!vm.vmNics.find(nic => nic.uuid === item.vmNicUuid))
      })
    } catch {
      // 权限不足或其他错误时，不让整个查询失败，返回空列表占位
      return vmList.map(() => [])
    }
  }

  querySecurityGroup(uuid) {
    return this.vmSecurityGroupDataLoader.load(uuid)
  }

  _querySecurityGroup = async uuidList => {
    const multVmZql = uuidList.map(uuid => {
      return {
        tableName: 'SecurityGroup',
        fields: ['uuid', 'name'],
        condition: {
          ['vmNic.vmInstanceUuid']: uuid
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
    return uuidList.map(uuid => {
      const securityGroupList = _.get(vmMap, uuid)
      if (securityGroupList) {
        return securityGroupList
      } else {
        return null
      }
    })
  }
  async queryBootOrder(uuid): Promise<BootOrderResp> {
    const param = {
      uuid: uuid
    }
    const { orders } = await this.getVmBootOrderAction.call(param)
    return {
      orders
    }
  }

  getVmCdRoms(uuid) {
    return this.vmCdRomsDataLoader.load(uuid)
  }

  _getVmCdRoms = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'VmCdRom',
      condition: {
        'vmInstance.uuid': {
          [ZOp.in]: uuids
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const vmCdRoms = results?.[0]?.inventories
    const vmCdRomMap = _.reduce(
      vmCdRoms,
      (obj, item) => {
        if (!obj[item.vmInstanceUuid]) {
          obj[item.vmInstanceUuid] = [item]
        } else {
          obj[item.vmInstanceUuid].push(item)
        }
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      return _.get(vmCdRomMap, uuid, [])
    })
  }

  getGpuDeviceSpec(uuid) {
    return this.gpuDeviceSpecDataLoader.load(uuid)
  }

  _getGpuDeviceSpec = async (uuids: string[]) => {
    const zqlObj = [
      {
        tableName: 'vminstancemdevdevicespecref',
        condition: {
          vmInstanceUuid: {
            [ZOp.in]: uuids
          }
        }
      },
      {
        tableName: 'vminstancepcidevicespecref',
        condition: {
          vmInstanceUuid: {
            [ZOp.in]: uuids
          }
        }
      },
      {
        tableName: 'mdevdevicespec',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'vminstancemdevdevicespecref',
                fields: ['mdevSpecUuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: uuids
                  }
                }
              }
            }
          }
        }
      },
      {
        tableName: 'pcidevicespec',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'vminstancepcidevicespecref',
                fields: ['pciSpecUuid'],
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: uuids
                  }
                }
              }
            }
          }
        }
      }
    ]
    const resp = await this.zqlService.call(ZQL.multStringify(zqlObj))
    const mdevSpecMap = {}
    const pciSpecMap = {}
    resp.results[2].inventories.forEach(item => {
      mdevSpecMap[item.uuid] = item
    })
    resp.results[3].inventories.forEach(item => {
      pciSpecMap[item.uuid] = item
    })
    const res = uuids.map(uuid => {
      const result = []
      resp.results[0].inventories.forEach(item => {
        if (item.vmInstanceUuid === uuid) {
          result.push({
            uuid: item.mdevSpecUuid,
            name: mdevSpecMap[item.mdevSpecUuid].name,
            deviceType: VGpuDeviceType.MdevDevice,
            type: 'mdev',
            isVirtual: true
          })
        }
      })
      resp.results[1].inventories.forEach(item => {
        if (item.vmInstanceUuid === uuid) {
          result.push({
            uuid: item.pciSpecUuid,
            name: pciSpecMap[item.pciSpecUuid].name,
            deviceType: VGpuDeviceType.PciDevice,
            type: 'pci',
            isVirtual: pciSpecMap[item.pciSpecUuid].isVirtual
          })
        }
      })
      return result
    })
    return res
  }

  getVmInstanceGlobalConfig(uuid) {
    return this.globalConfigDataLoader.load(uuid)
  }

  _getVmInstanceGlobalConfig = async (uuids: string[]) => {
    const { inventories } = await this.queryGlobalConfigAction.call({})
    const cdromLimit = inventories[0]
    let vmMap
    return uuids.map(uuid => {
      vmMap[uuid] = { cdromLimit: Number(cdromLimit) }
    })
  }

  getVolumeAttributeUserConfig(uuid, rootVolumeUuid) {
    this.volumeAttributeUserConfigMap[uuid] = {
      uuid,
      rootVolumeUuid
    }
    return this.volumeAttributeUserConfigDataloader.load(uuid)
  }

  _getVolumeAttributeUserConfig = async (uuids: string[]) => {
    const rootVolumeUuids = uuids.map(
      uuid => this.volumeAttributeUserConfigMap[uuid].rootVolumeUuid
    )
    const { inventories = [] } = await this.apiQuerySystemTagAction.call({
      conditions: [
        { key: 'resourceUuid', op: Op.in, values: rootVolumeUuids },
        { key: 'resourceType', value: 'VolumeVO' },
        { key: 'tag', op: Op.like, value: 'volumeAttributeUserConfig' }
      ]
    })
    return uuids.map(uuid => {
      const tag = inventories.find(
        item => item.resourceUuid === this.volumeAttributeUserConfigMap[uuid].rootVolumeUuid
      )
      if (!tag) {
        return null
      }
      return tag.tag.split('volumeAttributeUserConfig::')[1]
    })
  }

  requestConsoleAccess = async (uuid: string) => {
    const param = {
      vmInstanceUuid: uuid
    }
    const { inventory } = await this.requestConsoleAccessAction.call(param)
    return inventory
  }

  getCapabilities(uuid) {
    return this.vmCapabilitiesDataLoader.load(uuid)
  }

  _getCapabilities = async (uuids: string[]) => {
    const { vmsCaps } = await this.getVmsCapabilitiesAction.call({
      vmUuids: uuids
    })

    return uuids.map(uuid => ({
      LiveMigration: vmsCaps?.[uuid]?.supportLiveMigration ?? false,
      MemorySnapshot: vmsCaps?.[uuid]?.supportMemorySnapshot ?? false,
      Reimage: vmsCaps?.[uuid]?.supportReimage ?? false,
      VolumeMigration: vmsCaps?.[uuid]?.supportVolumeMigration ?? false
    }))
  }

  getVmToolsInfo = async (uuid: string) => {
    const toolsInfo = {
      lowVersion: false
    }

    try {
      const _toolsInfo = await this.getVmGuestToolsInfoAction.call({ uuid })

      _.assign(toolsInfo, _toolsInfo)
    } catch (error) {
      console.log('GetVmGuestToolsInfo error: ', error)
    }

    try {
      const zql = ZQL.stringify({
        tableName: 'GuestToolsState',
        fields: ['platform', 'qgaState', 'version'],
        condition: {
          vmInstanceUuid: uuid
        }
      })
      const guestResp = await this.zqlService.call(zql)
      const guestInfo = _.get(guestResp, ['results', '0', 'inventories', '0'])

      _.set(toolsInfo, 'version', _.get(toolsInfo, 'version', _.get(guestInfo, 'version')))

      if (!guestInfo || guestInfo?.platform === 'FreeBSD') {
        _.set(toolsInfo, 'lowVersion', false)
        return toolsInfo
      }

      if (guestInfo?.qgaState === 'NotUpgraded') {
        _.set(toolsInfo, 'lowVersion', true)
        return toolsInfo
      }

      const latestTool = await this.getLatestGuestToolsForVmAction.call({
        uuid
      })
      const latestVersion = latestTool?.inventory?.version

      _.set(
        toolsInfo,
        'lowVersion',
        !!latestVersion && !!guestInfo?.version && latestVersion !== guestInfo?.version
      )
    } catch (error) {}

    return toolsInfo
  }

  isToolsLowVersion = async (uuid: string) => {
    try {
      const zql = ZQL.stringify({
        tableName: 'GuestToolsState',
        condition: { vmInstanceUuid: uuid }
      })
      const guestResp = await this.zqlService.call(zql)
      const guestInfo = guestResp?.results?.[0]?.inventories?.[0]
      if (!guestInfo || guestInfo?.platform === 'FreeBSD') {
        return false
      }

      if (guestInfo?.qgaState === 'NotUpgraded') {
        return true
      }
      const laestTool = await this.getLatestGuestToolsForVmAction.call({
        uuid
      })
      const laestVersion = laestTool?.inventory?.version
      return !!laestVersion && !!guestInfo?.version && laestVersion !== guestInfo?.version
    } catch {}
  }

  getGuestToolsState = async (uuid: string, platform: string, hostUuid: string) => {
    let toolsState = GuestToolsState.Unsupport
    const resp = await this.apiQuerySystemTagAction.call({
      conditions: [
        { key: 'resourceUuid', value: hostUuid },
        { key: 'resourceType', value: 'HostVO' },
        { key: 'tag', op: Op.like, value: 'hostCpuModelName::' }
      ]
    })

    const vm = await this.apiQueryVmInstanceService.call({
      conditions: [
        {
          key: 'uuid',
          value: uuid
        }
      ],
      fields: ['guestOsType']
    })
    const guestOsType = vm?.inventories?.[0]?.guestOsType

    if (
      resp.inventories &&
      resp.inventories[0] &&
      resp.inventories[0].tag.indexOf('aarch64') < 0 &&
      (_.includes(['Windows', 'WindowsVirtio', 'Linux'], platform) || guestOsType === 'FreeBSD')
    ) {
      toolsState = GuestToolsState.Uninstall
      const zql = ZQL.stringify({
        tableName: 'GuestToolsState',
        condition: { vmInstanceUuid: uuid }
      })
      const guestResp = await this.zqlService.call(zql)
      const guestInfo = guestResp?.results?.[0]?.inventories?.[0]
      if (
        ['NotRunning', 'Running', 'NotUpgraded'].includes(guestInfo?.qgaState) ||
        ['Running', 'NotRunning'].includes(guestInfo?.zwatchState)
      ) {
        toolsState = GuestToolsState.Installed
      }
    }

    return toolsState
  }

  async getSummarys(params) {
    const stateList = ['total', 'running', 'stopped', 'paused', 'other', 'available', 'destroyed']
    const result = {}
    await Promise.all(
      stateList.map(state => {
        return this.getSummary(state, params).then(resp => {
          result[state] = resp
        })
      })
    )
    return result
  }

  async getSummary(state, params: IQueryAction) {
    const { conditions, type } = params
    const baseConditions: ICondition[] = (
      [
        {
          key: 'type',
          op: Op.eq,
          value: 'UserVm'
        },
        {
          key: 'hypervisorType',
          op: Op.ne,
          value: 'ESX'
        }
      ] as ICondition[]
    ).concat(conditions)

    switch (state) {
      case 'available':
        baseConditions.push({
          key: 'state',
          op: Op.ne,
          value: 'Destoryed'
        })
        break
      case 'other':
        baseConditions.push({
          key: 'state',
          op: Op.notIn,
          values: ['Destroyed', 'Running', 'Stopped']
        })
        break
      case 'total':
        break
      default:
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          values: state.charAt(0).toUpperCase() + state.slice(1)
        })
        break
    }

    const zqlObject = {
      tableName: 'vmInstance',
      condition: QueryConditionTranslator.translate(baseConditions),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    return resp.results?.[0]?.total || 0
  }

  async getCpuMemoryCapacity(zoneUuid: string) {
    const results = await this.getCpuMemoryCapacityAction.call({
      zoneUuids: [zoneUuid]
    })
    return _.pick(results, ['availableCpu', 'availableMemory'])
  }

  async getQuota(accountUuid: string) {
    const { usages } = await this.getAccountQuotaUsageAction.call({
      uuid: accountUuid
    })
    return usages
  }

  async queryCustomCpuMode() {
    const params = {
      category: 'kvm',
      name: 'vm.cpuMode'
    }
    const { options } = await this.getGlobalConfigOptions.call(params)
    return {
      list: options?.validValue || []
    }
  }

  async getOvfFileInfo(ovfFile: string) {
    return this.parseOvfAction.call({ xmlBase64: ovfFile })
  }
  async getOvfExportList(args: QueryExportArgs) {
    // return this.parseOvfAction.call()
    const _zqlCondition = this.buildZqlCondition(args.conditions, [])

    const zqlObject = {
      tableName: 'ImagePackage',
      condition: _zqlCondition,
      returnWith: {
        total: true
      },
      orderBy: args.sortBy,
      orderDirection: args.sortDirection,
      limit: args.limit,
      offset: args.start
    }
    const zql = ZQL.stringify(zqlObject)

    const vmResp = await this.zqlService.call(zql)
    return {
      list: vmResp.results[0].inventories.map(ele => {
        const { format, ...other } = ele
        return other
      }),
      total: vmResp.results[0].total
    }
  }

  getVmGroupPath(uuid) {
    return this.vmGroupPathDataLoader.load(uuid)
  }

  _getVmGroupPath = async (uuids = []) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'directory',
        condition: {
          type: 'default',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['directoryUuid'],
                condition: {
                  resourceUuid: {
                    [ZOp.eq]: uuid
                  }
                }
              }
            }
          }
        },
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const vmGroupMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0'], {
          groupName: '',
          uuid: '-2',
          type: 'default'
        })
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      return _.get(vmGroupMap, uuid, null)
    })
  }

  _getVmInstanceQemuState = async (uuids = []) => {
    const zqlObject = uuids.map(uuid => {
      return {
        tableName: 'KvmHypervisorInfo',
        condition: {
          uuid
        },
        namedAs: uuid
      }
    })

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const vmQemuStateMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0'])
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const item = _.get(vmQemuStateMap, uuid, null)
      if (item) {
        return item?.matchState
      }
      return VmInstanceQemuState.Unknown
    })
  }

  getVmInstanceQemuState(uuid) {
    return this.vmQemuStateDataLoader.load(uuid)
  }

  getVmVnuma(uuid) {
    return this.vmVnumaDataloader.load(uuid)
  }

  _getVmVnuma = async (uuids = []) => {
    const zqlObject = {
      tableName: 'systemTag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: 'vmNumaEnable::true'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const systemtags = results?.[0]?.inventories ?? []
    return uuids.map(uuid => {
      const tag = systemtags?.find(it => it.resourceUuid === uuid)
      return tag ? true : false
    })
  }

  getVmDeleteOperator(uuid) {
    return this.vmDeleteOperatorDataloader.load(uuid)
  }

  _getVmDeleteOperator = async (uuids: string[] = []) => {
    // 一个 Audits 查询需要8秒，下面的查询差不多要30秒，所以用GetResourceNames代替
    const zqlObject = [
      {
        tableName: 'Audits',
        fields: ['operator', 'operatorAccountUuid', 'resourceUuid', 'createTime'],
        condition: {
          resourceUuid: {
            [ZOp.in]: _.uniq(uuids)
          },
          apiName: 'org.zstack.header.vm.APIDestroyVmInstanceMsg'
        }
      }
      // { // 其实可用GetResourceNames代替，等待有缘人验证后再修改。
      //   tableName: 'Account',
      //   fields: ['name', 'uuid'],
      //   condition: {
      //     uuid: {
      //       [ZOp.in]: {
      //         [ZOp.query]: {
      //           tableName: 'Audits',
      //           fields: ['operatorAccountUuid'],
      //           condition: {
      //             resourceUuid: {
      //               [ZOp.in]: _.uniq(uuids)
      //             },
      //             apiName: 'org.zstack.header.vm.APIDestroyVmInstanceMsg'
      //           }
      //         }
      //       }
      //     }
      //   }
      // },
      // { // 其实可用GetResourceNames代替，等待有缘人验证后再修改。
      //   tableName: 'IAM2Project',
      //   fields: ['name', 'uuid'],
      //   condition: {
      //     uuid: {
      //       [ZOp.in]: {
      //         [ZOp.query]: {
      //           tableName: 'Audits',
      //           fields: ['operatorAccountUuid'],
      //           condition: {
      //             resourceUuid: {
      //               [ZOp.in]: _.uniq(uuids)
      //             },
      //             apiName: 'org.zstack.header.vm.APIDestroyVmInstanceMsg'
      //           }
      //         }
      //       }
      //     }
      //   }
      // },
      // { // 其实可用GetResourceNames代替，等待有缘人验证后再修改。
      //   tableName: 'IAM2VirtualID',
      //   fields: ['name', 'uuid'],
      //   condition: {
      //     uuid: {
      //       [ZOp.in]: {
      //         [ZOp.query]: {
      //           tableName: 'Audits',
      //           fields: ['operatorAccountUuid'],
      //           condition: {
      //             resourceUuid: {
      //               [ZOp.in]: _.uniq(uuids)
      //             },
      //             apiName: 'org.zstack.header.vm.APIDestroyVmInstanceMsg'
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const audits = _.get(results, ['0', 'inventories'], []) || []
    // const accounts = _.get(results, ['1', 'inventories'], []) || []
    // const IAM2Projects = _.get(results, ['2', 'inventories'], []) || []
    // const IAM2VirtualIDs = _.get(results, ['3', 'inventories'], []) || []

    const operatorAccountUuids = []
    const vmDeleteOperatorMap = _.reduce(
      audits,
      (obj, it) => {
        obj[it?.resourceUuid] = {
          operator: it?.operator,
          operatorAccountUuid: it?.operatorAccountUuid,
          operatorState: OperatorState.ACTIVE,
          createTime: it?.createTime,
          apiName: 'org.zstack.header.vm.APIDestroyVmInstanceMsg'
        }

        operatorAccountUuids.push(it?.operatorAccountUuid)

        return obj
      },
      {}
    )

    const resourceUuidsList = _.chunk(operatorAccountUuids, 50)
    const notDeletedResourceMap = {}

    await Promise.allSettled(
      _.map(resourceUuidsList, async resourceUuids => {
        return await this.getResourceAccount
          .call({
            resourceUuids
          })
          .then(resp => {
            _.forEach(_.get(resp, 'inventories', []), it => {
              _.set(notDeletedResourceMap, it?.uuid, true)
            })
          })
      })
    )

    return uuids.map(uuid => {
      const vmDeleteOperator = _.get(vmDeleteOperatorMap, uuid)
      const operatorAccountUuid = _.get(vmDeleteOperator, 'operatorAccountUuid')
      const operator = _.get(vmDeleteOperator, 'operator')

      return {
        ...vmDeleteOperator,
        operatorState:
          _.get(notDeletedResourceMap, operatorAccountUuid) || operator === 'admin'
            ? OperatorState.ACTIVE
            : OperatorState.DELETED
      }
    })

    // const accountMap = _.reduce(accounts, (obj, it) => {
    //   obj[it?.uuid] = it?.name
    //   return obj
    // }, {})

    // const IAM2ProjectMap = _.reduce(IAM2Projects, (obj, it) => {
    //   obj[it?.uuid] = it?.name
    //   return obj
    // }, {})

    // const IAM2VirtualIDMap = _.reduce(IAM2VirtualIDs, (obj, it) => {
    //   obj[it?.uuid] = it?.name
    //   return obj
    // }, {})

    // return uuids.map(uuid => {
    //   const vmDeleteOperator = _.get(vmDeleteOperatorMap, uuid)
    //   const operatorAccountUuid = _.get(vmDeleteOperator, 'operatorAccountUuid')
    //   const operator = _.get(vmDeleteOperator, 'operator')

    //   return {
    //     ...vmDeleteOperator,
    //     operatorState: (_.get(accountMap, operatorAccountUuid, _.get(IAM2ProjectMap, operatorAccountUuid, _.get(IAM2VirtualIDMap, operatorAccountUuid, false))) || operator === 'admin') ? OperatorState.ACTIVE : OperatorState.DELETED,
    //   }
    // })
  }

  backupTaskStatus(uuid) {
    return this.backupTaskStatusDataloader.load(uuid)
  }

  _backupTaskStatus = async (uuids = []) => {
    const zqlObject = {
      tableName: 'SchedulerJob',
      condition: {
        targetResourceUuid: {
          [ZOp.in]: uuids
        },
        jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories ?? []
    return uuids.map(uuid => {
      const schedulerJob = inventories?.find(it => it.targetResourceUuid === uuid)
      return schedulerJob?.state
    })
  }
  queryVmUsage(uuid) {
    return this.queryVmUsageDataloader.load(uuid)
  }

  _queryVmUsage = async (uuids = []) => {
    const zqlObject = {
      tableName: 'vminstance',
      fields: ['uuid'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'CPUAverageUsedUtilization',
            namespace: 'ZStack/VM',
            metricName: 'CPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'OperatingSystemCPUAverageUsedUtilization',
            namespace: 'ZStack/VM',
            metricName: 'OperatingSystemCPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'MemoryUsedInPercent',
            namespace: 'ZStack/VM',
            metricName: 'MemoryUsedInPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'OperatingSystemMemoryUsedPercent',
            namespace: 'ZStack/VM',
            metricName: 'OperatingSystemMemoryUsedPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'DiskUsedCapacityInBytes',
            namespace: 'ZStack/VM',
            metricName: 'DiskUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          }
        ]
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const {
      CPUAverageUsedUtilization,
      OperatingSystemCPUAverageUsedUtilization,
      MemoryUsedInPercent,
      OperatingSystemMemoryUsedPercent,
      DiskUsedCapacityInBytes
    } = results?.[0]?.returnWith ?? {}

    const filterVmValue = (metricData, uuid: string) => {
      return metricData?.find(it => it?.labels?.VMUuid === uuid)?.value
    }

    return uuids.map(uuid => {
      return {
        cpuUsed:
          filterVmValue(OperatingSystemCPUAverageUsedUtilization, uuid) ??
          filterVmValue(CPUAverageUsedUtilization, uuid),
        memoryUsed:
          filterVmValue(OperatingSystemMemoryUsedPercent, uuid) ??
          filterVmValue(MemoryUsedInPercent, uuid),
        storageUsed: filterVmValue(DiskUsedCapacityInBytes, uuid)
      }
    })
  }

  getVmUsage = async uuid => {
    const zqlObject = {
      tableName: 'vminstance',
      fields: ['uuid'],
      condition: {
        uuid
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'CPUAverageUsedUtilization',
            namespace: 'ZStack/VM',
            metricName: 'CPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'OperatingSystemCPUAverageUsedUtilization',
            namespace: 'ZStack/VM',
            metricName: 'OperatingSystemCPUAverageUsedUtilization',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'MemoryUsedInPercent',
            namespace: 'ZStack/VM',
            metricName: 'MemoryUsedInPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'OperatingSystemMemoryUsedPercent',
            namespace: 'ZStack/VM',
            metricName: 'OperatingSystemMemoryUsedPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'DiskUsedCapacityInBytes',
            namespace: 'ZStack/VM',
            metricName: 'DiskUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          }
        ]
      }
    }
    const resp = await this.zqlService.call(ZQL.stringify(zqlObject))
    const {
      CPUAverageUsedUtilization,
      OperatingSystemCPUAverageUsedUtilization,
      MemoryUsedInPercent,
      OperatingSystemMemoryUsedPercent,
      DiskUsedCapacityInBytes
    } = resp.results?.[0]?.returnWith ?? {}
    return {
      cpuUsed:
        OperatingSystemCPUAverageUsedUtilization?.[0]?.value ??
        CPUAverageUsedUtilization?.[0]?.value,
      memoryUsed: OperatingSystemMemoryUsedPercent?.[0]?.value ?? MemoryUsedInPercent?.[0]?.value,
      storageUsed: DiskUsedCapacityInBytes?.[0]?.value
    }
  }

  getScsiLun(uuid) {
    return this.vmScsiLunDataloader.load(uuid)
  }

  _getScsiLun = async (uuids: string[]) => {
    const genZql = uuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'ScsiLunVmInstanceRef',
        fields: ['vmInstanceUuid'],
        condition: {
          vmInstanceUuid: uuid
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

  getLastBackupJobResult(rootVolumeUuid: string) {
    return this.lastBackupJobResultDataloader.load(rootVolumeUuid)
  }

  _getLastBackupJobResult = async (rootVolumeUuids: string[]) => {
    const zqlObjs = rootVolumeUuids.map(rootVolumeUuid => ({
      tableName: 'SchedulerJobHistory',
      condition: {
        targetResourceUuid: {
          [ZOp.eq]: rootVolumeUuid
        }
      },
      orderBy: 'startTime',
      orderDirection: 'desc' as const,
      limit: 1
    }))
    const zql = ZQL.multStringify(zqlObjs)
    const { results = [] } = await this.zqlService.call(zql)
    const resultMap = results.reduce((prev, curr) => {
      const value = curr.inventories?.[0]
      if (!value) {
        return prev
      }
      prev[value.targetResourceUuid] = value
      return prev
    }, {})
    return rootVolumeUuids.map(uuid => resultMap[uuid])
  }

  getLocalBackupCount(uuid: string) {
    return this.localBackupCountDataloader.load(uuid)
  }

  _getLocalBackupCount = async (uuids: string[]) => {
    const zqlObj = {
      action: ZQLAction.COUNT,
      tableName: 'VolumeBackup',
      groupBy: 'vmInstanceUuid',
      condition: {
        vmInstanceUuid: {
          [ZOp.in]: uuids
        },
        type: 'Root',
        'backupStorage.__systemTag__': {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        },
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
                          [ZOp.in]: ['onlybackup', 'allowbackup']
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
    const zql = ZQL.stringify(zqlObj)
    const { results } = await this.zqlService.call(zql)
    const counts = results?.[0]?.inventoryCounts ?? []
    const countsMap = new Map(counts.map(([{ vmInstanceUuid }, value]) => [vmInstanceUuid, value]))
    return uuids.map(uuid => countsMap.get(uuid))
  }

  getLocalBackupSize(uuid: string) {
    return this.localBackupSizeDataloader.load(uuid)
  }

  _getLocalBackupSize = async (uuids: string[]) => {
    const zqlObj = {
      action: ZQLAction.SUM,
      tableName: 'VolumeBackup',
      fields: ['size'],
      sumBy: 'vmInstanceUuid',
      condition: {
        vmInstanceUuid: {
          [ZOp.in]: uuids
        },
        'backupStorage.__systemTag__': {
          [ZOp.in]: ['onlybackup', 'allowbackup']
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results } = await this.zqlService.call(zql)
    const counts = results?.[0]?.inventories ?? []
    const countsMap = new Map(counts.map(([uuid, value]) => [uuid, value]))
    return uuids.map(uuid => countsMap.get(uuid))
  }

  getBackupJob(rootVolumeUuid: string) {
    return this.backupJobDataloader.load(rootVolumeUuid)
  }

  _getBackupJob = async (rootVolumeUuids: string[]) => {
    const zqlObj = {
      tableName: 'SchedulerJob',
      condition: {
        jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob',
        schedulerJobGroupUuids: {
          [ZOp.notIn]: ['']
        },
        targetResourceUuid: {
          [ZOp.in]: rootVolumeUuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObj)
    const { results = [] } = await this.zqlService.call(zql)
    const resultMap = new Map(
      (results[0]?.inventories ?? []).map(item => [item.targetResourceUuid, item])
    )
    return rootVolumeUuids.map(uuid => resultMap.get(uuid))
  }

  getUserGroup(vmUuid: string) {
    return this.userGroupDataloader.load(vmUuid)
  }

  _getUserGroup = async (vmUuids: string[]) => {
    const genZql = (vmUuid: string) => {
      return {
        tableName: 'AccountGroup',
        fields: ['uuid', 'name'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountGroupResourceRef',
                fields: ['groupUuid'],
                condition: {
                  resourceUuid: {
                    [ZOp.eq]: vmUuid
                  }
                }
              }
            }
          }
        },
        namedAs: vmUuid
      }
    }
    const zql = ZQL.multStringify(vmUuids.map(vmUuid => genZql(vmUuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const userGroupMap = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories'], [])
        return obj
      },
      {}
    )

    return vmUuids.map(vmUuid => {
      const userGroup = userGroupMap[vmUuid]
      if (userGroup.length) {
        return userGroup
      } else {
        return []
      }
    })
  }

  async queryVmDns(param: IQueryAction) {
    const zqlCondtion = QueryConditionTranslator.translate(param.conditions)
    const zqlObject = {
      tableName: 'VmDns',
      condition: zqlCondtion,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const total = resp?.results?.[0]?.total ?? 0
    return { list, total }
  }
}
