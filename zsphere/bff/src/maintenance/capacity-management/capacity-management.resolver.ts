import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent, Mutation } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { CapacityManagementDataloader } from './capacity-management.dataloader'
import {
  CapacityManagementCardInput,
  CapacityManagementCardPrimaryStorageInput,
  CapacityManagementCardPrimaryStorage,
  CapacityManagementCard,
  CapacityManagementPrimaryStorageInfo,
  CapacityManagementVolumeTotalSizeInfo,
  CapacityManagementSize,
  CapacityManagementFullSize,
  CapacityManagementFullActualSize,
  CapacityManagementBackupStoreInfo,
  CapacityManagementSizeInBackupStoreInfo,
  CapacityManagementComputeNodeInfo,
  CapacityManagementManagementNodeInfo,
  CapacityManagementTopListInput,
  CapacityManagementTopListHost,
  CapacityManagementTopListHostDetail,
  CapacityManagementTopListPrimaryStorage,
  CapacityManagementTopListPrimaryStorageDetail,
  CapacityManagementTopListBackupStorage,
  CapacityManagementTopListBackupStorageDetail,
  CapacityManagementTopListImage,
  CapacityManagementTopListVmInstance,
  CapacityManagementTopListVolume,
  CapacityManagementTopListSnapshot,
  CapacityManagementTopListSnapshotResource,
  CapacityManagementTopListHostDiskInfo,
  CapacityManagementTopListHostDiskInfoInput,
  CapacityManagementDisconnectedResourceCount,
  CapacityManagementListVMDiskInfo,
  CapacityManagementListVMDiskInfoList
} from './capacity-management.model'
import { CapacityManagementService } from './capacity-management.service'

@Resolver(() => CapacityManagementCardPrimaryStorage)
export class CapacityManagementCardPrimaryStorageResolver {
  @Inject() capacityManagementService: CapacityManagementService
  // @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @ResolveField(() => CapacityManagementPrimaryStorageInfo)
  async primaryStorageInfo(
    @Parent() { zoneUuid, type }: CapacityManagementCardPrimaryStorage
  ): Promise<CapacityManagementPrimaryStorageInfo> {
    return this.capacityManagementService._getPrimaryStorageInfo(zoneUuid, type)
  }

  @ResolveField(() => CapacityManagementVolumeTotalSizeInfo)
  async volumeTotalSizeInfo(
    @Parent() { zoneUuid, type }: CapacityManagementCardPrimaryStorage
  ): Promise<CapacityManagementVolumeTotalSizeInfo> {
    return this.capacityManagementService._getVolumeTotalSize(zoneUuid, type)
  }

  @ResolveField(() => CapacityManagementSize)
  async imageCacheSizeInfo(
    @Parent() { zoneUuid, type }: CapacityManagementCardPrimaryStorage
  ): Promise<CapacityManagementSize> {
    return this.capacityManagementService._getImageCacheSize(zoneUuid, type)
  }

  @ResolveField(() => CapacityManagementSize)
  async primaryStorageTrashInfo(
    @Parent() { zoneUuid, type }: CapacityManagementCardPrimaryStorage
  ): Promise<CapacityManagementSize> {
    return this.capacityManagementService._getPrimaryStorageTrash(zoneUuid, type)
  }

  // cardPrimaryStorage
  @Query(() => CapacityManagementCardPrimaryStorage)
  async queryCapacityManagementPrimaryStorageCard(
    @Args() args: CapacityManagementCardPrimaryStorageInput
  ): Promise<CapacityManagementCardPrimaryStorage> {
    return await this.capacityManagementService.getCapacityManagementCardPrimaryStorage(
      args.zoneUuid,
      args.type
    )
  }
}

@Resolver(() => CapacityManagementCard)
export class CapacityManagementCardResolver {
  @Inject() capacityManagementService: CapacityManagementService
  // @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @ResolveField(() => CapacityManagementPrimaryStorageInfo)
  async primaryStorageInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementPrimaryStorageInfo> {
    return this.capacityManagementService._getPrimaryStorageInfo(zoneUuid)
  }

  @ResolveField(() => CapacityManagementVolumeTotalSizeInfo)
  async volumeTotalSizeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementVolumeTotalSizeInfo> {
    return this.capacityManagementService._getVolumeTotalSize(zoneUuid)
  }

  @ResolveField(() => CapacityManagementSize)
  async imageCacheSizeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementSize> {
    return this.capacityManagementService._getImageCacheSize(zoneUuid)
  }

