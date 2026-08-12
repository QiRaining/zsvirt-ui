import { Inject } from '@nestjs/common'
import { Args, Query, Parent, Resolver, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { VmNicDataloader } from '@/zsphere-resource/vm-nic/vm-nic.dataloader'
import { VmNic, VmNicListResp } from '@/zsphere-resource/vm-nic/vm-nic.model'

import { PortMirrorSession, PortMirrorSessionList } from './port-mirror-session.model'
import { PortMirrorSessionService } from './port-mirror-session.service'

@Resolver(() => PortMirrorSession)
export class PortMirrorSessionResolver {
  @Inject() portMirrorSessionService: PortMirrorSessionService
  @Inject() vmNicDataloader: VmNicDataloader

  @Query(() => PortMirrorSessionList)
  portMirrorSessionList(@Args() queryArgs: QueryAction) {
    return this.portMirrorSessionService.getPortMirrorSessionList(queryArgs)
  }

  @ResolveField(() => VmNic)
  async srcVmNic(@Parent() { srcEndPoint }: PortMirrorSession) {
    return this.vmNicDataloader.query(srcEndPoint, srcEndPoint, {})
  }

  @ResolveField(() => VmNic)
  async dstVmNic(@Parent() { dstEndPoint }: PortMirrorSession) {
    return this.vmNicDataloader.query(dstEndPoint, dstEndPoint, {})
  }

  @Query(() => VmNicListResp)
  getVmFromVMNics(@Args() queryArgs: QueryAction) {
    return this.portMirrorSessionService.getVmUuidsFromVMNics(queryArgs)
  }
}
