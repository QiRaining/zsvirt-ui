import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import {
  DataProtectionRelatedSummary,
  EnableCryptoComplianceProgress,
  GetDataProtectionRelatedSummaryInput,
  GlobalConfigAndRcPool,
  GlobalConfigAndRcPoolInput,
  GlobalConfigAndSecretResourcePoolList,
  QueryEnableCryptoComplianceProgressInput,
  QueryGlobalConfigAndSecretResourcePoolArgs
} from './platform-crypto-cmpl.model'
import { PlatformCryptoCmplService } from './platform-crypto-cmpl.service'

@Resolver(() => GlobalConfigAndRcPool)
export class PlatformCryptoCmplResolver {
  @Inject() platformCryptoCmplService: PlatformCryptoCmplService

  @Query(() => GlobalConfigAndRcPool)
  getGlobalConfigAndRcPool(@Args('input') globalConfigAndRcPoolInput: GlobalConfigAndRcPoolInput) {
    return this.platformCryptoCmplService.getGlobalConfigAndRcPool(globalConfigAndRcPoolInput)
  }

  @Query(() => GlobalConfigAndSecretResourcePoolList)
  globalConfigAndSecretResourcePoolList(
    @Args() queryArgs: QueryGlobalConfigAndSecretResourcePoolArgs
  ) {
    return this.platformCryptoCmplService.globalConfigAndSecretResourcePoolList(queryArgs)
  }

  @Query(() => EnableCryptoComplianceProgress)
  queryEnableCryptoComplianceProgress(
    @Args('input')
    input: QueryEnableCryptoComplianceProgressInput
  ) {
    return this.platformCryptoCmplService.queryEnableCryptoComplianceProgress(input)
  }

  @Query(() => DataProtectionRelatedSummary)
  getDataProtectionRelatedSummary(@Args('input') input: GetDataProtectionRelatedSummaryInput) {
    return this.platformCryptoCmplService.getDataProtectionRelatedSummary(input)
  }
}
