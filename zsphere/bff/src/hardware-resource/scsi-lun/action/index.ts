import { Module } from '@nestjs/common'

import { AttachScsiLunToVmInstanceService } from './attach-scsi-lun-to-vm-instance'
import { CheckScsiLunClusterStatusService } from './check-scsi-lun-cluster-status'
import { DetachScsiLunFromVmInstanceService } from './detach-scsi-lun-from-vm-instance'

@Module({
  providers: [
    CheckScsiLunClusterStatusService,
    AttachScsiLunToVmInstanceService,
    DetachScsiLunFromVmInstanceService
  ],
  exports: [AttachScsiLunToVmInstanceService, DetachScsiLunFromVmInstanceService]
})
export class ScsiLunActionModule {}
