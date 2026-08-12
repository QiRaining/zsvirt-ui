import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { GetHostNetworkFactsAction } from '@/api/zstack/GetHostNetworkFactsAction'
import { genUuid } from '@/utils'

import { BondDataloader } from '../bond/bond.dataloader'
import { Bond } from '../bond/bond.model'
import { HostDataloader } from '../host/host.dataloader'
import { HostVO } from '../host/host.model'
import { HostNetworkInterfaceDataloader } from '../pci-device/hostnetworkinferface.data.loader'
import { PhysicalNic } from '../pci-device/pci-device.model'
import { UplinkGroupQueryService } from './query/uplink-group-query.service'
import { UplinkGroup, UplinkGroupList, QueryUplinkGroupArgs } from './uplink-group.model'

@Resolver(() => UplinkGroup)
export class UplinkGroupResolver {
  @Inject() uplinkGroupQueryService: UplinkGroupQueryService
  @Inject() hostDataloader: HostDataloader
  @Inject() bondDataloader: BondDataloader
  @Inject() getHostNetworkFacts: GetHostNetworkFactsAction
  @Inject() hostNetworkInterfaceDataloader: HostNetworkInterfaceDataloader

  @Query(() => UplinkGroupList)
  uplinkGroupList(@Args() queryArgs: QueryUplinkGroupArgs) {
    return this.uplinkGroupQueryService.get(queryArgs)
  }

  @ResolveField(() => String)
  async uuid() {
    return genUuid()
  }

  @ResolveField(() => String)
  async name(@Parent() uplinkGroup: UplinkGroup) {
    return uplinkGroup.interfaceName
  }

  @ResolveField(() => HostVO)
  async host(@Parent() uplinkGroup: UplinkGroup) {
    return await this.hostDataloader.query(uplinkGroup.hostUuid, uplinkGroup.hostUuid)
  }

  @ResolveField(() => Bond)
  async bond(@Parent() uplinkGroup: UplinkGroup) {
    if (!uplinkGroup.bondingUuid) {
      return null
    }

    if (uplinkGroup.hostUuid) {
      await this.getHostNetworkFacts.call({
        hostUuid: uplinkGroup.hostUuid
      })
    }

    return await this.bondDataloader.query(uplinkGroup.bondingUuid)
  }

  @ResolveField(() => PhysicalNic)
  async physicalNic(@Parent() uplinkGroup: UplinkGroup) {
    if (!uplinkGroup.interfaceUuid) {
      return null
    }
    return this.hostNetworkInterfaceDataloader.query(uplinkGroup.interfaceUuid)
  }
}
