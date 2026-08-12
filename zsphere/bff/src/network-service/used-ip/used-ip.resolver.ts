import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { VmNicDataloader } from '@/zsphere-resource/vm-nic/vm-nic.dataloader'
import { VmNic } from '@/zsphere-resource/vm-nic/vm-nic.model'

import { QueryUsedIpArgs, UsedIpListResp, VmNicUsedIp } from './used-ip.model'
import { UsedIpService } from './used-ip.service'

@Resolver(() => VmNicUsedIp)
export class UsedIpResolver {
  @Inject() usedIpService: UsedIpService
  @Inject() vmNicDataloader: VmNicDataloader

  @Query(() => UsedIpListResp)
  async usedIpList(@Args() queryArgs: QueryUsedIpArgs) {
    return this.usedIpService.query(queryArgs)
  }

  @ResolveField(() => VmNic, { nullable: true })
  async vmNic(@Parent() vmNicUsedIp: VmNicUsedIp) {
    return await this.vmNicDataloader.query(vmNicUsedIp.uuid, vmNicUsedIp.vmNicUuid)
  }
}
