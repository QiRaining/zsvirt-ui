import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { SecurityMachine } from '../security-machine/security-machine.model'
import { SecretResourcePoolQueryService } from './query/secret-resource-pool.query.service'
import {
  CheckSyncInput,
  QuerySecretResourcePoolArgs,
  SecretResourcePool,
  SecretResourcePoolList
} from './secret-resource-pool.model'

@Resolver(() => SecretResourcePool)
export class SecretResourcePoolResolver {
  @Inject() secretResourcePoolQueryService: SecretResourcePoolQueryService

  @Query(() => SecretResourcePoolList)
  secretResourcePoolList(@Args() queryArgs: QuerySecretResourcePoolArgs) {
    return this.secretResourcePoolQueryService.get(queryArgs)
  }

  @Query(() => SecretResourcePoolList)
  querySecretResourcePoolList(@Args('zoneUuid') zoneUuid: string) {
    return this.secretResourcePoolQueryService.querySecretResourcePoolList(zoneUuid)
  }

  @Query(() => SecretResourcePool)
  secretResourcePool(@Args('uuid') uuid: string) {
    return this.secretResourcePoolQueryService.secretResourcePool(uuid)
  }

  @ResolveField(() => [SecurityMachine])
  securityMachine(@Parent() secretResourcePool: SecretResourcePool) {
    return this.secretResourcePoolQueryService.getSecurityMachine(secretResourcePool.uuid)
  }

  @ResolveField(() => Boolean)
  isEnableCryptoCmpl(@Parent() secretResourcePool: SecretResourcePool) {
    return this.secretResourcePoolQueryService.isEnableCryptoCmpl(secretResourcePool.uuid)
  }

  @Query(() => [SecurityMachine])
  checkSync(@Args('input') checkSyncInput: CheckSyncInput) {
    return this.secretResourcePoolQueryService.checkSync(checkSyncInput)
  }
}
