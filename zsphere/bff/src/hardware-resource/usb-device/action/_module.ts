import { Module } from '@nestjs/common'

import { AttachUsbDeviceToVmService } from './attach-usb'
import { DetachUsbDeviceToVmService } from './detach-usb'
import { UpdateUsbDeviceService } from './update-usb'

@Module({
  providers: [AttachUsbDeviceToVmService, DetachUsbDeviceToVmService, UpdateUsbDeviceService],
  exports: [AttachUsbDeviceToVmService, DetachUsbDeviceToVmService]
})
export class UsbDeviceActionModule {}
