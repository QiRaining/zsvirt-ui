import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'

import {
  HostKernelInterface,
  HostKernelInterfaceList,
  QueryHostKernelInterfaceArgs
} from './host-kernel-interface.model'
import { HostKernelInterfaceQueryService } from './query/host-kernel-interface-query.service'

@Resolver(() => HostKernelInterface)
export class HostKernelInterfaceResolver {
  @Inject() hostKernelInterfaceQueryService: HostKernelInterfaceQueryService
  @Inject() l3NetworkDataloader: L3NetworkDataloader
  @Inject() hostDataloader: HostDataloader

  @Query(() => HostKernelInterfaceList)
  hostKernelInterfaceList(@Args() queryArgs: QueryHostKernelInterfaceArgs) {
    return this.hostKernelInterfaceQueryService.get(queryArgs)
  }

  @Query(() => HostKernelInterface)
  async hostKernelInterface(@Args('uuid') uuid: string) {
    const queryArgs: QueryHostKernelInterfaceArgs = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const result = await this.hostKernelInterfaceQueryService.get(queryArgs)
    return result?.list[0]
  }

  @ResolveField()
  l3Network(@Parent() { uuid, l3NetworkUuid }: HostKernelInterface) {
    return this.l3NetworkDataloader.query(uuid, l3NetworkUuid)
  }

  @ResolveField()
  isDefault(@Parent() { uuid }: HostKernelInterface) {
    return this.hostKernelInterfaceQueryService.getIsDefault(uuid)
  }

  @ResolveField()
  host(@Parent() { uuid, hostUuid }: HostKernelInterface) {
    return this.hostDataloader.query(uuid, hostUuid)
  }
}