  @ResolveField(() => CapacityManagementSize)
  async primaryStorageTrashInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementSize> {
    return this.capacityManagementService._getPrimaryStorageTrash(zoneUuid)
  }

  @ResolveField(() => CapacityManagementBackupStoreInfo)
  async backupStoreInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementBackupStoreInfo> {
    return this.capacityManagementService._getBackupStoreInfo(zoneUuid)
  }

  @ResolveField(() => CapacityManagementSizeInBackupStoreInfo)
  async imageSizeInBackupStoreInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementSizeInBackupStoreInfo> {
    return this.capacityManagementService._getImageSizeInBackupStore(zoneUuid)
  }

  @ResolveField(() => CapacityManagementSize)
  async backupSizeInBackupStoreInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementSize> {
    return this.capacityManagementService._getBackupSizeInBackupStore(zoneUuid)
  }

  @ResolveField(() => CapacityManagementSizeInBackupStoreInfo)
  async backupStoreTrashSizeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementSizeInBackupStoreInfo> {
    return this.capacityManagementService._getBackupStoreTrashSize(zoneUuid)
  }

  @ResolveField(() => CapacityManagementFullActualSize)
  async vmInstanceInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementFullActualSize> {
    return this.capacityManagementService._getVmInstance(zoneUuid)
  }

  @ResolveField(() => CapacityManagementFullActualSize)
  async dataVolumeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementFullActualSize> {
    return this.capacityManagementService._getDataVolume(zoneUuid)
  }

  @ResolveField(() => CapacityManagementFullActualSize)
  async imageInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementFullActualSize> {
    return this.capacityManagementService._getImage(zoneUuid)
  }

  @ResolveField(() => CapacityManagementFullSize)
  async snapshotInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementFullSize> {
    return this.capacityManagementService._getSnapshot(zoneUuid)
  }

  @ResolveField(() => CapacityManagementComputeNodeInfo)
  async computeNodeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementComputeNodeInfo> {
    return this.capacityManagementService._getComputeNode(zoneUuid)
  }

  @ResolveField(() => CapacityManagementManagementNodeInfo)
  async managementNodeInfo(
    @Parent() { zoneUuid }: CapacityManagementCard
  ): Promise<CapacityManagementManagementNodeInfo> {
    return this.capacityManagementService._getManagementNode(zoneUuid)
  }

  // card
  @Query(() => CapacityManagementCard)
  async queryCapacityManagementCard(
    @Args() args: CapacityManagementCardInput
  ): Promise<CapacityManagementCard> {
    return await this.capacityManagementService.getCapacityManagementCard(args.zoneUuid)
  }
}

@Resolver(() => CapacityManagementTopListHost)
export class CapacityManagementTopListHostResolver {
  @Inject() capacityManagementService: CapacityManagementService
  @Inject() capacityManagementDataloader: CapacityManagementDataloader

