import { Module } from '@nestjs/common'

import { MdevDeviceActionModule } from '@/hardware-resource/mdev-device/action/_module'
import { PciDeviceActionModule } from '@/hardware-resource/pci-device/action/_module'

import { UpdateThirdpartyAlertsAsReadService } from './mark-event-data-as-read'

@Module({
  imports: [PciDeviceActionModule, MdevDeviceActionModule],
  providers: [UpdateThirdpartyAlertsAsReadService],
  exports: []
})
export class ThirdPartyAlertsActionModule {}
