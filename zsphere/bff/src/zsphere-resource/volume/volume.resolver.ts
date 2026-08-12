import { Inject } from '@nestjs/common'
import { Args, Context, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { get as _get } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { FlattenVolumeAction } from '@/api/zstack/FlattenVolumeAction'
import { VolumeInventory } from '@/api/zstack/types'
import { State, PrimaryStorageType } from '@/common/enum'
import { Condition as ICondition, QueryAction } from '@/common/model/action-query.model'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'
import { PrimaryStorageVO } from '@/hardware-resource/primary-storage/primary-storage.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'

import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import {
  GetFlattenVolumeOccupyCapacityInput,
  MemorySnapByResourceNetworkArgs,
  MemorySnapshotQueryResponse,
  MemorySnapshotInfo,
  QueryFlattenVolumeOccupyCapacityResp,
  QueryVolumeArgs,
  VmAndBareMetal2InstanceSummary,
  Volume,
  VolumeBackupTaskType,
  VolumeBandwidth,
  VolumeList,
  VolumeRelatedResource,
  VolumeSummary,
  VolumeSystemTag,
  VolumeResourceConfig,
  VolumeQueryType
} from './model/volume.model'
import { VolumeQueryService } from './volume-query/volume-query.service'

@Resolver(() => Volume)
export class VolumeResolver {
  @Inject() volumeQueryService: VolumeQueryService

  @Inject() tagDataloader: TagsDataloader
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() flattenVolumeAction: FlattenVolumeAction
  @Inject() imageDataloader: ImageDataloader
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService
  @Query(() => Volume, { nullable: true })
  async volume(@Args('uuid') uuid: string): Promise<VolumeInventory | null> {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }

    const result = await this.volumeQueryService.queryList(queryArgs)

    return result?.list?.[0] || { uuid }
  }

  @Query(() => VolumeList)
  async volumeList(@Args() queryArgs: QueryVolumeArgs, @Context() context: any) {
    context.mainArg = queryArgs
    return this.volumeQueryService.queryList(queryArgs)
  }

  @Query(() => QueryFlattenVolumeOccupyCapacityResp)
  async getFlattenVolumeOccupyCapacity(@Args('input') input: GetFlattenVolumeOccupyCapacityInput) {
    try {
      const { uuids } = input
      const result = await Promise.all(
        // 获取扁平化后的容量和真正执行扁平化的api都是 flattenVolumeAction，不同的是传入 dryRun 不会真正执行只会返回容量信息
        uuids.map(uuid => {
          return this.flattenVolumeAction.call({ uuid, dryRun: true })
        })
      )
      const inventories = result?.map(it => it?.inventory)
      return {
        list: inventories,
        success: true
      }
    } catch (error) {
      return { error: error?.message ?? error, list: [], success: false }
    }
  }

  @ResolveField(() => String, { nullable: true })
  async volumeIoThreadPin(@Parent() volume: Volume) {
    return this.volumeQueryService.getVolumeIoThreadPin(volume.uuid)
  }

  @ResolveField(() => Image)
  async rootImage(@Parent() volume: Volume) {
    return volume.rootImageUuid
      ? this.imageDataloader.query(volume.uuid, volume.rootImageUuid)
      : null
  }

  @ResolveField(() => PrimaryStorageVO, {
    description: '这里是为了查询storageCapacityForLocalStorage，在GetVolumeByVMAndHostForEditVM时' //根据：
  })
  async primaryStorage(@Parent() volume: Volume, @Context() context: any) {
    const primaryStorageUuid = _get(volume, 'primaryStorageUuid', '')
    const ps = await this.primaryStorageDataloader.query(volume.uuid, primaryStorageUuid)
    const mainArg = context?.mainArg
    if (!mainArg) {
      return ps
    }

    const { type, extraConditions } = mainArg
    const needHostCapacity = type === VolumeQueryType.GetVolumeByVMAndHostForEditVM

    if (needHostCapacity && ps?.type === PrimaryStorageType.LocalStorage) {
      const hostUuid = extraConditions?.find?.(t => t.key === 'hostUuid')?.value
      if (hostUuid) {
        const res = await this.capacityCalculationQueryService.getLocalStorageHostCapacity({
          hostUuid,
          primaryStorageUuid
        })
        ps.storageCapacityForLocalStorage = res
      }
    }

    return ps
  }

  @ResolveField(() => VolumeResourceConfig, { nullable: true })
  async resourceConfig(@Parent() volume: Volume) {
    return this.volumeQueryService.getResourceConfig(volume.uuid)
  }

  @ResolveField()
  async capabilities(@Parent() volume: Volume) {
    return this.volumeQueryService.getCapabilities(volume.uuid)
  }

  @ResolveField(() => VolumeRelatedResource)
  async relatedResource(@Parent() volume: Volume) {
    return this.volumeQueryService.getRelatedResourceCount(volume.uuid)
  }

  @ResolveField()
  async owner(@Parent() volume: Volume) {
    return this.ownerDataLoader.query(volume.uuid)
  }

  @ResolveField(() => VolumeBandwidth)
  async bandwidth(@Parent() volume: Volume) {
    return this.volumeQueryService.getVolumeQos(volume)
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() volume: Volume) {
    return this.tagDataloader.query(volume.uuid)
  }

  @ResolveField()
  async backupStatus(@Parent() volume: Volume) {
    return this.volumeQueryService.getBackupStatus(volume.uuid)
  }

  @ResolveField()
  async vmInstance(@Parent() volume: Volume) {
    return this.volumeQueryService.getVmInstance(volume.uuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() volume: Volume) {
    return this.volumeQueryService.getTemplatedVmInstance(volume.uuid)
  }

  @ResolveField()
  async templatedVmInstanceCache(@Parent() volume: Volume) {
    return this.volumeQueryService.getTemplatedVmInstanceCache(volume.uuid)
  }

  @ResolveField()
  async lastVmInstance(@Parent() { uuid, lastVmInstanceUuid }: Volume) {
    if (!lastVmInstanceUuid) {
      return null
    }

    return await this.vmInstanceDataloader.query(uuid, lastVmInstanceUuid)
  }

  @ResolveField()
  async lastVmOrTemplate(@Parent() { lastVmInstanceUuid }: Volume) {
    return await this.vmInstanceDataloader.queryVmOrTemplate(lastVmInstanceUuid)
  }

  @ResolveField()
  async lastAttachDate(
    @Parent() volume: Volume,
    @Args('vmInstanceUuid', { nullable: true }) vmInstanceUuid: string
  ) {
    const _lastAttachDate = volume?.lastAttachDate

    if (!vmInstanceUuid || !volume?.isShareable) {
      return _lastAttachDate
    }

    return this.volumeQueryService.getLastAttachDate(volume, vmInstanceUuid)
  }

  @ResolveField(() => VolumeSystemTag)
  async systemTag(@Parent() volume: Volume) {
    return this.volumeQueryService.getVolumeSystemTag({
      uuid: volume.uuid,
      installPath: volume?.installPath
    })
  }

  @ResolveField()
  async cdpTaskStatus(@Parent() volume: Volume) {
    return this.volumeQueryService.getCdpTaskStatus(volume.uuid, volume.vmInstanceUuid)
  }

  @ResolveField(() => VolumeBackupTaskType, { nullable: true })
  async backupTaskType(@Parent() volume: Volume) {
    return this.volumeQueryService.getBackupTaskType(volume.uuid)
  }

  @ResolveField()
  async isHaveMemorySnapshot(@Parent() volume: Volume) {
    return this.volumeQueryService.judgeIsHaveMemorySnapShot(volume.uuid)
  }

  @ResolveField(() => State)
  async backupTaskStatus(@Parent() volume: Volume) {
    return this.volumeQueryService.backupTaskStatus(volume.uuid)
  }

  //zsv 硬盘内存在快照
  @ResolveField()
  async isHaveSnapshot(@Parent() volume: Volume) {
    return this.volumeQueryService.judgeHaveSnapShot(volume.uuid)
  }
}

@Resolver(() => VmAndBareMetal2InstanceSummary)
export class VmAndBareMetal2InstanceSummaryResolver {
  @Inject() volumeQueryService: VolumeQueryService

  @Query(() => VmAndBareMetal2InstanceSummary)
  async getVmAndBareMetal2InstanceSummary(@Args() queryArgs: QueryAction) {
    return this.volumeQueryService.getVmAndBareMetal2InstanceSummary(queryArgs)
  }
}

@Resolver(() => MemorySnapshotInfo)
export class MemorySnapByResourceResolver {
  @Inject() volumeQueryService: VolumeQueryService

  @Query(() => MemorySnapshotQueryResponse)
  async getMemorySnapshotByResource(@Args() queryArgs: MemorySnapByResourceNetworkArgs) {
    return this.volumeQueryService.getMemorySnapshotByResource(queryArgs)
  }
}

@Resolver(() => VolumeSummary)
export class VolumeSummaryResolver {
  @Inject() volumeQueryService: VolumeQueryService

  @Query(() => VolumeSummary)
  async getVolumeSummary(
    @Args({ name: 'conditions', type: () => [ICondition] })
    conditions: ICondition[]
  ) {
    return conditions || []
  }

  @ResolveField(() => Int)
  async total(conditions: [ICondition]) {
    return this.volumeQueryService.getSummary('total', conditions)
  }

  @ResolveField(() => Int)
  async available(conditions: [ICondition]) {
    return await this.volumeQueryService.getSummary('available', conditions)
  }

  @ResolveField(() => Int)
  async enabled(conditions: [ICondition]) {
    return await this.volumeQueryService.getSummary('enabled', conditions)
  }

  @ResolveField(() => Int)
  async disabled(conditions: [ICondition]) {
    return await this.volumeQueryService.getSummary('disabled', conditions)
  }

  @ResolveField(() => Int)
  async destroyed(@Parent() conditions) {
    return await this.volumeQueryService.getSummary('destroyed', conditions)
  }

  @ResolveField(() => Int)
  async notInstantiated(@Parent() conditions) {
    return this.volumeQueryService.getSummary('notInstantiated', conditions)
  }
}
