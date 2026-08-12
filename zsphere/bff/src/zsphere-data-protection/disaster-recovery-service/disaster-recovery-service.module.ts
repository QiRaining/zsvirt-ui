import { Module } from '@nestjs/common'

import { DisasterRecoveryServiceActionModule } from './action/_module'
import { DisasterRecoveryServiceResolver } from './disaster-recovery-service.resolver'
import { DisasterRecoveryServiceMockStore } from './mock-store'

@Module({
  imports: [DisasterRecoveryServiceActionModule],
  providers: [DisasterRecoveryServiceMockStore, DisasterRecoveryServiceResolver],
  exports: [DisasterRecoveryServiceMockStore]
})
export class DisasterRecoveryServiceModule {}
