import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { genUuid } from '@/utils'

import { HostNetworkInterfaceDataloader } from '../pci-device/hostnetworkinferface.data.loader'
import { PhysicalNic } from '../pci-device/pci-device.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'
import {
  InterfaceService,
  InterfaceServiceList,
  PhysicalNetworkInterface,
  PhysicalNetworkInterfaceList,
  QueryInterfaceServiceArgs,
  QueryPhysicalNetworkInterfaceArgs
} from './physical-network-interface.model'
import { PhysicalNetworkInterfaceService } from './physical-network-interface.service'

@Resolver(() => PhysicalNetworkInterface)
export class PhysicalNetworkInterfaceResolver {
  @Inject() physicalNetworkInterfaceService: PhysicalNetworkInterfaceService
  @Inject() hostNetworkInterfaceDataloader: HostNetworkInterfaceDataloader

  @Query(() => PhysicalNetworkInterfaceList)
  physicalNetworkInterfaceList(@Args() queryArgs: QueryPhysicalNetworkInterfaceArgs) {
    return this.physicalNetworkInterfaceService.get(queryArgs)
  }

  @ResolveField(() => String)
  async uuid() {
    return genUuid()
  }

  @ResolveField(() => [PhysicalNic])
  async physicalNic(@Parent() physicalNetworkInterface: PhysicalNetworkInterface) {
    return this.hostNetworkInterfaceDataloader.query(physicalNetworkInterface.interfaceUuid)
  }

  @ResolveField(() => [PhysicalNetworkType])
  async serviceTypes(@Parent() physicalNetworkInterface: PhysicalNetworkInterface) {
    return this.physicalNetworkInterfaceService.serviceTypes(genUuid(), {
      interfaceUuid: physicalNetworkInterface.interfaceUuid,
      vlanId: physicalNetworkInterface.vlanId
    })
  }
}

@Resolver(() => InterfaceService)
export class InterfaceServiceResolver {
  @Inject() physicalNetworkInterfaceService: PhysicalNetworkInterfaceService

  @Query(() => InterfaceServiceList)
  getInterfaceServiceList(@Args() queryArgs: QueryInterfaceServiceArgs) {
    return this.physicalNetworkInterfaceService.getInterfaceService(queryArgs)
  }

  @ResolveField(() => String)
  async uuid() {
    return genUuid()
  }
}
