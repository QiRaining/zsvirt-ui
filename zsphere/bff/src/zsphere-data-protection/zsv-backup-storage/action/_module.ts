import { Module } from '@nestjs/common'

import { ChangeZSVBackupStorageStateService } from './change-zsv-backup-server-state'
import { CreateZSVBackupStorageService } from './create-zsv-backup-storage'
import { DeleteZSVBackupStorageService } from './delete'
import { UpdateZSVBackupStorageConfigService } from './modify-zsv-backup-storage-config'
import { ReclaimSpaceFromZSVBackupStorageService } from './reclaim-space-from-zsv-backup-storage'
import { ReconnectZSVBackupStorageService } from './reconnect-zsv-backup-storage'
import { ScanDataZSVBackupStorageService } from './scan-data'
import { UpdateZSVBackupStorageService } from './update'
import { UpdateZSVBackupStoragePasswordService } from './update-password'

@Module({
  providers: [
    DeleteZSVBackupStorageService,
    ChangeZSVBackupStorageStateService,
    ReconnectZSVBackupStorageService,
    UpdateZSVBackupStorageService,
    ReclaimSpaceFromZSVBackupStorageService,
    ScanDataZSVBackupStorageService,
    UpdateZSVBackupStorageConfigService,
    CreateZSVBackupStorageService,
    UpdateZSVBackupStoragePasswordService
  ],
  exports: []
})
export class ZSVBackupStorageActionModule {}
