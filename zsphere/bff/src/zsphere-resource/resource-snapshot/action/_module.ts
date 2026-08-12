import { Module } from '@nestjs/common'

import { BatchCreateVolumeSnapshotService } from './batch-create'
import { CreateVolumeSnapshotService } from './create'
import { DeleteVolumeSnapshotService } from './delete'
import { RevertVolumeFromSnapshotService } from './revert'
import { UpdateVolumeSnapshotService } from './update'
import { ZSVRevertVolumeFromSnapshotService } from './zsv-revert'
import { CreateVMFromZSVSnapshot } from './zsv-snapshot-create-vm'

@Module({
  providers: [
    CreateVolumeSnapshotService,
    DeleteVolumeSnapshotService,
    RevertVolumeFromSnapshotService,
    UpdateVolumeSnapshotService,
    CreateVMFromZSVSnapshot,
    ZSVRevertVolumeFromSnapshotService,
    BatchCreateVolumeSnapshotService
  ],
  exports: []
})
export class SnapshotActionModule {}
