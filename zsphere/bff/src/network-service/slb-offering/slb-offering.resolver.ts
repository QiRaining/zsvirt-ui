import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, ResolveField, Parent } from '@nestjs/graphql'

import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'

import { SlbOfferingQueryService } from './slb-offering-query/slb-offering-query.service'
import { QuerySlbOfferingArgs, SlbOffering, SlbOfferingList } from './slb-offering.model'

@Resolver(() => SlbOffering)
export class SlbOfferingResolver {
  @Inject() slbOfferingQueryService: SlbOfferingQueryService
  @Inject() imageDataloader: ImageDataloader
  @Inject() l3NetworkDataloader: L3NetworkDataloader
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => SlbOfferingList)
  async slbOfferingList(@Args() queryArgs: QuerySlbOfferingArgs) {
    return this.slbOfferingQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async image(@Parent() slbOffering: SlbOffering) {
    return this.imageDataloader.query(slbOffering.uuid, slbOffering?.imageUuid)
  }

  @ResolveField()
  async managementNetwork(@Parent() slbOffering: SlbOffering) {
    return this.l3NetworkDataloader.query(slbOffering.uuid, slbOffering?.managementNetworkUuid)
  }

  @ResolveField('shareType', () => ShareType)
  async shareType(@Parent() slbOffering: SlbOffering): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(slbOffering.uuid)
  }
}
