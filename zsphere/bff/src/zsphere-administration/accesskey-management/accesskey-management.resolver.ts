import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, Mutation, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'

import { OwnerDataLoader } from '../owner/owner.dataloader'
import { BasicOwner } from '../owner/owner.model'
import {
  CreateAccessKeyInput,
  AccessKey,
  QueryAccessKeyResp,
  // LocalOwner,
  QueryHybridKeySecretResult,
  // ThirdPartOwner,
  HybridAccountInventory,
  AccessKeyOwner
} from './accesskey-management.model'
import { AccessKeyService } from './accesskey-management.service'

@Resolver(() => HybridAccountInventory)
export class ThirdPartAccessKeyResolver {
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() accessKeyService: AccessKeyService

  @Query(() => QueryHybridKeySecretResult)
  async queryThirdpartyList(@Args() queryArgs: QueryAction): Promise<QueryHybridKeySecretResult> {
    return this.accessKeyService.queryThirdpartyList(queryArgs)
  }

  @ResolveField(() => AccessKeyOwner)
  async owner(@Parent() hybrid: HybridAccountInventory) {
    return await this.ownerDataLoader.query(hybrid.uuid)
  }
}
@Resolver(() => AccessKey)
export class AccessKeyResolver {
  @Inject() accessKeyService: AccessKeyService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => QueryAccessKeyResp)
  async accessKeyList(@Args() queryArgs: QueryAction): Promise<QueryAccessKeyResp> {
    return this.accessKeyService.query(queryArgs)
  }

  @ResolveField(() => AccessKeyOwner)
  async owner(@Parent() accesskey: AccessKey) {
    return await this.ownerDataLoader.query(accesskey.uuid)
  }
}
