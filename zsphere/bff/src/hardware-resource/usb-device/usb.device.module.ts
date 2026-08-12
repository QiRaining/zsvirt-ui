import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { UsbDeviceActionModule } from './action/_module'
import { UsbDeviceResolver } from './usb.device.resolver'
import { UsbDeviceService } from './usb.device.service'

@Module({
  imports: [
    UsbDeviceActionModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [UsbDeviceResolver, UsbDeviceService, VmInstanceDataloader],
  exports: [UsbDeviceService]
})
export class UsbDeviceModule {}
