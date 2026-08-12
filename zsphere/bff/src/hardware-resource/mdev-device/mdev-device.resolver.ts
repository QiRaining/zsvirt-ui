import { Inject } from '@nestjs/common'
import { Resolver, Query, ResolveField, Parent, Mutation, Args } from '@nestjs/graphql'

import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ActionSendResp as IActionSendResp } from '@/common/model/action-send-resp.model'
import { MdevDeviceQueryService } from '@/hardware-resource/mdev-device/mdev-device-query/mdev-device-query.service'
import {
  MdevDevice as IMdevDevice,
  AttachMdevDeviceToVmInput as IAttachMdevDeviceToVmInput,
  DetachMdevDeviceFromVmInput as IDetachMdevDeviceFromVmInput,
  MdevDeviceActionResp as IMdevDeviceActionResp
  // GenerateMdevDevicesActionInput as IGenerateMdevDevicesActionInput
} from '@/hardware-resource/mdev-device/mdev-device.model'

@Resolver(() => IMdevDevice)
export class MdevDeviceResolver {
  @Inject() mdevDeviceQueryService: MdevDeviceQueryService

  @Query(() => [IMdevDevice])
  async mdevDevice(@Args() queryArgs: IQueryAction) {
    return this.mdevDeviceQueryService.get(queryArgs)
  }

  @ResolveField()
  async mdevDeviceSpec(@Parent() mdevDevice: IMdevDevice) {
    return this.mdevDeviceQueryService.getMdevDeviceSpec(mdevDevice.uuid, mdevDevice.mdevSpecUuid)
  }

  @ResolveField()
  async host(@Parent() gpuDevice: IMdevDevice) {
    return this.mdevDeviceQueryService.getHost(gpuDevice.uuid, gpuDevice.hostUuid)
  }

  @ResolveField()
  async vmInstance(@Parent() gpuDevice: IMdevDevice) {
    return this.mdevDeviceQueryService.getVmInstance(gpuDevice.uuid, gpuDevice.vmInstanceUuid)
  }
}
