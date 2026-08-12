import { Module } from '@nestjs/common'

import { AddResourceToBackupJobService } from './add-resource-to-backup-job'
import { ChangeSchedulerJobGroupStateService } from './change-basic-info'
import { DeleteResourceBackupJobService } from './delete-resource-backup-job'
import { RemoveResourceFromBackupJobService } from './remove-resource-from-backup-job'
import { UpdateResourceBackupJobStrategyService } from './update-resource-backup-job-strategy'
import { UpdateSchedulerJobGroupService } from './update-scheduler-job-group'

@Module({
  providers: [
    UpdateSchedulerJobGroupService,
    UpdateSchedulerJobGroupService,
    DeleteResourceBackupJobService,
    RemoveResourceFromBackupJobService,
    AddResourceToBackupJobService,
    UpdateResourceBackupJobStrategyService,
    ChangeSchedulerJobGroupStateService
  ]
})
export class SchedulerJobGroupActionModule {}
