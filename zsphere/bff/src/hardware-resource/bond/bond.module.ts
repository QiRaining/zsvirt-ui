import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { HostModule } from '../host/host.module'
import { PhysicalNetworkModule } from '../physical-network/physical-network.module'
import { BondActionModule } from './action/_module'
import { BondDataloader } from './bond.dataloader'
import { BondResolver } from './bond.resolver'
import { BondService } from './bond.service'

@Module({
  imports: [ZStackApiModule, BondActionModule, HostModule, PhysicalNetworkModule],
  providers: [BondService, BondResolver, BondDataloader],
  exports: [BondService, BondDataloader, BondActionModule]
})
export class BondModule {}
