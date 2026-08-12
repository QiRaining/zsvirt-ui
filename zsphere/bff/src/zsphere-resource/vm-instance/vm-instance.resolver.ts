import { Inject } from '@nestjs/common'
import { Args, Float, Info, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import * as _ from 'lodash'

import { conditionsToObject, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { FlattenVmInstanceAction } from '@/api/zstack/FlattenVmInstanceAction'
import { GetLatestGuestToolsForVmAction } from '@/api/zstack/GetLatestGuestToolsForVmAction'
import { GetVmHostnameAction } from '@/api/zstack/GetVmHostnameAction'
import { TakeVmConsoleScreenshotAction } from '@/api/zstack/TakeVmConsoleScreenshotAction'
import { UpdateGuestToolsStateAction } from '@/api/zstack/UpdateGuestToolsStateAction'
import { State, VmInstanceState } from '@/common/enum'
import { VmMetricDataLoader } from '@/common/metric-data/vm-metric-data-loader'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import ZQL from '@/common/zql/index'
import { BackupStorageDataloader } from '@/hardware-resource/backup-storage/backup-storage.dataloader'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { HostVO } from '@/hardware-resource/host/host.model'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'
import { TpmInventory } from '@/hardware-resource/tpm/tpm.model'
import { TpmService } from '@/hardware-resource/tpm/tpm.service'
import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { UserGroup } from '@/zsphere-administration/user-group/user-group.model'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'
import { AffinityGroupDataloader } from '@/zsphere-resource/affinity-group/affinity-group.dataloader'
import { AffinityGroup } from '@/zsphere-resource/affinity-group/affinity-group.model'
import { CdRom } from '@/zsphere-resource/cdroms/cdroms.model'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'
import { Image } from '@/zsphere-resource/image/image.model'
import { InstanceOfferingDataloader } from '@/zsphere-resource/instance-offering/instance-offering.dataloader'
import { InstanceOffering } from '@/zsphere-resource/instance-offering/instance-offering.model'
import { VmGroup } from '@/zsphere-resource/vm-group/vm-group.model'
import {
  VmInstanceDataloader,
  VmInstanceExportDataloader
} from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { SshKeyPairQueryService } from '../ssh-key-pair/ssh-key-pair-query/ssh-key-pair-query.service'
import { VMGroupDirectory } from '../vm-directory-group/vm-directory-group.model'
import { GuestToolsStateDataloader } from './vm-instance-query/guestToolsState.dataloader'
import { ResourceConfigCrashDataloader } from './vm-instance-query/resourceConfigCrash.dataloader'
import { SnapshotSchedulerJobDataloader } from './vm-instance-query/snapshostSchedulerJob.dataloader'
import { ToolsDataloader } from './vm-instance-query/tools.dataloader'
import { VmInstanceQueryService } from './vm-instance-query/vm-instance-query.service'
import {
  BatchStorageMigrateVmInstancedepends,
  BootOrderResp,
  CdromConfigForVmCreate,
  CpuModelList,
  EipInVminstance,
  GetCpuMemoryCapacity,
  GetFlattenVmInstanceOccupyCapacityInput,
  GetHostNUMANodeArgs,
  GetHostResourceAllocationArgs,
  GetMaxPCpuNumForVmCreateType,
  GetVmMetricDataListArgs,
  GpuDeivceSpecOnVmInstance,
  GuestTool,
  GuestToolInfo,
  GuestToolsStateInfo,
  Hostname,
  HostNUMANode,
  HostResourceAllocation,
  MemorySnapshotByVm,
  NUMATopology,
  NUMATopologyArgs,
  OperatorInfo,
  OvfExportEntity,
  OvfExportEntityList,
  OvfFile,
  QueryExportArgs,
  QueryFlattenVmInstanceOccupyCapacityResp,
  QueryVmArgs,
  RelatedResource,
  RequestConsoleAccess,
  Screenshot,
  SecurityGroupInVminstance,
  StorageMigrateVmInstancedepends,
  ToolsState,
  VmBackupTaskType,
  VmCapabilities,
  VmDnsQueryResp,
  VmInstance,
  VmInstanceList,
  VmInstanceMetricData,
  VmInstanceSummary,
  VmInstanceSystemTag,
  VmHaVO,
  VmOwner,
  VmQueryType,
  VmUsage
} from './vm-instance.model'
import { VmInstanceService } from './vm-instance.service'

@Resolver(() => VmInstance)
export class VmInstanceResolver extends ResourceAttributeFieldResolver {
  @Inject() pubSubService: PubSubService
  @Inject() vmInstanceService: VmInstanceService
  @Inject() getVmHostnameAction: GetVmHostnameAction
  @Inject() getLatestGuestToolsForVmAction: GetLatestGuestToolsForVmAction
  @Inject() updateGuestToolsStateAction: UpdateGuestToolsStateAction
  @Inject() vmInstanceQueryService: VmInstanceQueryService
  @Inject() clusterDataloader: ClusterDataloader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() imageDataloader: ImageDataloader
  @Inject() instanceOfferingDataloader: InstanceOfferingDataloader
  @Inject() tagDataloader: TagsDataloader
  @Inject() zqlService: ZQLService
  @Inject() hostDataloader: HostDataloader
  @Inject() snapshotSchedulerJobDataloader: SnapshotSchedulerJobDataloader
  @Inject() vmMetricDataLoader: VmMetricDataLoader
  @Inject() sshKeyPairQueryService: SshKeyPairQueryService

  @Inject() affinityGroupDataloader: AffinityGroupDataloader

  @Inject() l3NetworkDataloader: L3NetworkDataloader
  @Inject() resourceConfigCrashDataloader: ResourceConfigCrashDataloader
  @Inject() vmInstanceExportDataloader: VmInstanceExportDataloader
  @Inject() toolsDataloader: ToolsDataloader
  @Inject() guestToolsStateDataloader: GuestToolsStateDataloader
  @Inject() flattenVmInstanceAction: FlattenVmInstanceAction
  @Inject() resourceConfigService: ResourceConfigService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() tpmService: TpmService

  @Query(() => VmInstanceList)
  async vmInstanceList(@Args() queryArgs: QueryVmArgs) {
    return await this.vmInstanceQueryService.get(queryArgs)
  }

  @Query(() => GuestTool)
  async guestToolStatus(@Args('uuid') uuid: string) {
    return this.vmInstanceQueryService.getGuestTool(uuid)
  }

  @Query(() => GuestToolInfo)
  async guestToolInfo(@Args('uuid') uuid: string) {
    return this.vmInstanceQueryService.getVmToolsInfo(uuid)
  }

  @Query(() => Hostname)
  async vmHostname(@Args('uuid') uuid: string) {
    return this.getVmHostnameAction.call({ uuid })
  }

  @Query(() => VmInstance, { nullable: true })
  async vmInstance(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.vmInstanceQueryService.get(queryArgs)
    const vm = result.list[0] ?? {}
    vm.updateToolState = true
    return vm
  }

  @Query(() => VmInstance, { nullable: true })
  async templatedVmInstance(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ],
      type: VmQueryType?.GetVmInstanceTemplate
    }
    const result = await this.vmInstanceQueryService.get(queryArgs)
    const vm = result.list[0] ?? {}
    vm.updateToolState = true
    return vm
  }

  @ResolveField(() => Boolean)
  async isTemplate(@Parent() _vm: VmInstance) {
    //这里实际上需要查，但现在不需要查
    return true
  }

  @Query(() => OvfFile, { nullable: false })
  async ovfFile(@Args({ name: 'ovf', type: () => String }) ovf: string) {
    const result = await this.vmInstanceQueryService.getOvfFileInfo(ovf)
    return {
      disks: result.ovfInfo.disks,
      name: result.ovfInfo.vmName,
      cpuNum: result.ovfInfo.cpu.quantity,
      memorySize: result.ovfInfo.memory.quantity
    }
  }

  @Query(() => RequestConsoleAccess)
  async getRequestConsoleAccess(@Args('uuid') uuid: string) {
    return await this.vmInstanceQueryService.requestConsoleAccess(uuid)
  }

  @Query(() => QueryFlattenVmInstanceOccupyCapacityResp)
  async getFlattenVmInstanceOccupyCapacity(
    @Args('input') input: GetFlattenVmInstanceOccupyCapacityInput
  ) {
    try {
      const { uuids } = input
      const result = await Promise.all(
        // 获取扁平化后的容量和真正执行扁平化的api都是 flattenVmInstanceAction，不同的是传入 dryRun 不会真正执行只会返回容量信息
        uuids.map(uuid => {
          return this.flattenVmInstanceAction.call({
            uuid,
            full: true,
            dryRun: true
          })
        })
      )
      const inventories = result?.map(it => it?.inventory)
      let volumeList = []
      inventories?.forEach(it => {
        volumeList = volumeList.concat(it.allVolumes)
      })
      return {
        list: volumeList,
        success: true
      }
    } catch (error) {
      return { error: error?.message ?? error, list: [], success: false }
    }
  }

  @ResolveField(() => VMGroupDirectory, {
    nullable: true,
    description: '云主机目录'
  })
  async group(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmGroupPath(vm.uuid)
  }

  @ResolveField(() => VmCapabilities, { nullable: true })
  async capabilities(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getCapabilities(vm.uuid)
  }

  @ResolveField(() => VmUsage, { nullable: true })
  async vmUsage(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.queryVmUsage(vm.uuid)
  }

  @ResolveField(() => String, { nullable: true })
  async cpuModeInfo(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getCpuMode(vm.uuid)
  }

  @ResolveField()
  async sshKeyPairs(@Parent() vm: VmInstance) {
    const queryArgs = {
      conditions: [
        {
          key: '__VmInstanceUuid__',
          op: Op.eq,
          value: vm?.uuid
        }
      ]
    }

    const { list = [] } = await this.sshKeyPairQueryService.queryList(queryArgs)

    return list
  }

  @ResolveField(() => Float, { defaultValue: 0 })
  async sshKeyPairNum(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getSshKeyPairNum(vm.uuid)
  }

  @ResolveField()
  async backupStatus(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getBackupStatus(vm.rootVolumeUuid)
  }

  @ResolveField()
  async cdpTaskStatus(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getCdpTaskStatus(vm.uuid)
  }

  @ResolveField(() => VmBackupTaskType, { nullable: true })
  async backupTaskType(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getBackupTaskType(vm.uuid)
  }

  @ResolveField()
  async qemuState(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmInstanceQemuState(vm.uuid)
  }

  @ResolveField(() => Cluster)
  async cluster(@Parent() vm: VmInstance) {
    return this.clusterDataloader.query(vm.uuid, vm.clusterUuid)
  }

  @ResolveField(() => L3Network)
  async defaultL3Network(@Parent() vm: VmInstance) {
    return this.l3NetworkDataloader.query(vm.uuid, vm.defaultL3NetworkUuid)
  }

  @ResolveField(() => [String])
  async consoleAddress(@Parent() vm: VmInstance) {
    return vm.state === 'Running'
      ? await this.vmInstanceQueryService.getConsoleAddress(vm.uuid)
      : []
  }

  @ResolveField(() => Boolean)
  async isMemoryReservationOpened(@Parent() vm: VmInstance) {
    return await this.vmInstanceQueryService.ismemoryReservationOpened(vm.uuid)
  }

  @ResolveField(() => HostVO)
  async host(@Parent() vm: VmInstance) {
    let hostUuid = vm.hostUuid
    if (vm.state === VmInstanceState.Stopped) {
      const zqlObject = {
        tableName: 'LocalStorageResourceRef',
        fields: 'hostUuid',
        condition: {
          resourceType: 'VolumeVO',
          resourceUuid: vm?.rootVolumeUuid
        }
      }
      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)
      hostUuid = _.get(results, ['0', 'inventories', '0', 'hostUuid'], vm.hostUuid)
    }
    return this.hostDataloader.query(`${vm.uuid}-${hostUuid}`, hostUuid)
  }

  @ResolveField(() => String)
  async volumeAttributeUserConfig(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVolumeAttributeUserConfig(vm.uuid, vm.rootVolumeUuid)
  }

  @ResolveField(() => String)
  async crashStrategy(@Parent() vm: VmInstance) {
    return this.resourceConfigCrashDataloader.query(vm.uuid)
  }

  @ResolveField(() => [TpmInventory], { defaultValue: [] })
  async tpmList(@Parent() vm: VmInstance) {
    const result = await this.tpmService.query({
      vmInstanceUuid: vm.uuid
    })
    return result.list || []
  }

  @ResolveField(() => HostVO)
  async lastHost(@Parent() vm: VmInstance) {
    return this.hostDataloader.query(`${vm.uuid}-${vm.lastHostUuid}`, vm.lastHostUuid)
  }

  @ResolveField(() => PrimaryStorage)
  async primaryStorage(@Parent() vm: VmInstance) {
    const rootVolume = _.find(vm.allVolumes, volume => volume.uuid === vm.rootVolumeUuid)
    const primaryStorageUuid: string = rootVolume?.primaryStorageUuid ?? ''
    return this.primaryStorageDataloader.query(vm.uuid, primaryStorageUuid)
  }

  @ResolveField(() => VmOwner)
  async owner(@Parent() vm: VmInstance) {
    return this.ownerDataLoader.query(vm.uuid)
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() vm: VmInstance) {
    return this.tagDataloader.query(vm.uuid)
  }

  @ResolveField(() => [CdRom])
  async vmCdRoms(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmCdRoms(vm.uuid)
  }

  @ResolveField(() => BootOrderResp, { nullable: true })
  async bootOrder(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.queryBootOrder(vm.uuid)
  }

  @ResolveField(() => InstanceOffering)
  async instanceOffering(@Parent() vm: VmInstance) {
    return this.instanceOfferingDataloader.query(vm.uuid, vm.instanceOfferingUuid)
  }

  @ResolveField(() => Image)
  async image(@Parent() vm: VmInstance) {
    return this.imageDataloader.query(vm.uuid, vm.imageUuid)
  }

  @ResolveField(() => ToolsState)
  async toolsState(@Parent() vm: VmInstance) {
    const { hostUuid, lastHostUuid, platform, guestOsType } = vm
    return this.toolsDataloader.query(vm.uuid, {
      hostUuid: hostUuid || lastHostUuid,
      platform,
      guestOsType
    })
  }

  @Query(() => GuestToolsStateInfo)
  async queryGuestToolsState(@Args('vmInstanceUuid') uuid: string) {
    return await this.guestToolsStateDataloader.query(uuid)
  }

  @ResolveField(() => GuestToolsStateInfo, {
    description: '直接查询GuestToolsState',
    nullable: true
  })
  async guestToolsState(@Parent() vm: VmInstance) {
    return this.guestToolsStateDataloader.query(vm.uuid)
  }

  @ResolveField()
  async toolsInfo(@Parent() vm: VmInstance) {
    if (_.includes([VmInstanceState.Running, VmInstanceState.VolumeRecovering], vm?.state)) {
      const result = await this.vmInstanceQueryService.getVmToolsInfo(vm.uuid)

      return {
        ...result
      }
    }

    return null
  }

  @ResolveField()
  async snapshotSchedulerJob(@Parent() vm: VmInstance) {
    return this.snapshotSchedulerJobDataloader.query(vm.rootVolumeUuid)
  }

  @ResolveField()
  async metric(@Parent() vm: VmInstance, @Info() param) {
    const { extraConditions = [] } = param.variableValues
    const conditionMap = conditionsToObject(extraConditions) as {
      metricName: string
    }
    if (!conditionMap.metricName) {
      return null
    }
    return this.vmMetricDataLoader.query(vm.uuid, vm.uuid, conditionMap.metricName)
  }

  @ResolveField(() => [EipInVminstance])
  async eip(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.queryEip(vm)
  }

  @ResolveField(() => [SecurityGroupInVminstance])
  async securityGroup(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.querySecurityGroup(vm.uuid)
  }

  @ResolveField(() => RelatedResource)
  async relatedResource(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getRelatedResource(vm)
  }

  @ResolveField(() => [String])
  async attachedShareableVolumeUuidList(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getAttachedShareableVolumeList(vm.uuid)
  }

  @ResolveField()
  async haveScsiLun(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getScsiLun(vm.uuid)
  }

  @ResolveField(() => [GpuDeivceSpecOnVmInstance])
  async gpuDeviceSpec(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getGpuDeviceSpec(vm.uuid)
  }

  @ResolveField(() => VmInstanceSystemTag)
  async systemTag(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmInstanceSystemTag(vm.uuid)
  }

  @ResolveField(() => VmHaVO, { nullable: true })
  async vmHa(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmHa(vm.uuid)
  }

  @ResolveField(() => Boolean)
  async hasBackupJob(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVMBackupJob(vm.uuid)
  }

  @ResolveField(() => Boolean)
  async hasTopology(@Parent() vm: VmInstance) {
    return this.vmInstanceService.getVMNUMATopology(vm.uuid)
  }

  @ResolveField(() => AffinityGroup)
  async affinityGroup(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getAffinityGroup(vm.uuid)
    // return this.affinityGroupDataloader.query(vm.uuid)
  }

  @ResolveField(() => VmGroup)
  async vmGroup(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmGroup(vm.uuid)
  }

  @ResolveField(() => OperatorInfo, { nullable: true })
  async operatorInfo(@Parent() vm: VmInstance) {
    if (_.includes([VmInstanceState.Destroyed], vm.state)) {
      return this.vmInstanceQueryService.getVmDeleteOperator(vm.uuid)
    }

    return null
  }

  @ResolveField(() => Boolean)
  async vnuma(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getVmVnuma(vm.uuid)
  }

  @ResolveField(() => String, { defaultValue: '' })
  async emulatorPin(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getEmulatorPin(vm.uuid)
  }

  @ResolveField(() => State)
  async backupTaskStatus(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.backupTaskStatus(vm.rootVolumeUuid)
  }

  @ResolveField()
  async lastBackupJobResult(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getLastBackupJobResult(vm.rootVolumeUuid)
  }

  @ResolveField()
  async localBackupCount(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getLocalBackupCount(vm.uuid)
  }

  @ResolveField()
  async backupJob(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getBackupJob(vm.rootVolumeUuid)
  }

  @ResolveField()
  async localBackupCapacity(@Parent() vm: VmInstance) {
    return this.vmInstanceQueryService.getLocalBackupSize(vm.uuid)
  }

  @ResolveField(() => String, { defaultValue: '' })
  async exportInfo(@Parent() vm: VmInstance) {
    return this.vmInstanceExportDataloader.query(vm.uuid, vm.uuid)
  }

  @ResolveField(() => String)
  async uptime(@Parent() vm: VmInstance) {
    if (vm.state === VmInstanceState.Running) {
      return this.vmInstanceService.getVMUptime(vm.uuid)
    }
    return null
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() vm: VmInstance): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(vm.uuid)
  }

  @ResolveField(() => [UserGroup])
  async userGroup(@Parent() vm: VmInstance) {
    return await this.vmInstanceQueryService.getUserGroup(vm.uuid)
  }

  @ResolveField()
  async zone(@Parent() vm: VmInstance) {
    return this.zoneDataloader.query(vm.uuid, vm.zoneUuid)
  }

  @Query(() => [[VmInstanceMetricData]])
  async vmMetricDataList(
    @Args()
    params: GetVmMetricDataListArgs
  ) {
    const { uuid, startTime, endTime, period, metricNames, namespace } = params
    return await this.vmInstanceService.getVmMetricDataList(
      uuid,
      startTime,
      endTime,
      period,
      metricNames,
      namespace
    )
  }

  @Query(() => StorageMigrateVmInstancedepends)
  async storageMigrateVmInstancedepends(@Args({ name: 'uuid', type: () => String }) uuid: string) {
    return await this.vmInstanceService.storageMigrateVmInstancedepends(uuid)
  }

  @Query(() => [BatchStorageMigrateVmInstancedepends])
  async batchStorageMigrateVmInstancedepends(
    @Args({ name: 'uuids', type: () => [String] }) uuids: string[]
  ) {
    return await this.vmInstanceService.batchStorageMigrateVmInstancedepends(uuids)
  }

  @Query(() => Int)
  async getMaxPCpuNum(
    @Args({ name: 'uuidList', type: () => [String] }) uuidList: string[],
    @Args({ name: 'type', type: () => GetMaxPCpuNumForVmCreateType })
    type: GetMaxPCpuNumForVmCreateType
  ) {
    return await this.vmInstanceService.getMaxPCpuNum(uuidList, type)
  }

  @Query(() => CdromConfigForVmCreate)
  async getCdromConfigForVmCreate() {
    return await this.vmInstanceService.getCdromConfigForVmCreate()
  }

  @Query(() => GetCpuMemoryCapacity)
  getCpuMemoryCapacity(@Args('uuid') zoneUuid: string) {
    return this.vmInstanceQueryService.getCpuMemoryCapacity(zoneUuid)
  }

  @Query(() => NUMATopology)
  async getNUMATopology(@Args() params: NUMATopologyArgs) {
    return await this.vmInstanceService.getNUMATopology(params)
  }

  @Query(() => HostResourceAllocation)
  async getHostResourceAllocation(@Args() params: GetHostResourceAllocationArgs) {
    return await this.vmInstanceService.getHostResourceAllocation(params)
  }

  @Query(() => HostNUMANode)
  async getHostNUMANode(@Args() params: GetHostNUMANodeArgs) {
    return await this.vmInstanceService.getHostNUMANode(params)
  }
  @Query(() => CpuModelList)
  async getCustomCpuMode() {
    return await this.vmInstanceQueryService.queryCustomCpuMode()
  }

  @Query(() => MemorySnapshotByVm)
  async getMemorySnapshotByVm(@Args('uuid') uuid: string) {
    return await this.vmInstanceService.getMemorySnapshotByVm(uuid)
  }

  @Query(() => VmDnsQueryResp)
  async queryVmDns(@Args() param: IQueryAction) {
    return await this.vmInstanceQueryService.queryVmDns(param)
  }
}

