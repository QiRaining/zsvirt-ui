import { Module } from '@nestjs/common'

import { DisasterRecoveryServiceMockStore } from '../mock-store'
import { RunDisasterRecoveryServiceActionService } from './run-disaster-recovery-service-action'

@Module({
  providers: [DisasterRecoveryServiceMockStore, RunDisasterRecoveryServiceActionService],
  exports: []
})
export class DisasterRecoveryServiceActionModule {}
