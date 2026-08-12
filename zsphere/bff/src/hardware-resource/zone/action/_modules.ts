import { Module } from '@nestjs/common'

import { AttachRemoteBackupStorageToZoneService } from './attach'
import { ChangeZoneStateService } from './change-state'
import { CreateZoneService } from './create'
import { DeleteZoneService } from './delete'
import { DetachRemoteBackupStorageFromZoneService } from './detach'
import { UpdateZoneService } from './update'

@Module({
  providers: [
    ChangeZoneStateService,
    DeleteZoneService,
    UpdateZoneService,
    CreateZoneService,
    AttachRemoteBackupStorageToZoneService,
    DetachRemoteBackupStorageFromZoneService
  ],
  exports: []
})
export class ZoneActionModule {}
