import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, ResolveField, Parent, Mutation } from '@nestjs/graphql'

import { SecretResourcePoolDataloader } from '../secret-resource-pool/secret-resource-pool.dataloader'
import {
  CheckSyncInput,
  SecretResourcePool
} from '../secret-resource-pool/secret-resource-pool.model'
import { SecurityMachineQueryService } from './query/security-machine.query.service'
import {
  AsyncSecurityMachineTotal,
  QuerySecurityMachineArgs,
  SecurityMachine,
  SecurityMachineList
} from './security-machine.model'

@Resolver(() => SecurityMachine)
export class SecretResourceResolver {
  @Inject() securityMachineQueryService: SecurityMachineQueryService
  @Inject() secretResourcePoolDataloader: SecretResourcePoolDataloader

  @Query(() => SecurityMachineList)
  securityMachineList(@Args() queryArgs: QuerySecurityMachineArgs) {
    return this.securityMachineQueryService.get(queryArgs)
  }

  @Query(() => SecurityMachine)
  securityMachine(@Args('uuid') uuid: string) {
    return this.securityMachineQueryService.securityMachine(uuid)
  }

  @Query(() => SecurityMachineList)
  querySecurityMachineList(@Args('zoneUuid') zoneUuid: string) {
    return this.securityMachineQueryService.querySecurityMachineList(zoneUuid)
  }

  @ResolveField(() => SecretResourcePool)
  secretResourcePool(@Parent() securityMachine: SecurityMachine) {
    const { uuid, secretResourcePoolUuid } = securityMachine

    return this.secretResourcePoolDataloader.query(
      `${uuid}-${secretResourcePoolUuid}`,
      secretResourcePoolUuid
    )
  }

  @Query(() => AsyncSecurityMachineTotal)
  asyncSecurityMachineCount() {
    return this.securityMachineQueryService.asyncSecurityMachineCount()
  }

  @Mutation(() => [SecurityMachine])
  unsyncedSecurityMachineList(@Args('input') input: CheckSyncInput) {
    return this.securityMachineQueryService.unsyncedSecurityMachineList(input)
  }
}
