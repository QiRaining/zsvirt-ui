import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import {
  AccessPath,
  AccessPathQueryResp,
  BlockVolume,
  BlockVolumeQueryResp,
  QueryBlockVolumeArgs
} from './block-volume.model'
import { BlockVolumeService } from './block-volume.service'

@Resolver(() => BlockVolume)
export class BlockVolumeResolver {
  @Inject() blockVolumeService: BlockVolumeService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => BlockVolume, { nullable: true })
  async blockVolume(@Args('uuid') uuid: string) {
    return await this.blockVolumeService.queryByUuid(uuid)
  }

  @Query(() => BlockVolumeQueryResp)
  async blockVolumeList(@Args() queryArgs: QueryBlockVolumeArgs): Promise<BlockVolumeQueryResp> {
    return this.blockVolumeService.query(queryArgs)
  }

  @ResolveField(() => PrimaryStorage)
  async primaryStorage(@Parent() bm: BlockVolume) {
    return this.primaryStorageDataloader.query(bm.uuid, bm.primaryStorageUuid)
  }

  @ResolveField()
  async instance(@Parent() volume: BlockVolume) {
    return this.blockVolumeService.getVmInstance(volume.uuid)
  }

  @ResolveField()
  async lastVmInstance(@Parent() { uuid, lastVmInstanceUuid }: BlockVolume) {
    if (!lastVmInstanceUuid) {
      return null
    }

    return await this.vmInstanceDataloader.query(uuid, lastVmInstanceUuid)
  }
}
@Resolver(() => AccessPath)
export class AccessPathResolver {
  @Inject() blockVolumeService: BlockVolumeService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader

  @Query(() => AccessPathQueryResp, { nullable: true })
  async getAccessPath(@Args('uuid') uuid: string) {
    return await this.blockVolumeService.getAccessPath(uuid)
  }
}
