import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

import { IpBlackWhiteList, IpBlackWhiteListQueryResp } from './ip-blackwhite-list.model'
import { IpBlackWhiteListService } from './ip-blackwhite-list.service'

@Resolver(() => IpBlackWhiteList)
export class IpBlackWhiteListResolver {
  @Inject() ipblackwhitelistService: IpBlackWhiteListService
  @Inject() dataProtectionService: DataProtectionService

  @Query(() => IpBlackWhiteListQueryResp)
  async ipblackwhiteList(@Args() queryArgs: QueryAction): Promise<IpBlackWhiteListQueryResp> {
    return this.ipblackwhitelistService.query(queryArgs)
  }

  @ResolveField(() => Boolean)
  async isValid(@Parent() ipBlackWhiteList: IpBlackWhiteList) {
    return await this.dataProtectionService.checkDataIntegrity(
      ipBlackWhiteList.uuid,
      'AccessControlRuleVO'
    )
  }
}
