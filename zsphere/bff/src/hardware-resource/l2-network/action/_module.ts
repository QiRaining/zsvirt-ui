import { Module } from '@nestjs/common'

import { BondActionModule } from '@/hardware-resource/bond/action/_module'
import { AttachL2NetworkToHostService } from '@/hardware-resource/host/action/attach-to-vswitch'
import { CreateL3NetworkActionService } from '@/network-resource/l3-network/action/create-l3-network'

import { AttachL2NetworksToClusterWithBondService } from './attach-l2-to-cluster-with-bond'
import { CreateL2NetworkService } from './create-l2-network'
import { DeleteL2NetworkService } from './delete-l2-network'
import { SetL2NetworkSrIovService } from './set-l2-network-sr-iov'
import { UpdateL2NetworkService } from './update-l2-network'
import { UpdateVirtualSwitchUplinkService } from './update-virtual-switch-uplink'
import { UpdateVirtualSwitchUplinkBondingsService } from './update-virtual-switch-uplink-bonding'
import { UpdateVirtualSwitchUplinkGroupService } from './update-virtual-switch-uplink-group'
@Module({
  imports: [BondActionModule],
  providers: [
    UpdateL2NetworkService,
    DeleteL2NetworkService,
    SetL2NetworkSrIovService,
    CreateL2NetworkService,
    CreateL3NetworkActionService,
    AttachL2NetworksToClusterWithBondService,
    UpdateVirtualSwitchUplinkBondingsService,
    UpdateVirtualSwitchUplinkGroupService,
    UpdateVirtualSwitchUplinkService,
    AttachL2NetworkToHostService
  ],
  exports: []
})
export class L2NetworkActionModule {}
