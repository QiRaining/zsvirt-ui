import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'

import {
  AccountQuotaUsage,
  AccountResp,
  AccountVO,
  GetAccountQuotaUsageArgs,
  GetAccountQuotaUsageResp,
  QueryAccountArgs
} from './account.model'
import { AccountQueryService } from './query'

@Resolver(() => AccountVO)
export class AccountResolver {
  @Inject()
  accountQueryService: AccountQueryService

  @Query(() => AccountResp)
  async accountList(@Args() queryArgs: QueryAccountArgs) {
    return await this.accountQueryService.query(queryArgs)
  }
  @ResolveField()
  async accountQuotaInfo(@Parent() account: AccountVO) {
    return await this.accountQueryService.getAccountQuotaInfo(account.uuid)
  }

  @ResolveField()
  async volumeNum(@Parent() account: AccountVO) {
    return await this.accountQueryService.getVolumeNum(account.uuid)
  }

  @ResolveField()
  async vmNum(@Parent() account: AccountVO) {
    return await this.accountQueryService.getVmNum(account.uuid)
  }

  @ResolveField()
  async role(@Parent() account: AccountVO) {
    return await this.accountQueryService.getRole(account.uuid)
  }

  @ResolveField()
  async roleFromAccountGroup(@Parent() account: AccountVO) {
    return await this.accountQueryService.getRoleFromAccountGroup(account.uuid)
  }

  @Query(() => Number)
  async accountNum(@Args() queryArgs: QueryAccountArgs) {
    const result = await this.accountQueryService.query({
      ...queryArgs,
      count: true
    })
    return result.total
  }
}

@Resolver(() => AccountQuotaUsage)
export class AccountQuotaUsageResolver {
  @Inject() getAccountQuotaUsageAction: GetAccountQuotaUsageAction

  @Query(() => GetAccountQuotaUsageResp)
  async getAccountQuotaUsage(@Args() queryArgs: GetAccountQuotaUsageArgs) {
    return this.getAccountQuotaUsageAction.call(queryArgs)
  }
}
