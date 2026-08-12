import { Module } from '@nestjs/common'
import { ChangeSchedulerStateActionService } from './change-scheduler-state'
import { ChangeSchedulerJobStateService } from './change-state'
import { DeleteSchedulerJobService } from './delete'

@Module({
  providers: [
    ChangeSchedulerJobStateService,
    DeleteSchedulerJobService,
    ChangeSchedulerStateActionService
  ],
  exports: []
})
export class SchedulerJobActionModule {}
