import { Inject } from '@nestjs/common'
import { Args, Float, Int, Parent, Query, ResolveField, Resolver, Context } from '@nestjs/graphql'

import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { PrimaryStorageType } from '@/common/enum'
import { GetMetricDataArgs } from '@/common/metric-data/metric-data.model'
import { Condition } from '@/common/model/action-query.model'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import {
  PrimaryStorageCapacity,
  LocalStorageHostCapacity
} from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'
import { VolumeQueryType } from '@/zsphere-resource/volume/model/volume.model'

import { ZoneDataloader } from '../zone/zone.dataloader'
import { getAvailablePsTypes } from './helper'
import {
  BlockDetailInfoResp,
  BlockMetadataArgs,
  BlockMetadataResp,
  ClusterAttachablePrimaryStorageTypes,
  GetClusterAttachablePrimaryStorageTypesArgs,
  PrimaryStorageMetricData,
  PrimaryStoragePredictionCapacityArgs,
  PrimaryStoragePredictionCapacityData,
  PrimaryStorageQueryResp,
  PrimaryStorageQueryType,
  PrimaryStorageRelatedBaremetal2ClusterSummary,
  PrimaryStorageRelatedClusterArgs,
  PrimaryStorageRelatedClusterSummary,
  PrimaryStorageRelatedSummary,
  PrimaryStorageSummary,
  PrimaryStorageVO,
  QueryPrimaryStorageArgs,
  StorageCapacityForLocalStorage,
  TrashOnPrimaryStorageResp,
  PrimaryStorageRelatedResourceCounts
} from './primary-storage.model'
import { PrimaryStorageService } from './primary-storage.service'

@Resolver(() => PrimaryStorageVO)
export class PrimaryStorageResolver extends ResourceAttributeFieldResolver {
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() primaryStorageService: PrimaryStorageService
  @Inject() primaryStorageQueryService: PrimaryStorageQueryService
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => PrimaryStorageQueryResp)
  async primaryStorageList(@Args() queryArgs: QueryPrimaryStorageArgs, @Context() context: any) {
    context.mainArg = queryArgs
    return this.primaryStorageQueryService.query(queryArgs)
  }

  @ResolveField()
  async systemTag(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getSystemTag(primaryStorage.uuid)
  }

  @ResolveField()
  async zone(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.zoneDataloader.query(primaryStorage.uuid, primaryStorage.zoneUuid)
  }

  @ResolveField('reservedCapacity', () => Float)
  async reservedCapacity(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getReservedCapacity(primaryStorage.uuid)
  }

  @ResolveField('reservedPhysicalCapacity', () => Float)
  async reservedPhysicalCapacity(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getReservedPhysicalCapacity(
      primaryStorage.uuid,
      primaryStorage.totalPhysicalCapacity
    )
  }
  //根据：
  @ResolveField('storageCapacityForLocalStorage', () => LocalStorageHostCapacity)
  async storageCapacityForLocalStorage(
    @Parent() primaryStorage: PrimaryStorageVO,
    @Context() context: any
  ) {
    const defaultCapacity = {
      availableCapacity: primaryStorage?.availableCapacity || 0,
      availablePhysicalCapacity: primaryStorage?.availablePhysicalCapacity || 0,
      totalPhysicalCapacity: primaryStorage?.totalPhysicalCapacity || 0,
      reservedPhysicalCapacity: primaryStorage?.reservedPhysicalCapacity || 0
    }

    const mainArg = context?.mainArg
    if (!mainArg) {
      return defaultCapacity
    }

    const { type, extraConditions } = mainArg || {}
    const isLocalStorage = primaryStorage.type === PrimaryStorageType.LocalStorage
    const needHostCapacity = [
      PrimaryStorageQueryType.CreateInstanceDiskOptionFromHostInLocalStorageType,
      VolumeQueryType.GetVolumeByVMAndHostForEditVM
    ].includes(type)

    if (isLocalStorage && needHostCapacity) {
      const hostUuid = extraConditions?.find?.(t => t.key === 'hostUuid')?.value
      if (!hostUuid) {
        return defaultCapacity
      }
      const res = await this.capacityCalculationQueryService.getLocalStorageHostCapacity({
        hostUuid,
        primaryStorageUuid: primaryStorage.uuid
      })
      return { ...res }
    }

    return defaultCapacity
  }

  // ceph存储正确的数据源
  @ResolveField('primaryStorageCapacity', () => PrimaryStorageCapacity, {
    nullable: true
  })
  async primaryStorageCapacity(@Parent() primaryStorage: PrimaryStorageVO) {
    const res = await this.capacityCalculationQueryService.getPrimaryStorageCapacity({
      primaryStorageUuids: [primaryStorage.uuid]
    })
    return {
      ...res
    }
  }

  @ResolveField()
  async clusters(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getCluster(primaryStorage.uuid, primaryStorage)
  }

  @ResolveField('vmInstanceCount', () => Int)
  async vmInstanceCount(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getCount(primaryStorage.uuid, 'vm-instances')
  }

  @ResolveField('volumeCount', () => Int)
  async volumeCount(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getCount(primaryStorage.uuid, 'volumes')
  }

  @ResolveField('cbdMdsCount', () => Int)
  async cbdMdsCount(@Parent() primaryStorage: PrimaryStorageVO) {
    const { mdsInfos = [] } = primaryStorage?.addonInfo || {}
    return mdsInfos?.length || 0
  }

  @ResolveField('baremetal2InstancesCount', () => Int)
  async baremetal2InstancesCount(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getCount(
      primaryStorage.uuid,
      'baremetal2-instances'
    )
  }

  @ResolveField()
  async expired(@Parent() primaryStorage: PrimaryStorageVO) {
    return await this.primaryStorageQueryService.getExpired(primaryStorage)
  }

  @Query(() => TrashOnPrimaryStorageResp)
  async getTrashOnPrimaryStorage(@Args('uuid') uuid: string) {
    return this.primaryStorageQueryService.getTrashOnPrimaryStorage(uuid)
  }

  /**
   * 获取block主存储metadata
   */
  @Query(() => BlockMetadataResp)
  async getBlockMetadata(@Args() queryArgs: BlockMetadataArgs) {
    const { accessZones, storagePools } =
      await this.primaryStorageQueryService.getBlockMetadata(queryArgs)
    return { accessZones, storagePools }
  }
  /**
   * 获取block主存储设备信息
   */
  @Query(() => BlockDetailInfoResp)
  async getBlockDeviceInfo(@Args('uuid') uuid: string) {
    return await this.primaryStorageQueryService.getBlockDeviceInfo(uuid)
  }
  /**
   * 主存储相关资源数量
   * @param uuid string
   */
  @Query(() => PrimaryStorageRelatedSummary)
  async getPrimaryStorageRelatedSummary(
    @Args('uuid') uuid: string
  ): Promise<PrimaryStorageRelatedSummary> {
    return this.primaryStorageQueryService.getPrimaryStorageRelatedSummary(uuid)
  }

  /**
   * 主存储关联集群资源数量
   * @param param PrimaryStorageRelatedClusterArgs
   */
  @Query(() => PrimaryStorageRelatedClusterSummary)
  async getPrimaryStorageRelatedClusterSummary(
    @Args() param: PrimaryStorageRelatedClusterArgs
  ): Promise<PrimaryStorageRelatedClusterSummary> {
    return this.primaryStorageQueryService.getPrimaryStorageRelatedClusterSummary(param)
  }

  /**
   * 主存储关联弹性裸金属集群资源数量
   * @param param PrimaryStorageRelatedClusterArgs
   */
  @Query(() => PrimaryStorageRelatedBaremetal2ClusterSummary)
  async getPrimaryStorageRelatedBaremetal2ClusterSummary(
    @Args() param: PrimaryStorageRelatedClusterArgs
  ): Promise<PrimaryStorageRelatedBaremetal2ClusterSummary> {
    return this.primaryStorageQueryService.getPrimaryStorageRelatedBaremetal2ClusterSummary(param)
  }

  /**
   * 主存储详情页监控信息
   * @param args
   */
  @Query(() => [PrimaryStorageMetricData])
  primaryStorageMetricDataList(@Args() args: GetMetricDataArgs) {
    return this.primaryStorageService.getPrimaryStorageMetricData(args)
  }

  /**
   * 主存储详情页容量预测图表信息
   * @param param GetPredictionCapacityArgs
   */
  @Query(() => PrimaryStoragePredictionCapacityData)
  primaryStoragePredictionCapacity(@Args() param: PrimaryStoragePredictionCapacityArgs) {
    return this.primaryStorageService.getPrimaryStoragePredictionCapacity(param)
  }

  @Query(() => PrimaryStorageRelatedResourceCounts)
  async getPrimaryStorageRelatedResourceCounts(
    @Args('uuid') uuid: string
  ): Promise<PrimaryStorageRelatedResourceCounts> {
    return this.primaryStorageQueryService.getPrimaryStorageRelatedResourceCounts(uuid)
  }
}

