import { Module, forwardRef } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { PciDevicModule } from '@/hardware-resource/pci-device/pci-device.module'
import { ScsiLunModule } from '@/hardware-resource/scsi-lun/scsi-lun.module'
import { SeDeviceModule } from '@/hardware-resource/se-device/se.device.module'
import { TpmModule } from '@/hardware-resource/tpm/tpm.module'
import { UsbDeviceModule } from '@/hardware-resource/usb-device/usb.device.module'
import { VGpuDeviceModule } from '@/hardware-resource/vgpu-device/vgpu-device.module'

import { CdRomsModule } from '../cdroms/cdroms.module'
import { VmNicModule } from '../vm-nic/vm-nic.module'
import { VolumeModule } from '../volume/volume.module'
import { VmRelatedResourceResolver } from './related-resource.resolver'

@Module({
  imports: [
    ZStackApiModule,
    VmNicModule,
    CdRomsModule,
    ScsiLunModule,
    UsbDeviceModule,
    TpmModule,
    VolumeModule,
    VGpuDeviceModule,
    forwardRef(() => PciDevicModule),
    SeDeviceModule
  ],
  providers: [VmRelatedResourceResolver]
})
export class VmRelatedResourceModule {}
