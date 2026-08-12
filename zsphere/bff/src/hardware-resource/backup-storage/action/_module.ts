import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'

import { ChangeBackupStorageStateService } from './change-backup-storage-state'
import { AddCephBackupStorageService } from './create-ceph'
import { AddImageStoreBackupStorageService } from './create-image-store'
import { DeleteBackupStorageService } from './delete'
import { ReclaimSpaceFromImageStoreService } from './reclaim-space-from-image-store'
import { ReconnectBackupStorageService } from './reconnect'
import { TestConnectionService } from './test-connect'
import { UpdateBackupStorageService } from './update'

@Module({
  providers: [
    LongJobService,
    ChangeBackupStorageStateService,
    ReconnectBackupStorageService,
    DeleteBackupStorageService,
    UpdateBackupStorageService,
    ReclaimSpaceFromImageStoreService,
    AddImageStoreBackupStorageService,
    AddCephBackupStorageService,
    TestConnectionService
  ],
  exports: []
})
export class BSActionModule {}
