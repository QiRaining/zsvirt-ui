import { Inject } from '@nestjs/common'
import { Resolver, Parent, Args, Query, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  AccountThirdPartyAuth,
  AccountThirdPartyAuthResponse,
  AccounThirdPartyAuthResourceref,
  OAuthClientSecretResult,
  RedirectTemplateRef
} from './account-third-party-auth.model'
import { AccountThirdPartyAuthQueryService } from './account-third-party-auth.service'

@Resolver(() => AccountThirdPartyAuth)
export class AccountThirdPartyAuthResolver {
  @Inject()
  accountThirdPartyAuthQueryService: AccountThirdPartyAuthQueryService

  @Query(() => AccountThirdPartyAuthResponse)
  async accountThirdPartyAuthList(@Args() queryArgs: QueryAction) {
    return await this.accountThirdPartyAuthQueryService.query(queryArgs)
  }

  @Query(() => OAuthClientSecretResult)
  async getOAuthClientSecret(@Args('uuid') uuid: string) {
    return await this.accountThirdPartyAuthQueryService.getClientSecret(uuid)
  }

  @ResolveField(() => AccounThirdPartyAuthResourceref)
  async bindResourceref(@Parent() auth: AccountThirdPartyAuth) {
    return await this.accountThirdPartyAuthQueryService.getBindResourceref(auth.uuid)
  }

  @ResolveField(() => RedirectTemplateRef)
  async redirectTemplateRef(@Parent() auth: AccountThirdPartyAuth) {
    return await this.accountThirdPartyAuthQueryService.getRedirectTemplateRef(auth.uuid)
  }
}