@Resolver(() => VmInstanceSummary)
export class VmInstanceSummaryResolver {
  @Inject() vmInstanceQueryService: VmInstanceQueryService

  @Query(() => VmInstanceSummary)
  async getVmInstanceSummary(@Args() queryArgs: IQueryAction) {
    return queryArgs || {}
  }

  @ResolveField(() => Int)
  async total(@Parent() queryArgs) {
    return this.vmInstanceQueryService.getSummary('total', queryArgs)
  }

  @ResolveField(() => Int)
  async destroyed(@Parent() queryArgs) {
    return await this.vmInstanceQueryService.getSummary('destroyed', queryArgs)
  }

  @ResolveField(() => Int)
  async available(@Parent() queryArgs) {
    return await this.vmInstanceQueryService.getSummary('available', queryArgs)
  }

  @ResolveField(() => Int)
  async running(@Parent() queryArgs) {
    return this.vmInstanceQueryService.getSummary('running', queryArgs)
  }

  @ResolveField(() => Int)
  async stopped(@Parent() queryArgs) {
    return this.vmInstanceQueryService.getSummary('stopped', queryArgs)
  }

  @ResolveField(() => Int)
  async unknown(@Parent() queryArgs) {
    return this.vmInstanceQueryService.getSummary('unknown', queryArgs)
  }

