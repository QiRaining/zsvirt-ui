import { Module } from '@nestjs/common'

import { AttachMdevDeviceToVmService } from './attach-to-vm'
import { DetachMdevDeviceFromVmService } from './detach-from-vm'
import { GenerateMdevDeviceService } from './generate-mdev'
import { UnGenerateMdevDeviceService } from './ungenerate-mdev'

@Module({
  providers: [
    AttachMdevDeviceToVmService,
    DetachMdevDeviceFromVmService,
    GenerateMdevDeviceService,
    UnGenerateMdevDeviceService
  ],
  exports: [AttachMdevDeviceToVmService, DetachMdevDeviceFromVmService]
})
export class MdevDeviceActionModule {}
