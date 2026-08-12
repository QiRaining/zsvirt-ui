import { Inject } from '@nestjs/common'
import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import {
  SeDevice,
  CreateSeInput,
  SeDeviceQueryResp,
  DetachSeInput,
  AttachSeInput
} from './se.device.model'
import { SeDeviceService } from './se.device.service'

@Resolver(() => SeDevice)
export class SeDeviceResolver {
  @Inject() seDeviceService: SeDeviceService
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => SeDeviceQueryResp)
  async seDeviceList(@Args() queryArgs: QueryAction): Promise<SeDeviceQueryResp> {
    return this.seDeviceService.query(queryArgs)
  }

  @ResolveField()
  async host(@Parent() seDevice: SeDevice): Promise<string> {
    return await this.seDeviceService.queryHost(seDevice.hostUuid)
  }

  @ResolveField()
  async vmInstance(@Parent() seDevice: SeDevice) {
    return this.vmInstanceDataloader.query(seDevice.uuid, seDevice.vmInstanceUuid)
  }
}
