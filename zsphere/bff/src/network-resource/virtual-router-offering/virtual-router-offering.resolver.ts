import { Inject } from '@nestjs/common'
import { Args, Query, Parent, Resolver, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'
import { Image } from '@/zsphere-resource/image/image.model'

import {
  VirtualRouterOffering,
  VirtualRouterOfferingQueryResp,
  BackupDataFormImageStorageResp,
  BackupDataFormImageStorage
} from './virtual-router-offering.model'
import { VirtualRouterOfferingService } from './virtual-router-offering.service'

@Resolver(() => VirtualRouterOffering)
export class VirtualRouterOfferingResolver {
  @Inject() virtualRouterOfferingService: VirtualRouterOfferingService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Inject() imageDataloader: ImageDataloader
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @Query(() => VirtualRouterOfferingQueryResp)
  async virtualRouterOfferingList(
    @Args() queryArgs: QueryAction
  ): Promise<VirtualRouterOfferingQueryResp> {
    return await this.virtualRouterOfferingService.queryList(queryArgs)
  }

  @ResolveField()
  async toPublic(@Parent() { uuid }: VirtualRouterOffering): Promise<boolean> {
    const rt = await this.ownerDataLoader.queryResourceShareType(uuid)

    return rt === ShareType.Public
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() { uuid }: VirtualRouterOffering): Promise<ShareType> {
    return await this.ownerDataLoader.queryResourceShareType(uuid)
  }

  @ResolveField(() => Image, {
    description: '普通用户可能查询不到数据，admin也许只是共享了计算规格，没有共享镜像。'
  })
  async image(@Parent() { uuid, imageUuid }: VirtualRouterOffering) {
    return this.imageDataloader.query(uuid, imageUuid)
  }

  @ResolveField(() => L3Network)
  async managementNetwork(@Parent() { uuid, managementNetworkUuid }: VirtualRouterOffering) {
    return this.l3NetworkDataloader.query(`${uuid}-management`, managementNetworkUuid)
  }

  @ResolveField(() => L3Network)
  async publicNetwork(@Parent() { uuid, publicNetworkUuid }: VirtualRouterOffering) {
    return this.l3NetworkDataloader.query(`${uuid}-public`, publicNetworkUuid)
  }
}

@Resolver(() => BackupDataFormImageStorage)
export class BackupDataFormImageStorageResolver {
  @Inject() virtualRouterOfferingService: VirtualRouterOfferingService

  @Query(() => BackupDataFormImageStorageResp)
  async getDatabaseBackupFromImageStore(
    @Args() queryArgs: QueryAction
  ): Promise<BackupDataFormImageStorageResp> {
    return await this.virtualRouterOfferingService.getDatabaseBackupFromImageStore(queryArgs)
  }
}
