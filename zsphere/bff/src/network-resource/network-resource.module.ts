import { Module } from '@nestjs/common'

import { L3NetworkModule } from './l3-network/l3-network.module'
import { SdnControllerModule } from './sdn-controller/sdn-controller.module'
import { VirtualRouterOfferingModule } from './virtual-router-offering/virtual-router-offering.module'
import { VRouterRouteTableModule } from './vrouter-route-table/vrouter-route-table.module'
import { VxlanPoolModule } from './vxlan-pool/vxlan-pool.module'

@Module({
  imports: [
    SdnControllerModule,
    L3NetworkModule,
    VirtualRouterOfferingModule,
    VRouterRouteTableModule,
    VxlanPoolModule
  ]
})
export class NetworkResourceModule {}
