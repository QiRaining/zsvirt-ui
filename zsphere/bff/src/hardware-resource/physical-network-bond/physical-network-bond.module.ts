import { Module } from '@nestjs/common'

import { BondModule } from '../bond/bond.module'
import { PhysicalNetworkBondActionModule } from './action/_module'
import { PhysicalNetworkBondResolver } from './physical-network-bond.resolver'
import { PhysicalNetworkBondService } from './physical-network-bond.service'

@Module({
  imports: [BondModule, PhysicalNetworkBondActionModule],
  providers: [PhysicalNetworkBondResolver, PhysicalNetworkBondService],
  exports: [PhysicalNetworkBondService]
})
export class PhysicalNetworkBondModule {}
