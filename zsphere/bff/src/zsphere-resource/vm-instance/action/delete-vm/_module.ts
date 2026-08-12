import { Module } from '@nestjs/common'

import { DeleteVmInstanceActionHandlerService } from './delete-vm-instance-action-handler-task.service'
import { DeleteVmInstanceActionService } from './delete-vm-instance-action.service'
import { DeleteVmInstanceTaskHandlerService } from './delete-vm-instance-task-handler-task.service'
import { DeleteVmInstanceTaskService } from './delete-vm-task.service'
import { DeleteVolumeTaskService } from './delete-volume-task.service'

@Module({
  providers: [
    DeleteVmInstanceActionService,
    DeleteVmInstanceActionHandlerService,
    DeleteVmInstanceTaskHandlerService,
    DeleteVmInstanceTaskService,
    DeleteVolumeTaskService
  ],
  exports: [DeleteVmInstanceActionService]
})
export class DeleteVmInstanceActionModule {}
