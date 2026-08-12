import { Module } from '@nestjs/common'

import { AttachPciDeviceToVmService } from './attach-to-vm'
import { DetachPciDeviceFromVMService } from './detach-from-vm'
import { UpdateHostNetworkInterfaceService } from './edit'
import { GenerateSriovPciDeviceService } from './generate-sriov'
import { LocateHostNetworkInterfaceService } from './locate-host-network-interface'
import { SetIpOnHostNetworkInterfaceService } from './set-ip'
import { UpdateHostNetworkInterfaceLldpModeService } from './set-lldp-mode'
import { UnGenerateSriovPciDeviceService } from './ungenerate-sriov'
import { UpdatePciDeviceService } from './update-pci-device'

@Module({
  providers: [
    AttachPciDeviceToVmService,
    DetachPciDeviceFromVMService,
    GenerateSriovPciDeviceService,
    UnGenerateSriovPciDeviceService,
    UpdatePciDeviceService,
    LocateHostNetworkInterfaceService,
    UpdateHostNetworkInterfaceService,
    SetIpOnHostNetworkInterfaceService,
    UpdateHostNetworkInterfaceLldpModeService
  ],
  exports: [
    AttachPciDeviceToVmService,
    DetachPciDeviceFromVMService,
    UpdateHostNetworkInterfaceService,
    UpdateHostNetworkInterfaceLldpModeService,
    SetIpOnHostNetworkInterfaceService
  ]
})
export class PciDeviceActionModule {}