@Resolver(() => PrimaryStorageSummary)
export class PrimaryStorageSummaryResolver {
  @Inject() primaryStorageQueryService: PrimaryStorageQueryService

  @Query(() => PrimaryStorageSummary)
  async primaryStorageSummary(
    @Args({ name: 'conditions', type: () => [Condition], nullable: true })
    conditions?: Condition[]
  ) {
    return conditions || []
  }

  @ResolveField(() => Int)
  async total(conditions: [Condition]) {
    return this.primaryStorageQueryService.getSummary('total', conditions)
  }

  @ResolveField(() => Int)
  async connected(@Parent() conditions) {
    return this.primaryStorageQueryService.getSummary('connected', conditions)
  }

  @ResolveField(() => Int)
  async connecting(@Parent() conditions) {
    return this.primaryStorageQueryService.getSummary('connecting', conditions)
  }

  @ResolveField(() => Int)
  async disconnected(@Parent() conditions) {
    return this.primaryStorageQueryService.getSummary('disconnected', conditions)
  }

  @ResolveField(() => Int)
  async other(@Parent() conditions) {
    return this.primaryStorageQueryService.getSummary('other', conditions)
  }
}

@Resolver(() => ClusterAttachablePrimaryStorageTypes)
export class ClusterAttachablePrimaryStorageTypesResolver {
  @Inject() queryPrimaryStorageAction: QueryPrimaryStorageAction

  @Query(() => ClusterAttachablePrimaryStorageTypes)
  async getClusterAttachablePrimaryStorageTypes(
    @Args() param: GetClusterAttachablePrimaryStorageTypesArgs
  ) {
    const baseParams = {
      conditions: [
        {
          key: 'cluster.uuid',
          value: param?.clusterUuid
        }
      ]
    }

    const baseResp = await this.queryPrimaryStorageAction.call(baseParams)
    const attachedPsList = baseResp.inventories

    const psTypes = getAvailablePsTypes(attachedPsList)

    return {
      types: psTypes || []
    }
  }
}
