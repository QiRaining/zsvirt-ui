import { Module } from '@nestjs/common'

import { AddSchedulerFullJobsToSchedulerFullJobGroupTaskService } from './add-scheduler-full-jobs-to-scheduler-full-job-group-task.service'
import { AddSchedulerJobGroupToSchedulerFullTriggerTaskService } from './add-scheduler-job-group-to-scheduler-full-trigger-task.service'
import { AddSchedulerJobGroupToSchedulerTriggerTaskService } from './add-scheduler-job-group-to-scheduler-trigger-task.service'
import { AddSchedulerJobsToSchedulerJobGroupTaskService } from './add-scheduler-jobs-to-scheduler-job-group-task.service'
import { CreateResourceBackupJobActionHandlerService } from './create-resource-backup-job-action-handler.service'
import { CreateResourceBackupJobTaskHandlerService } from './create-resource-backup-job-task-handler.service'
import { CreateResourceBackupJobService } from './create-resource-backup-job.service'
import { CreateSchedulerFullJobTaskService } from './create-scheduler-full-job-task.service'
import { CreateSchedulerFullTriggerTaskService } from './create-scheduler-full-trigger-task.service'
import { CreateSchedulerJobGroupTaskService } from './create-scheduler-job-group-task.service'
import { CreateSchedulerJobTaskService } from './create-scheduler-job-task.service'
import { CreateSchedulerTriggerTaskService } from './create-scheduler-trigger-task.service'
import { UpdateSchedulerJobGroupTaskService } from './update-scheduler-job-group-task.service'

@Module({
  providers: [
    CreateResourceBackupJobService,
    CreateResourceBackupJobTaskHandlerService,
    CreateResourceBackupJobActionHandlerService,
    CreateSchedulerTriggerTaskService,
    CreateSchedulerFullTriggerTaskService,
    CreateSchedulerJobTaskService,
    CreateSchedulerFullJobTaskService,
    CreateSchedulerJobGroupTaskService,
    UpdateSchedulerJobGroupTaskService,
    AddSchedulerJobsToSchedulerJobGroupTaskService,
    AddSchedulerFullJobsToSchedulerFullJobGroupTaskService,
    AddSchedulerJobGroupToSchedulerTriggerTaskService,
    AddSchedulerJobGroupToSchedulerFullTriggerTaskService
  ]
})
export class CreateResourceBackupJobModule {}
