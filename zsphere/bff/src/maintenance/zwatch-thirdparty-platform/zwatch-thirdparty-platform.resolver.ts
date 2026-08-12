import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { QueryThirdpartyPlatformService } from './query/zwatch-thirdparty-platform-query.service'
import {
  Owners,
  ThirdpartyPlatform,
  ThirdpartyPlatformQueryResp
} from './zwatch-thirdparty-platform.model'

@Resolver(() => ThirdpartyPlatform)
export class ThirdpartyPlatformResolver {
  @Inject()
  queryThirdpartyPlatformService: QueryThirdpartyPlatformService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => ThirdpartyPlatformQueryResp)
  async thirdpartyPlatformList(
    @Args() queryArgs: QueryAction
  ): Promise<ThirdpartyPlatformQueryResp> {
    return this.queryThirdpartyPlatformService.query(queryArgs)
  }

  @Query(() => ThirdpartyPlatformQueryResp)
  async zcexPlatformList(@Args() queryArgs: QueryAction): Promise<ThirdpartyPlatformQueryResp> {
    return this.queryThirdpartyPlatformService.queryZcexPlatformList(queryArgs)
  }

  @ResolveField(() => Owners)
  async owner(@Parent() thirdpartyPlatform: ThirdpartyPlatform) {
    return this.queryThirdpartyPlatformService.getOwner(thirdpartyPlatform.uuid)
  }
}
