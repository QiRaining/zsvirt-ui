import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  KmsProvider,
  KmsProviderListResp,
  ParseNkpRestoreQuery,
  ParseNkpRestoreResult,
  GetKmsServerCertFromKmsResult,
  KmsIdentityListResp
} from './kms-provider.model'
import { KmsProviderQueryService } from './kms-provider.service'

@Resolver(() => KmsProvider)
export class KmsProviderResolver {
  @Inject() kmsProviderQueryService!: KmsProviderQueryService

  @Query(() => KmsProviderListResp)
  async kmsProviderList(@Args() queryArgs: QueryAction) {
    return this.kmsProviderQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async isDefault(@Parent() current: KmsProvider) {
    const defaultUuid = await this.kmsProviderQueryService.queryDefaultUuid(current.uuid)
    return !!defaultUuid && current.uuid === defaultUuid
  }

  @Query(() => Int)
  async countKmsProviders() {
    return this.kmsProviderQueryService.countKmsProviders()
  }

  @Query(() => KmsProviderListResp)
  async availableKeyProviders() {
    const list = await this.kmsProviderQueryService.queryAvailableKeyProviders()
    return { list, total: list.length }
  }

  @Query(() => Int)
  async countEncryptedResourceKeyRef(
    @Args('uuids', {
      type: () => [String]
    })
    uuids: string[]
  ) {
    return await this.kmsProviderQueryService.countEncryptedResourceKeyRef(uuids)
  }

  @Query(() => ParseNkpRestoreResult)
  async parseNkpRestore(@Args() params: ParseNkpRestoreQuery) {
    return this.kmsProviderQueryService.parseNkpRestore(params)
  }

  @Query(() => GetKmsServerCertFromKmsResult)
  getKmsServerCertFromKms(@Args('uuid') uuid: string) {
    return this.kmsProviderQueryService.getKmsServerCertFromKms(uuid)
  }

  @Query(() => KmsIdentityListResp)
  async kmsIdentityList(@Args() queryArgs: QueryAction) {
    return this.kmsProviderQueryService.queryKmsIdentityList(queryArgs)
  }
}
