import { Inject } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import { DisasterRecoveryServiceState } from './disaster-recovery-service.model'
import { DisasterRecoveryServiceMockStore } from './mock-store'

@Resolver(() => DisasterRecoveryServiceState)
export class DisasterRecoveryServiceResolver {
  @Inject()
  private readonly store: DisasterRecoveryServiceMockStore

  @Query(() => DisasterRecoveryServiceState)
  disasterRecoveryService() {
    return this.store.getState()
  }
}
