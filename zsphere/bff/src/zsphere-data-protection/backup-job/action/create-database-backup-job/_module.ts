import { Module } from '@nestjs/common'

import { AddSchedulerJobToSchedulerTriggerTaskService } from './add-scheduler-job-to-scheduler-trigger-task.service'
import { CreateDatabaseBackupJobActionHandlerService } from './create-database-backup-job-action-handler.service'
import { CreateDatabaseBackupJobTaskHandlerService } from './create-database-backup-job-task-handler.service'
import { CreateSchedulerJobTaskService } from './create-scheduler-job-task.service'
import { CreateSchedulerTriggerTaskService } from './create-scheduler-trigger-task.service'

@Module({
  providers: [
    CreateDatabaseBackupJobTaskHandlerService,
    CreateDatabaseBackupJobActionHandlerService,
    CreateSchedulerTriggerTaskService,
    CreateSchedulerJobTaskService,
    AddSchedulerJobToSchedulerTriggerTaskService
  ]
})
export class CreateDatabaseBackupJobModule {}
