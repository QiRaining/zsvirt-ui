import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'

import { CalcHashService } from './calcHash'
import { ChangeImageStateService } from './change-image-state'
import { CreateVolumeTemplateService } from './create-volume-template'
import { DeleteExportedImageService } from './delete-exported-image'
import { DeleteImageService } from './delete-image'
import { ExportImageService } from './export-image'
import { ExpungeImageService } from './expunge-image'
import { ImageModifyConfigService } from './modify-config'
import { RecoverImageService } from './recover-image'
import { RevokeImageFromPublicService } from './revoke-image-from-public'
import { SetImageBootModeService } from './set-image-boot-mode'
import { ShareImageToPublicService } from './share-image-to-public'
import { StorageMigrateService } from './storage-migrate'
import { SyncImageFromImageStoreBackupStorageService } from './sync-image-from-imagestore-backupstorage'
import { SyncImageSizeService } from './sync-image-size'
import { UpdateImageService } from './update-image'

@Module({
  providers: [
    ChangeImageStateService,
    DeleteImageService,
    ExpungeImageService,
    RecoverImageService,
    ExportImageService,
    DeleteExportedImageService,
    UpdateImageService,
    SetImageBootModeService,
    ShareImageToPublicService,
    RevokeImageFromPublicService,
    SyncImageSizeService,
    SyncImageFromImageStoreBackupStorageService,
    LongJobService,
    CreateVolumeTemplateService,
    StorageMigrateService,
    CalcHashService,
    ImageModifyConfigService
  ],
  exports: []
})
export class ImageActionModule {}
