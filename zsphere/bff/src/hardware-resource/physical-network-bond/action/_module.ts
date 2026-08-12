import { Module } from '@nestjs/common'

import { SetPhysicalNetworkBondPhysicalNetworkTypeService } from './set-interfacePhysicalNetworkType'

@Module({
  imports: [],
  providers: [SetPhysicalNetworkBondPhysicalNetworkTypeService],
  exports: []
})
export class PhysicalNetworkBondActionModule {}
