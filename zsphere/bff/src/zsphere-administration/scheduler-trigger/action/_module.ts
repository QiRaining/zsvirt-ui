import { Module } from '@nestjs/common'
import { RunSchedulerTriggerService } from './run-scheduler-trigger'

@Module({
  providers: [
    RunSchedulerTriggerService
  ],
  exports: []
})
export class SchedulerTriggerActionModule {}
