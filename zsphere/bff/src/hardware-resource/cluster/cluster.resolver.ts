import { Inject } from '@nestjs/common'
import { Args, Context, Info, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { compact as _compact } from 'lodash'

import { Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { ClusterInventory as IClusterInventory } from '@/api/zstack/types'
import { Condition } from '@/common/model/action-query.model'
import { ZOp } from '@/common/zql'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { Host } from '@/hardware-resource/host/host.model'
import { HostCpuMemoryCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { VxlanPoolDataloader } from '@/network-resource/vxlan-pool/vxlan-pool.dataloader'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { ZoneDataloader } from '../zone/zone.dataloader'
import { ClusterDataloader } from './cluster.dataloader'
import {
  Baremetal2ClusterRelatedSummary,
  Cluster,
  ClusterRelatedSummary,
  ClusterResourceConfigValue,
  ClusterSummaryQueryResp,
  DRS,
  DRSAdvice,
  QueryClusterArgs,
  QueryClusterDRSResp,
  QueryClusterResp,
  QueryDRSAdviceResp,
  QueryVmMigrationActivityResp,
  ResourceCpuMode,
  VmMigrationActivity
} from './cluster.model'
import { ClusterService } from './cluster.service'
import { HostDataloader2 } from './query/host.dataloader'
import { ResourceConfigNetworkHpDataloader } from './query/resource-config.dataloader'

@Resolver(() => Cluster)
export class ClusterResolver {
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() clusterService: ClusterService
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() vxlanPoolDataLoader: VxlanPoolDataloader

  @Inject()
  resourceConfigNetworkHpDataloader: ResourceConfigNetworkHpDataloader
  @Inject() queryL3NetworkService: QueryL3NetworkService
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  /**
   * 获取单个集群
   * @param uuid string
   */
  @Query(() => Cluster)
  cluster(@Args('uuid') uuid: string): Promise<IClusterInventory> {
    return this.clusterService.cluster(uuid)
  }

  /**
   * 获取集群列表
   * @param args QueryClusterArgs
   */
  @Query(() => QueryClusterResp)
  clusterList(@Args() args: QueryClusterArgs) {
    return this.clusterService.clusterList(args)
  }

  /**
   * 筛选出云主机可选的集群列表
   * @param GetCandidateClusterForVmInput
   */
  @Query(() => QueryClusterResp)
  async getCandidateClusterForVmSelectList(@Args() args: QueryClusterArgs) {
    return this.clusterService.getCandidateClusterForVmSelectList(args)
  }

  @ResolveField()
  async vtepCidr(@Parent() cluster: Cluster, @Info() param) {
    const { extraConditions = [] } = param.variableValues
    const conditionMap = conditionsToObject(extraConditions) as {
      uuid: string
    }
    if (!conditionMap.uuid) {
      return ''
    }
    return await this.vxlanPoolDataLoader.query(cluster.uuid, conditionMap.uuid)
  }
  @ResolveField()
  async isAttachL2network(@Parent() cluster: Cluster) {
    return await this.clusterService.getIsAttachL2network(cluster.uuid)
  }

  @ResolveField()
  async isAttachPrimaryStorage(@Parent() cluster: Cluster) {
    return await this.clusterService.getIsAttachPrimaryStorage(cluster.uuid)
  }

  @ResolveField()
  async psTypes(@Parent() cluster: Cluster) {
    return await this.clusterService.getPsTypes(cluster.uuid)
  }

  // 已废弃 后面等容量这部分稳定，可以删除掉
  @ResolveField()
  async cpuMemoryCapacity(@Parent() cluster: Cluster) {
    return await this.clusterService.getCpuMemoryCapacity(cluster.uuid)
  }

  // ZSphere 真实的数据源
  @ResolveField('realCpuMemoryCapacity', () => HostCpuMemoryCapacity)
  async realCpuMemoryCapacity(@Parent() cluster: Cluster) {
    return await this.capacityCalculationQueryService.getHostCpuMemoryCapacity({
      clusterUuids: [cluster.uuid]
    })
  }

  @ResolveField()
  async clusterZWatchInfo(@Parent() cluster: Cluster) {
    return await this.clusterService.getZWatchInfo(cluster.uuid)
  }

  // @ResolveField()
  // async totalVm(@Parent() cluster: Cluster) {
  //   return await this.clusterService.getTotalVm(cluster.uuid)
  // }

  @ResolveField()
  async runningVm(@Parent() cluster: Cluster) {
    return await this.clusterService.getRunningVm(cluster.uuid)
  }

  @ResolveField()
  async destroyedVm(@Parent() cluster: Cluster) {
    return await this.clusterService.getDestroyedVm(cluster.uuid)
  }

  @ResolveField()
  async stoppedVm(@Parent() cluster: Cluster) {
    return await this.clusterService.getStoppedVm(cluster.uuid)
  }

  @ResolveField()
  async checkCpuModel(@Parent() cluster: Cluster) {
    return await this.clusterService.getCheckCpuModel(cluster.uuid)
  }

  @ResolveField()
  async recommendQemuVersion(@Parent() cluster: Cluster) {
    return await this.clusterService.getRecommendQemuVersion(cluster.uuid)
  }

  @ResolveField()
  async checkCpuModelId(@Parent() cluster: Cluster) {
    return await this.clusterService.getCheckCpuModelId(cluster.uuid)
  }

  @ResolveField()
  async clusterKVMCpuModel(@Parent() cluster: Cluster) {
    return await this.clusterService.getClusterKVMCpuModel(cluster.uuid)
  }

  @ResolveField()
  async displayNetworkCidr(@Parent() cluster: Cluster) {
    return await this.clusterService.getDisplayNetworkCidr(cluster.uuid)
  }

  @ResolveField()
  async migrateNetworkCidr(@Parent() cluster: Cluster) {
    return await this.clusterService.getMigrateNetworkCidr(cluster.uuid)
  }

  @ResolveField()
  async zone(@Parent() cluster: Cluster) {
    return await this.zoneDataloader.query(cluster.uuid, cluster.zoneUuid)
  }

  @ResolveField()
  async hostList(@Parent() cluster: Cluster, @Context() context: any) {
    const { conditions = [] } = context?.req?.body?.variables ?? {}
    const _conditions = _compact(conditions)
      .filter(
        (it: Condition) =>
          (it.key === 'hostName' && it.op === Op.like) || it.key === 'cluster.hostUuid'
      )
      .map((it: Condition) => {
        let key = ''
        if (it.key === 'hostName') {
          key = 'name'
        }

        if (it.key === 'cluster.hostUuid') {
          key = 'uuid'
        }

        return { ...it, key }
      })

    return await this.clusterService.getHostList(cluster.uuid, _conditions)
  }

  @ResolveField()
  async primaryStorageList(@Parent() cluster: Cluster) {
    return await this.clusterService.getPrimaryStorageList(cluster.uuid)
  }

  @ResolveField()
  async hostNum(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'Host')
  }

  @ResolveField('primaryStorageCount', () => Int)
  async primaryStorageCount(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'PrimaryStorage')
  }

  @ResolveField('l2NetworkCount', () => Int)
  async l2NetworkCount(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'L2Network')
  }

  @ResolveField(() => Int)
  async l3NetworkCount(@Parent() cluster: Cluster) {
    const { total } = await this.queryL3NetworkService.query(
      {
        conditions: [{ key: 'clusterUuid', op: ZOp.eq, value: cluster.uuid }]
      },
      true
    )
    return total
  }

  @ResolveField('vmInstanceCount', () => Int)
  async vmInstanceCount(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'VmInstance')
  }

  @ResolveField('virtualizationVmInstanceCount', () => Int)
  async virtualizationVmInstanceCount(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'VmInstance', {
      state: {
        [ZOp.ne]: 'Destroyed'
      }
    })
  }

  @ResolveField('volumeCount', () => Int)
  async volumeCount(@Parent() cluster: Cluster) {
    return await this.clusterService.getCount(cluster.uuid, 'Volume')
  }

  @ResolveField()
  async isShowDrsTab(@Parent() cluster: Cluster) {
    return this.clusterService.getIsShowDrsTab(cluster.uuid) as Promise<boolean>
  }

  @ResolveField()
  async isSupported(@Parent() cluster: Cluster) {
    return this.clusterService.getIsSupported(cluster.uuid) as Promise<boolean>
  }

  @ResolveField()
  async isMaintenanceOfAllHost(@Parent() cluster: Cluster) {
    return this.clusterService.getIsMaintenanceOfAllHost(cluster.uuid) as Promise<boolean>
  }

  @ResolveField('baremetalChassisNum', () => Int)
  async baremetalChassisNum(@Parent() cluster: Cluster) {
    return await this.clusterService.getBaremetalChassisNum(cluster.uuid)
  }

  @ResolveField('baremetalInstanceNum', () => Int)
  async baremetalInstanceNum(@Parent() cluster: Cluster) {
    return await this.clusterService.getBaremetalInstanceNum(cluster.uuid)
  }

  @ResolveField()
  async isAttachBaremetalPxeServer(@Parent() cluster: Cluster) {
    return this.clusterService.getIsAttachBaremetalPxeServer(cluster.uuid)
  }

  @ResolveField()
  async baremetalPxeServer(@Parent() cluster: Cluster) {
    return this.clusterService.getBaremetalPxeServer(cluster.uuid)
  }

  @ResolveField('isHugePageMemoryCanOpen', () => Boolean, {
    description: '如果cluster下的vm 有开启内存回收的，cluster不能开启大页内存'
  })
  async isHugePageMemoryCanOpen(@Parent() cluster: Cluster) {
    return this.clusterService.isHugePageMemoryCanOpen(cluster.uuid)
  }

  @ResolveField('baremetal2ChassisNum', () => Int)
  async baremetal2ChassisNum(@Parent() cluster: Cluster) {
    return await this.clusterService.getBaremetal2ChassisNum(cluster.uuid)
  }

  @ResolveField('baremetal2GatewayNum', () => Int)
  async baremetal2GatewayNum(@Parent() cluster: Cluster) {
    return await this.clusterService.getBaremetal2GatewayNum(cluster.uuid)
  }

  @ResolveField(() => Boolean)
  async networkHp(@Parent() cluster: Cluster) {
    return (await this.resourceConfigNetworkHpDataloader.query(cluster?.uuid)) === 'true'
  }

  @ResolveField(() => String, { nullable: true })
  async drsSchedulingInterval(@Parent() cluster: Cluster) {
    return await this.clusterService.getDrsSchedulingInterval(cluster.uuid)
  }

  @ResolveField(() => ClusterResourceConfigValue)
  resourceConfigValue(@Parent() cluster: Cluster) {
    return this.clusterService.resourceConfigValue(cluster.uuid)
  }

  /**
   * 查询集群相关资源数量
   * @param zoneUuid string
   */
  @Query(() => ClusterRelatedSummary)
  async getClusterRelatedSummary(@Args('uuid') uuid: string): Promise<ClusterRelatedSummary> {
    return this.clusterService.getClusterRelatedSummary(uuid)
  }

  /**
   * 查询弹性裸金属集群相关资源数量
   * @param zoneUuid string
   */
  @Query(() => Baremetal2ClusterRelatedSummary)
  async getBaremetal2ClusterRelatedSummary(
    @Args('uuid') uuid: string
  ): Promise<Baremetal2ClusterRelatedSummary> {
    return this.clusterService.getBaremetal2ClusterRelatedSummary(uuid)
  }

  /**
   * 集群 | 裸金属集群 | 弹性裸金属集群 Tab按钮数量
   * @param queryParam
   */
  @Query(() => ClusterSummaryQueryResp)
  async clusterSummary(@Args() queryParam: QueryClusterArgs): Promise<ClusterSummaryQueryResp> {
    return this.clusterService.getClusterSummary(queryParam)
  }

  /**
   * 查询DRS策略信息
   * @param args QueryClusterArgs
   */
  @Query(() => QueryClusterDRSResp)
  queryClusterDRS(
    @Args({ name: 'clusterUuid', type: () => String })
    clusterUuid: string
  ) {
    return this.clusterService.queryClusterDRS(clusterUuid)
  }
}

