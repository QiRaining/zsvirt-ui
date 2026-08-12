import { Module } from '@nestjs/common'

import { BackupDataModule } from './backup-data/backup-data.module'
import { SchedulerJobGroupModule } from './backup-job/scheduler-job-group.module'
import { BackupOverviewModule } from './backup-overview/backup-overview.module'
import { DisasterRecoveryServiceModule } from './disaster-recovery-service/disaster-recovery-service.module'
import { LocalBackupStorageModule } from './local-backup-storage/local-backup-storage.module'
import { RemoteBackupStorageModule } from './remote-backup-storage/remote-backup-storage.module'
import { ZSVBackupStorageModule } from './zsv-backup-storage/zsv-backup-storage.module'

@Module({
  imports: [
    SchedulerJobGroupModule,
    BackupOverviewModule,
    BackupDataModule,
    ZSVBackupStorageModule,
    RemoteBackupStorageModule,
    LocalBackupStorageModule,
    DisasterRecoveryServiceModule
  ]
})
export class DataProtectionModule {}