  // TopList - Host
  @Query(() => [CapacityManagementTopListHost])
  async queryCapacityManagementTopListHost(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListHost[]> {
    return await this.capacityManagementService.getCapacityManagementTopListHost(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }

  @ResolveField(() => CapacityManagementTopListHostDetail)
  async detail(
    @Parent() { uuid }: CapacityManagementTopListHost
  ): Promise<CapacityManagementTopListHostDetail> {
    return this.capacityManagementDataloader.queryHostData(uuid)
  }
}

@Resolver(() => CapacityManagementTopListPrimaryStorage)
export class CapacityManagementTopListPrimaryStorageResolver {
  @Inject() capacityManagementService: CapacityManagementService
  @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @Query(() => [CapacityManagementTopListPrimaryStorage])
  async queryCapacityManagementTopListPrimaryStorage(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListPrimaryStorage[]> {
    return await this.capacityManagementService.getCapacityManagementTopListPrimaryStorage(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }

  @ResolveField(() => CapacityManagementTopListPrimaryStorageDetail)
  async detail(
    @Parent() { uuid }: CapacityManagementTopListPrimaryStorage
  ): Promise<CapacityManagementTopListPrimaryStorageDetail> {
    return this.capacityManagementDataloader.queryPrimaryStorageData(uuid)
  }
}

@Resolver(() => CapacityManagementTopListBackupStorage)
export class CapacityManagementTopListBackupStorageResolver {
  @Inject() capacityManagementService: CapacityManagementService
  @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @Query(() => [CapacityManagementTopListBackupStorage])
  async queryCapacityManagementTopListBackupStorage(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListBackupStorage[]> {
    return await this.capacityManagementService.getCapacityManagementTopListBackupStorage(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }

  @ResolveField(() => CapacityManagementTopListBackupStorageDetail)
  async detail(
    @Parent() { uuid }: CapacityManagementTopListBackupStorage
  ): Promise<CapacityManagementTopListBackupStorageDetail> {
    return this.capacityManagementDataloader.queryBackupStorageData(uuid)
  }
}

@Resolver(() => CapacityManagementTopListImage)
export class CapacityManagementTopListImageResolver {
  @Inject() capacityManagementService: CapacityManagementService

  @Query(() => [CapacityManagementTopListImage])
  async queryCapacityManagementTopListImage(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListImage[]> {
    return await this.capacityManagementService.getCapacityManagementTopListImage(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }
}

@Resolver(() => CapacityManagementTopListVmInstance)
export class CapacityManagementTopListVmInstanceResolver {
  @Inject() capacityManagementService: CapacityManagementService
  @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @Query(() => [CapacityManagementTopListVmInstance])
  async queryCapacityManagementTopListVmInstance(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListVmInstance[]> {
    return await this.capacityManagementService.getCapacityManagementTopListVmInstance(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }

  @ResolveField(() => String)
  async name(@Parent() { uuid }: CapacityManagementTopListVmInstance): Promise<string> {
    return this.capacityManagementDataloader.queryVmInstanceName(uuid)
  }
}

@Resolver(() => CapacityManagementTopListVolume)
export class CapacityManagementTopListVolumeResolver {
  @Inject() capacityManagementService: CapacityManagementService

  @Query(() => [CapacityManagementTopListVolume])
  async queryCapacityManagementTopListVolume(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListVolume[]> {
    return await this.capacityManagementService.getCapacityManagementTopListVolume(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }
}

@Resolver(() => CapacityManagementTopListSnapshot)
export class CapacityManagementTopListSnapshotResolver {
  @Inject() capacityManagementService: CapacityManagementService
  @Inject() capacityManagementDataloader: CapacityManagementDataloader

  @Query(() => [CapacityManagementTopListSnapshot])
  async queryCapacityManagementTopListSnapshot(
    @Args() args: CapacityManagementTopListInput
  ): Promise<CapacityManagementTopListSnapshot[]> {
    return await this.capacityManagementService.getCapacityManagementTopListSnapshot(
      args.zoneUuid,
      args.sortBy,
      args.sortDirection
    )
  }

  @ResolveField(() => CapacityManagementTopListSnapshotResource)
  async resource(
    @Parent() { volumeUuid }: CapacityManagementTopListSnapshot
  ): Promise<CapacityManagementTopListSnapshotResource> {
    return this.capacityManagementDataloader.querySnapshotResource(volumeUuid)
  }
}

@Resolver(() => CapacityManagementTopListHostDiskInfo)
export class CapacityManagementTopListHostDiskInfoResolver {
  @Inject() capacityManagementService: CapacityManagementService

  @Query(() => [CapacityManagementTopListHostDiskInfo])
  async queryCapacityManagementTopListHostDiskInfo(
    @Args() args: CapacityManagementTopListHostDiskInfoInput
  ): Promise<CapacityManagementTopListHostDiskInfo[]> {
    return await this.capacityManagementService.getCapacityManagementTopListHostDiskInfo(args.uuid)
  }
}

@Resolver(() => CapacityManagementDisconnectedResourceCount)
export class CapacityManagementDisconnectedResourceCountResolver {
  @Inject() capacityManagementService: CapacityManagementService

  @Query(() => CapacityManagementDisconnectedResourceCount)
  async queryCapacityManagementDisconnectedResourceCount(
    @Args() args: CapacityManagementCardInput
  ): Promise<CapacityManagementDisconnectedResourceCount> {
    return await this.capacityManagementService.getCapacityManagementDisconnectedResourceCount(
      args.zoneUuid
    )
  }
}

@Resolver(() => CapacityManagementListVMDiskInfo)
export class CapacityManagementListVMDiskInfoResolver {
  @Inject() capacityManagementService: CapacityManagementService

  @Query(() => CapacityManagementListVMDiskInfoList)
  async queryCapacityManagementListVMDiskInfo(@Args() queryArgs: QueryAction) {
    const { conditions = [] } = queryArgs || {}
    const vmUuid = conditions.find(condition => condition.key === 'uuid')?.value
    return await this.capacityManagementService.getCapacityManagementListVMDiskInfo(vmUuid)
  }
}