@Resolver(() => VmMigrationActivity)
export class VmMigrationActivityResolver {
  @Inject() hostDataloader2: HostDataloader2
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @ResolveField()
  async vm(@Parent() activity: VmMigrationActivity) {
    return this.vmInstanceDataloader.query(activity.uuid, activity.vmUuid)
  }

  @ResolveField('sourceHost', () => Host)
  async sourceHost(@Parent() activity: VmMigrationActivity) {
    const res = await this.hostDataloader2.query(activity.vmSourceHostUuid)
    return res
  }

  @ResolveField('targetHost', () => Host)
  async targetHost(@Parent() activity: VmMigrationActivity) {
    return this.hostDataloader2.query(activity.vmTargetHostUuid)
  }
}

@Resolver(() => DRSAdvice)
export class DRSAdviceResolve {
  @Inject() clusterService: ClusterService
  @Inject() hostDataloader: HostDataloader
  @Inject() hostDataloader2: HostDataloader2
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  /**
   * 查询DRS建议
   * @param args QueryClusterArgs
   */
  @Query(() => QueryDRSAdviceResp)
  queryDRSAdviceList(@Args() args: QueryClusterArgs) {
    return this.clusterService.dRSAdviceList(args)
  }

  @ResolveField('status', () => String)
  async status(@Parent() drsAdvice: DRSAdvice) {
    return this.clusterService.getAdviceStatus(drsAdvice.drsUuid)
  }

