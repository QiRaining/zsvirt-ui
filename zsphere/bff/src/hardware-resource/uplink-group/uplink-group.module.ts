import { Module } from '@nestjs/common'

import { BondModule } from '../bond/bond.module'
import { HostModule } from '../host/host.module'
import { PciDevicModule } from '../pci-device/pci-device.module'
import { UplinkGroupActionModule } from './action/_module'
import { UplinkGroupQueryService } from './query/uplink-group-query.service'
import { UplinkGroupResolver } from './uplink-group.resolver'

@Module({
  imports: [UplinkGroupActionModule, HostModule, BondModule, PciDevicModule],
  providers: [UplinkGroupResolver, UplinkGroupQueryService],
  exports: [UplinkGroupResolver, UplinkGroupQueryService]
})
export class UplinkGroupModule {}
