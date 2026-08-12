import { Module, forwardRef } from '@nestjs/common'

import { PciDevicModule } from '../pci-device/pci-device.module'
import { PhysicalNetworkInterfaceActionModule } from './action/_module'
import {
  InterfaceServiceResolver,
  PhysicalNetworkInterfaceResolver
} from './physical-network-interface.resolver'
import { PhysicalNetworkInterfaceService } from './physical-network-interface.service'

@Module({
  imports: [forwardRef(() => PciDevicModule), PhysicalNetworkInterfaceActionModule],
  providers: [
    PhysicalNetworkInterfaceResolver,
    InterfaceServiceResolver,
    PhysicalNetworkInterfaceService
  ],
  exports: [PhysicalNetworkInterfaceService]
})
export class PhysicalNetworkInterfaceModule {}