  @ResolveField()
  async vm(@Parent() drsAdvice: DRSAdvice) {
    return this.vmInstanceDataloader.query(drsAdvice.uuid, drsAdvice.vmUuid)
  }

  @ResolveField('vmSourceHost', () => Host)
  async vmSourceHost(@Parent() drsAdvice: DRSAdvice) {
    return this.hostDataloader.query(drsAdvice.uuid, drsAdvice.vmSourceHostUuid)
  }

  @ResolveField('vmTargetHost', () => Host)
  async vmTargetHost(@Parent() drsAdvice: DRSAdvice) {
    return this.hostDataloader2.query(drsAdvice.vmTargetHostUuid)
  }
  /**
   * 获取资源cpu模式
   * @param uuid string
   */
  @Query(() => ResourceCpuMode)
  getResourceCpuMode(@Args('uuid') uuid: string) {
    return this.clusterService.getResourceCpuMode(uuid)
  }
}

@Resolver(() => DRS)
export class DRSResolve {
  @Inject() clusterService: ClusterService
  @Inject() clusterDataloader: ClusterDataloader

  /**
   * 查询DRS策略信息列表
   * @param args QueryClusterArgs
   */
  @Query(() => QueryClusterDRSResp)
  queryClusterDRSList(@Args() args: QueryClusterArgs) {
    return this.clusterService.clusterDRSList(args)
  }

  @ResolveField()
  async cluster(@Parent() clusterDRS: DRS) {
    return this.clusterDataloader.query(clusterDRS.uuid, clusterDRS.clusterUuid)
  }

  @ResolveField()
  async isSupported(@Parent() clusterDRS: DRS) {
    return this.clusterService.getIsSupported(clusterDRS.clusterUuid) as Promise<boolean>
  }

  @ResolveField(() => ClusterResourceConfigValue)
  resourceConfigValue(@Parent() clusterDRS: DRS) {
    return this.clusterService.resourceConfigValue(clusterDRS.clusterUuid)
  }
}

@Resolver(() => VmMigrationActivity)
export class DRSVmMigrationActivityResolve {
  @Inject() clusterService: ClusterService

  /**
   * 查询DRS迁移记录("执行历史")
   * @param args QueryClusterArgs
   */

  @Query(() => QueryVmMigrationActivityResp)
  queryDRSVmMigrationActivityList(@Args() args: QueryClusterArgs) {
    return this.clusterService.queryDRSVmMigrationActivityList(args)
  }

  @ResolveField()
  async clusterName(@Parent() vmMigrationActivity: VmMigrationActivity) {
    return this.clusterService.getClusterName(vmMigrationActivity.vmUuid)
  }
}
