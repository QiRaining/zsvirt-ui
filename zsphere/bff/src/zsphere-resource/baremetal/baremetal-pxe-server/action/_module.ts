import { Module } from '@nestjs/common'

import { AttachBaremetalPxeServerService } from './attach-baremetal-cluster'
import { CreateBaremetalPxeServerService } from './create-baremetal-pxe-server'
import { DeleteBaremetalPxeServerService } from './delete-baremetal-pxe-server'
import { DetachBaremetalPxeServerService } from './detach-baremetal-cluster'
import { ReconnectBaremetalPxeServerService } from './reconnect-baremetal-pxe-server'
import { StartBaremetalPxeServerService } from './start-baremetal-pxe-server'
import { StopBaremetalPxeServerService } from './stop-baremetal-pxe-server'
import { UpdateBaremetalPxeServerService } from './update-baremetal-pxe-server'

@Module({
  providers: [
    StopBaremetalPxeServerService,
    StartBaremetalPxeServerService,
    ReconnectBaremetalPxeServerService,
    DeleteBaremetalPxeServerService,
    AttachBaremetalPxeServerService,
    DetachBaremetalPxeServerService,
    CreateBaremetalPxeServerService,
    UpdateBaremetalPxeServerService
  ],
  exports: [CreateBaremetalPxeServerService]
})
export class BaremetalPxeServerActionModule {}
