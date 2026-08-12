import { Module } from '@nestjs/common'

import { AttachL2NetworkToHostService } from './attach-to-vswitch'
import { CloseHostIommuService } from './close-host-iommu'
import { DeleteHostService } from './delete-host'
import { DisableHostService } from './disable-host'
import { EditHostConfigService } from './edit-config'
import { EnableHostService } from './enable-host'
import { MaintenanceHostService } from './maintenance-host'
import { OpenHostIommuService } from './open-host-iommu'
import { ReconnectHostService } from './reconnect-host'
import { SetHostEptSupportService } from './set-ept-support'
import { UpdateHostService } from './update-host'
import { UpdateHostIPMIService } from './update-IPMI'
import { UpdateKVMHostService } from './update-kvm-host'
import { UpdateHostPowerStatusService } from './update-power-status'

@Module({
  providers: [
    EnableHostService,
    DisableHostService,
    MaintenanceHostService,
    UpdateHostService,
    UpdateKVMHostService,
    CloseHostIommuService,
    OpenHostIommuService,
    DeleteHostService,
    ReconnectHostService,
    SetHostEptSupportService,
    UpdateHostPowerStatusService,
    UpdateHostIPMIService,
    EditHostConfigService,
    AttachL2NetworkToHostService
  ],
  exports: []
})
export class HostActionModule {}
