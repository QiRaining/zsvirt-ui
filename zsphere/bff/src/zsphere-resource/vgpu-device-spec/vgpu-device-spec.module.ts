import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { MdevDeviceSpecService } from '@/zsphere-resource/mdev-device-spec/mdev-device-spec.service'
import { PciDeviceSpecModule } from '@/zsphere-resource/pci-device-spec/pci-device-spec.module'
import { PciDeviceSpecService } from '@/zsphere-resource/pci-device-spec/pci-device-spec.service'
import { VGpuDeviceSpecActionModule } from '@/zsphere-resource/vgpu-device-spec/action/_module'
import { VGpuDeviceSpecDataloader } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.dataloader'

import { VGpuDeviceSpecResolver } from './vgpu-device-spec.resolver'
import { VGpuDeviceSpecService } from './vgpu-device-spec.service'
@Module({
  imports: [
    VGpuDeviceSpecActionModule,
    PciDeviceSpecModule,
    OwnerModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    VGpuDeviceSpecResolver,
    VGpuDeviceSpecService,
    PciDeviceSpecService,
    MdevDeviceSpecService,
    VGpuDeviceSpecDataloader
  ],
  exports: [MdevDeviceSpecService]
})
export class VGpuDeviceSpecModule {}
