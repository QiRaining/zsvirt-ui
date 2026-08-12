import { Module } from '@nestjs/common'

import { SetPhysicalNetworkInterfacePhysicalNetworkTypeService } from './set-interfacePhysicalNetworkType'

@Module({
  imports: [],
  providers: [SetPhysicalNetworkInterfacePhysicalNetworkTypeService],
  exports: []
})
export class PhysicalNetworkInterfaceActionModule {}
