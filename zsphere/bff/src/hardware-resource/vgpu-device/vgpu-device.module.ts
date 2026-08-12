import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { MdevDeviceQueryService } from '@/hardware-resource/mdev-device/mdev-device-query/mdev-device-query.service'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import { PciDeviceDataloader } from '@/hardware-resource/pci-device/pci-device.dataloader'
import { VGpuDeviceActionModule } from '@/hardware-resource/vgpu-device/action/_module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { VGpuDeviceSpecDataloader } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.dataloader'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { VGpuDeviceResolver } from './vgpu-device.resolver'
import { VGpuDeviceService } from './vgpu-device.service'

@Module({
  imports: [VGpuDeviceActionModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    VGpuDeviceResolver,
    VGpuDeviceService,
    VmInstanceDataloader,
    PciDeviceDataloader,
    VGpuDeviceSpecDataloader,
    HostDataloader,
    PciDeviceQueryService,
    MdevDeviceQueryService
  ],
  exports: [VGpuDeviceService]
})
export class VGpuDeviceModule {}
