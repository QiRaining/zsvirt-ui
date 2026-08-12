import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'
import { OperationLogActionModule } from '@/zsphere-administration/operation-log/action/_modules'

import { ChangeVolumeStateService } from './change-volume-state'
import { CreateDataVolumeService } from './create'
import { CreateDataVolumeFromVolumeTempalteService } from './create-from-volume-template'
import { DeleteDataVolumeService } from './delete-data-volume'
import { DeleteVolumeQosService } from './delete-volume-qos'
import { ExpungeDataVolumeService } from './expunge-data-volume'
import { PrimaryStorageMigrateVolumeService } from './primary-storage-migrate-volume'
import { RecoverDataVolumeService } from './recover-data-volume'
import { ResizeDataVolumeService } from './resize-data-volume'
import { SetVolumeQosService } from './set-volume-qos'
import { SyncVolumeSizeService } from './sync-volume-size'
import { UpdateVolumeService } from './update-volume'

@Module({
  imports: [OperationLogActionModule],
  providers: [
    LongJobService,
    ChangeVolumeStateService,
    SetVolumeQosService,
    DeleteVolumeQosService,
    ResizeDataVolumeService,
    DeleteDataVolumeService,
    ExpungeDataVolumeService,
    RecoverDataVolumeService,
    SyncVolumeSizeService,
    PrimaryStorageMigrateVolumeService,
    CreateDataVolumeService,
    UpdateVolumeService,
    CreateDataVolumeFromVolumeTempalteService,
  ],
  exports: [
    ChangeVolumeStateService,
    SetVolumeQosService,
    DeleteVolumeQosService,
    ResizeDataVolumeService,
    DeleteDataVolumeService,
    ExpungeDataVolumeService,
    RecoverDataVolumeService,
    SyncVolumeSizeService,
    PrimaryStorageMigrateVolumeService,
    CreateDataVolumeService,
    UpdateVolumeService,
    CreateDataVolumeFromVolumeTempalteService,
  ]
})
export class VolumeActionModule {}
