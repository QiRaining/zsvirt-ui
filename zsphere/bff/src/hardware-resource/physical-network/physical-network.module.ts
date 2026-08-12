import { Module } from '@nestjs/common'

import { PhysicalNetworkInterfaceModule } from '../physical-network-interface/physical-network-interface.module'
import { PhysicalNetworkService } from './physical-network.service'

@Module({
  imports: [PhysicalNetworkInterfaceModule],
  providers: [PhysicalNetworkService],
  exports: [PhysicalNetworkService]
})
export class PhysicalNetworkModule {}
