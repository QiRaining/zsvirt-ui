import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { genUuid } from '@/utils'

import { BondDataloader } from '../bond/bond.dataloader'
import { Bond } from '../bond/bond.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'
import {
  PhysicalNetworkBond,
  PhysicalNetworkBondList,
  QueryPhysicalNetworkBondArgs
} from './physical-network-bond.model'
import { PhysicalNetworkBondService } from './physical-network-bond.service'

@Resolver(() => PhysicalNetworkBond)
export class PhysicalNetworkBondResolver {
  @Inject() physicalNetworkBondService: PhysicalNetworkBondService
  @Inject() bondDataloader: BondDataloader

  @Query(() => PhysicalNetworkBondList)
  physicalNetworkBondList(@Args() queryArgs: QueryPhysicalNetworkBondArgs) {
    return this.physicalNetworkBondService.get(queryArgs)
  }

  @ResolveField(() => String)
  async uuid() {
    return genUuid()
  }

  @ResolveField(() => [Bond])
  async bond(@Parent() physicalNetworkBond: PhysicalNetworkBond) {
    return this.bondDataloader.query(physicalNetworkBond.bondingUuid)
  }

  @ResolveField(() => [PhysicalNetworkType])
  async serviceTypes(@Parent() physicalNetworkBond: PhysicalNetworkBond) {
    return this.physicalNetworkBondService.serviceTypes(genUuid(), {
      bondingUuid: physicalNetworkBond.bondingUuid,
      vlanId: physicalNetworkBond.vlanId
    })
  }
}
