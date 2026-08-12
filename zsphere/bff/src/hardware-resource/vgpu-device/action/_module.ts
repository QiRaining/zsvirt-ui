import { Module } from '@nestjs/common'

import { MdevDeviceActionModule } from '@/hardware-resource/mdev-device/action/_module'
import { PciDeviceActionModule } from '@/hardware-resource/pci-device/action/_module'

import { AttachVGpuToVmInstanceService } from './attach-to-vm'
import { DetachVGpuFromVmInstanceService } from './detach-from-vm'
import { UpdateVGPUDeviceService } from './update-vgpu-device'

@Module({
  imports: [PciDeviceActionModule, MdevDeviceActionModule],
  providers: [
    AttachVGpuToVmInstanceService,
    DetachVGpuFromVmInstanceService,
    UpdateVGPUDeviceService
  ],
  exports: [AttachVGpuToVmInstanceService, DetachVGpuFromVmInstanceService]
})
export class VGpuDeviceActionModule {}
