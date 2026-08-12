import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, Parent, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { AccountThirdPartyAuthQueryService } from '@/zsphere-administration/account-third-party-auth/account-third-party-auth.service'

import { ThirdPartyAuthQueryService } from './query/third-party-auth-query.service'
import {
  ThirdPartyAuthVO,
  ThirdPartyAuthResp,
  ThirdPartyAuthSystemTag,
  ThirdPartyAuthResourceref,
  ThirdPartyAuthResourceConfig
} from './third-party-auth.model'

@Resolver(() => ThirdPartyAuthVO)
export class ThirdPartyAuthResolver {
  @Inject()
  thirdPartyauthQueryService: ThirdPartyAuthQueryService
  accountThirdPartyAuthQueryService: AccountThirdPartyAuthQueryService

  @Query(() => ThirdPartyAuthResp)
  async thirdPartyAuthList(@Args() queryArgs: QueryAction) {
    return await this.thirdPartyauthQueryService.query(queryArgs)
  }

  @ResolveField(() => ThirdPartyAuthSystemTag)
  async relatedSystemTag(@Parent() auth: ThirdPartyAuthVO) {
    return await this.thirdPartyauthQueryService.getSystemTagInfo(auth.uuid)
  }
  @ResolveField(() => ThirdPartyAuthResourceref)
  async bindResourceref(@Parent() auth: ThirdPartyAuthVO) {
    return await this.thirdPartyauthQueryService.getBindResourceref(auth.uuid)
  }
  @ResolveField(() => ThirdPartyAuthResourceConfig)
  async resourceConfig(@Parent() auth: ThirdPartyAuthVO) {
    return await this.thirdPartyauthQueryService.getResourceConfig(auth.uuid)
  }
}