  @ResolveField(() => Int)
  async other(@Parent() queryArgs) {
    return this.vmInstanceQueryService.getSummary('other', queryArgs)
  }
}

@Resolver(OvfExportEntity)
export class VmInstanceExportResolver {
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() backupStorageDataloader: BackupStorageDataloader
  @Inject() vmInstanceQueryService: VmInstanceQueryService
  @Inject() tagDataloader: TagsDataloader

  @Query(() => OvfExportEntityList, { nullable: false })
  async ovfExportList(@Args() args: QueryExportArgs) {
    return await this.vmInstanceQueryService.getOvfExportList(args)
  }

  @ResolveField(() => VmInstance, { nullable: true })
  async vmInstance(@Parent() ovf: OvfExportEntity) {
    if (!ovf.vmUuid) {
      return null
    }
    const vmInstance = await this.vmInstanceDataloader.query(ovf.uuid, ovf.vmUuid)
    const tag = await this.tagDataloader.query(ovf.vmUuid)
    return { ...vmInstance, tag }
  }

  @ResolveField(() => BackupStorage)
  async backupStorage(@Parent() ovf: OvfExportEntity) {
    return this.backupStorageDataloader.query(ovf.backupStorageUuid, ovf.backupStorageUuid)
  }
}

@Resolver(VmUsage)
export class VmUsageResolver {
  @Inject() vmInstanceQueryService: VmInstanceQueryService

  @Query(() => VmUsage, { nullable: false })
  async vmUsage(@Args('uuid') uuid: string) {
    return await this.vmInstanceQueryService.getVmUsage(uuid)
  }
}

@Resolver(Screenshot)
export class ScreenshotResolver {
  @Inject() takeVmConsoleScreenshotAction: TakeVmConsoleScreenshotAction

  @Query(() => Screenshot)
  async screenshot(@Args('uuid') uuid: string) {
    const vmConsoleScreenshotData = await this.takeVmConsoleScreenshotAction.call({
      uuid
    })
    return {
      imageData: vmConsoleScreenshotData.imageData
    }
  }
}
