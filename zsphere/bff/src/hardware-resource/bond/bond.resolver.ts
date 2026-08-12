import { Inject } from '@nestjs/common'
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ZQLAction } from '@/common/zql'
import { L2Network } from '@/hardware-resource/l2-network/l2.network.model'
import { CheckIpAvailabilityResult } from '@/network-resource/l3-network/ip/ip.model'

import { HostDataloader } from '../host/host.dataloader'
import { HostVO } from '../host/host.model'
import { PhysicalNetworkService } from '../physical-network/physical-network.service'
import {
  Bond,
  BondReleatedResource,
  BondResouceCountResp,
  BondResp,
  HostNetworkBondingServiceRef
} from './bond.model'
import { BondService } from './bond.service'

@Resolver(() => Bond)
export class BondResolver {
  @Inject() bondService: BondService
  @Inject() hostDataloader: HostDataloader
  @Inject() physicalNetworkService: PhysicalNetworkService

  @Query(() => BondResp)
  async bondList(@Args() queryArgs: IQueryAction) {
    return this.bondService.query(queryArgs)
  }

  @Query(() => BondResp)
  async countbondList(@Args() queryArgs: IQueryAction) {
    return this.bondService.query(queryArgs, ZQLAction.COUNT)
  }

  @Query(() => BondResouceCountResp)
  async bondResouceCount(@Args('hostUuid') hostUuid: string) {
    return this.bondService.getBondResouceCount(hostUuid)
  }

  @Query(() => BondReleatedResource)
  async bondReleatedResource(@Args('bondingName') bondingName: string) {
    return this.bondService.getBondReleatedResource(bondingName)
  }

  @Mutation(() => CheckIpAvailabilityResult)
  async checkIpForBondOrNic(@Args('ip') ip: string) {
    return this.bondService.checkIp(ip)
  }

  @ResolveField(() => HostVO)
  async host(@Parent() bond: Bond) {
    return await this.hostDataloader.query(bond.uuid, bond.hostUuid)
  }

  @ResolveField(() => [HostNetworkBondingServiceRef])
  hostNetworkBondingServiceRef(@Parent() bond: Bond) {
    return this.bondService.hostNetworkBondingServiceRef(bond.uuid)
  }

  @ResolveField(() => Boolean)
  availableVlanIds(@Parent() bond: Bond) {
    return this.physicalNetworkService.availableVlanIds(bond.uuid)
  }

  @ResolveField(() => L2Network)
  vSwitch(@Parent() bond: Bond) {
    return this.bondService.queryVSwitch(bond)
  }

  @ResolveField()
  name(@Parent() bond: Bond) {
    return bond.bondingName
  }
}
