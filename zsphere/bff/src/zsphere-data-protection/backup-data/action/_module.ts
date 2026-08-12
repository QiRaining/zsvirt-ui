import { Module } from '@nestjs/common'

import { RecoverDatabaseWebSocketClient } from '../port-web-socket'
import { CreateBackupDataService } from './create-backup-data'
import { DeleteBackupDataService } from './delete-backup-data'
import { ExportBackupDatabaseUrlService } from './export-database-url'
import { AttachDataVolumeToVmService } from './recover-backup-data/attach-volume-to-vm.service'
import { CreateDataVolumeFromVolumeBackupService } from './recover-backup-data/create-data-volume-from-volume-backup.service'
import { CreateDataVolumeTemplateFromVolumeBackupService } from './recover-backup-data/create-data-volume-template-from-volume-backup.service'
import { CreateRootVolumeTemplateFromVolumeBackupService } from './recover-backup-data/create-root-volume-template-from-volume-backup.service'
import { CreateVmFromVmBackupService } from './recover-backup-data/create-vm-from-vm-backup.service'
import { CreateVmFromVolumeBackupService } from './recover-backup-data/create-vm-from-volume-backup.service'
import { CreateVmInstanceService } from './recover-backup-data/create-vm.service'
import { CreateBackupDataVolumeService } from './recover-backup-data/create-volume.service'
import { DeleteImageService } from './recover-backup-data/delete-image.service'
import { OverlapBackupService } from './recover-backup-data/overlap-backup.service'
import { RecoverDatabaseService } from './recover-database'
import { ScanDatabaseBackupService } from './scan-db'
import { SyncDatabaseBackupToLocalService } from './sync-to-database-local'
import { SyncBackupDataToLocalService } from './sync-to-local'
import { SyncBackupFromImageStoreBackupStorageService } from './sync-to-remote'
import { TestDatabaseBackupStorageConnectionService } from './test-database-backupStorage-connection'
import { ZSVCreateVmFromBackupDataService } from './zsv-create-vm-from-backup-data'
import { ZSVRecoverBackupDataService } from './zsv-recover-backup-data'

@Module({
  providers: [
    SyncBackupFromImageStoreBackupStorageService,
    DeleteBackupDataService,
    CreateBackupDataService,
    ScanDatabaseBackupService,
    CreateDataVolumeFromVolumeBackupService,
    CreateDataVolumeTemplateFromVolumeBackupService,
    CreateRootVolumeTemplateFromVolumeBackupService,
    CreateVmFromVmBackupService,
    CreateVmFromVolumeBackupService,
    DeleteImageService,
    OverlapBackupService,
    AttachDataVolumeToVmService,
    CreateVmInstanceService,
    CreateBackupDataVolumeService,
    SyncBackupDataToLocalService,
    RecoverDatabaseWebSocketClient,
    ExportBackupDatabaseUrlService,
    RecoverDatabaseService,
    ZSVRecoverBackupDataService,
    ZSVCreateVmFromBackupDataService,
    SyncDatabaseBackupToLocalService,
    TestDatabaseBackupStorageConnectionService
  ],
  exports: []
})
export class BackupDataActionModule {}
