import { Inject } from '@nestjs/common'
import { Resolver, Query, ResolveField, Parent, Args } from '@nestjs/graphql'

import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { PciDeviceDataloader } from '@/hardware-resource/pci-device/pci-device.dataloader'
import { VGpuDevice, VGpuDeviceList } from '@/hardware-resource/vgpu-device/vgpu-device.model'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { VGpuDeviceSpecDataloader } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.dataloader'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

@Resolver(() => VGpuDevice)
export class VGpuDeviceResolver {
  @Inject() hostDataloader: HostDataloader
  @Inject() vGpuDeviceService: VGpuDeviceService
  @Inject() pciDeviceDataloader: PciDeviceDataloader
  @Inject() vGpuDeviceSpecDataloader: VGpuDeviceSpecDataloader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => VGpuDeviceList)
  async vgpuDeviceList(@Args() queryArgs: IQueryAction) {
    return this.vGpuDeviceService.queryVGpuDevice(queryArgs)
  }

  @ResolveField()
  async specInfo(@Parent() vgpuDevice: VGpuDevice) {
    return this.vGpuDeviceSpecDataloader.query(
      vgpuDevice.uuid,
      vgpuDevice.specUuid,
      vgpuDevice.type
    )
  }

  @ResolveField()
  async parent(@Parent() vgpuDevice: VGpuDevice) {
    return this.pciDeviceDataloader.query(vgpuDevice.uuid, vgpuDevice.parentUuid)
  }

  @ResolveField()
  async vmInstance(@Parent() vgpuDevice: VGpuDevice) {
    return this.vmInstanceDataloader.query(vgpuDevice.uuid, vgpuDevice.vmInstanceUuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() vgpuDevice: VGpuDevice) {
    return this.vmInstanceDataloader.queryTemplatedVmInstance(vgpuDevice.vmInstanceUuid)
  }

  @ResolveField()
  async host(@Parent() vgpuDevice: VGpuDevice) {
    return this.hostDataloader.query(vgpuDevice.uuid, vgpuDevice.hostUuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() vgpuDevice: VGpuDevice): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(vgpuDevice.uuid)
  }
}
