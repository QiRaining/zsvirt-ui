import { Inject } from '@nestjs/common'
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { QueryUsbArgs, UpdateUsbInput, UsbDevice, UsbDeviceQueryResp } from './usb.device.model'
import { UsbDeviceService } from './usb.device.service'

@Resolver(() => UsbDevice)
export class UsbDeviceResolver {
  @Inject() usbDeviceService: UsbDeviceService
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => UsbDeviceQueryResp)
  async usbsDeviceList(@Args() queryArgs: QueryUsbArgs): Promise<UsbDeviceQueryResp> {
    return this.usbDeviceService.query(queryArgs)
  }

  @ResolveField()
  async host(@Parent() UsbDevice: UsbDevice): Promise<string> {
    return await this.usbDeviceService.queryHost(UsbDevice.hostUuid)
  }

  @ResolveField()
  async vmInstance(@Parent() usbDevice: UsbDevice) {
    return this.vmInstanceDataloader.query(usbDevice.uuid, usbDevice.vmInstanceUuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() usbDevice: UsbDevice) {
    return this.vmInstanceDataloader.queryTemplatedVmInstance(usbDevice.vmInstanceUuid)
  }

  @Mutation(() => ActionSendResp)
  async updateUsb(@Args('input') input: UpdateUsbInput) {
    await this.usbDeviceService.update(input)
    return { success: true }
  }
}
