import { Inject } from '@nestjs/common'
import { Resolver, ResolveField, Mutation, Args, Query, Parent } from '@nestjs/graphql'

import { InstanceOfferingInventory } from '@/api/zstack/types'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import {
  InstanceOffering,
  CreateInstanceOfferingInput,
  InstanceOfferingQueryResp,
  InstanceOfferingActionResp,
  ShareInstanceOfferingToPublicInput,
  RevokeInstanceOfferingSharingFromPublicInput,
  InstanceOfferingSystemTags,
  ValidatInstanceOfferingUserConfigResp
} from './instance-offering.model'
import { InstanceOfferingService } from './instance-offering.service'

@Resolver(() => InstanceOffering)
export class InstanceOfferingResolver {
  @Inject() instanceOfferingService: InstanceOfferingService
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => InstanceOffering, { nullable: true })
  async instanceOffering(@Args('uuid') uuid: string): Promise<InstanceOfferingInventory | null> {
    return this.instanceOfferingService.queryByUuid(uuid)
  }

  @Query(() => InstanceOfferingQueryResp)
  async instanceOfferingList(@Args() queryArgs: QueryAction): Promise<InstanceOfferingQueryResp> {
    return this.instanceOfferingService.query(queryArgs)
  }

  @ResolveField('toPublic', () => Boolean, { nullable: true })
  async instanceOfferingToPublic(@Parent() InstanceOffering: InstanceOffering): Promise<boolean> {
    return await this.instanceOfferingService.queryToPublic(InstanceOffering.uuid)
  }

  @ResolveField('systemTags', () => InstanceOfferingSystemTags)
  async getSystemTags(
    @Parent() InstanceOffering: InstanceOffering
  ): Promise<InstanceOfferingSystemTags> {
    return await this.instanceOfferingService.querySystemTags(InstanceOffering.uuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() InstanceOffering: InstanceOffering): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(InstanceOffering.uuid)
  }

  @Mutation(() => InstanceOfferingActionResp)
  async shareInstanceOfferingToPublic(
    @Args('input') input: ShareInstanceOfferingToPublicInput
  ): Promise<InstanceOfferingActionResp> {
    return this.instanceOfferingService.shareToPublic(input)
  }

  @Mutation(() => InstanceOfferingActionResp)
  async revokeInstanceOfferingShareingFromPublic(
    @Args('input') input: RevokeInstanceOfferingSharingFromPublicInput
  ): Promise<InstanceOfferingActionResp> {
    return this.instanceOfferingService.revokeFromPublic(input)
  }
  @Query(() => ValidatInstanceOfferingUserConfigResp)
  async validatInstanceOfferingUserConfig(@Args('config') config: string) {
    return this.instanceOfferingService.validateInstanceOfferingUserConfig(config)
  }
}
