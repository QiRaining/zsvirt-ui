import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql'

import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { HostKernelInterfaceDataloader } from '@/hardware-resource/host-kernel-interface/query/host-kernel-interface.dataloader'
import { genUuid } from '@/utils'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { IpStatistics, GetL3NetworkIpStatisticResult } from './ip-statistics.model'
import {
  IpRangeListResp,
  CheckIpAvailabilityParam,
  GetFreeIpOfL3NetworkResult,
  CheckIpAvailabilityResult,
  IpRange,
  GetFreeIpInput,
  IpRangeCountResp,
  LinkResourceOfIpRange
} from './ip.model'
import { IpService } from './ip.service'
import { VmCountDataloader, VRouterCountDataloader } from './link-resource.dataloader'

@Resolver(() => IpRange)
export class IpRangeResolver {
  @Inject() ipService: IpService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() vRouterCountDataloader: VRouterCountDataloader
  @Inject() vmCountDataloader: VmCountDataloader

  @Query(() => IpRangeListResp)
  async ipRangeList(@Args() queryArgs: IQueryAction) {
    return this.ipService.query(queryArgs)
  }

  @Query(() => IpRangeCountResp)
  async ipRangeCount(@Args('l3NetworkUuid') l3NetworkUuid: string) {
    return this.ipService.getIpRangeCount(l3NetworkUuid)
  }

  @ResolveField()
  async ipCapacity(@Parent() ipRange: IpRange) {
    return await this.ipService.getIpCapacityForIpRange(ipRange.uuid)
  }

  @ResolveField()
  async ipRangeType(@Parent() ipRange: IpRange) {
    return await this.ipService.getIpRangeType(ipRange.uuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() ipRange: IpRange): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(ipRange.uuid)
  }

  @ResolveField(() => LinkResourceOfIpRange)
  async linkResource(@Parent() ipRange: IpRange): Promise<LinkResourceOfIpRange> {
    const vmCount = await this.vmCountDataloader.query(ipRange.uuid)
    const vRouterCount = await this.vRouterCountDataloader.query(ipRange.uuid)
    return {
      vm: vmCount,
      vrouter: vRouterCount
    }
  }

  @Query(() => GetFreeIpOfL3NetworkResult)
  async getFreeIpOfL3Network(
    @Args('l3NetworkUuid') l3NetworkUuid: string,
    @Args({ name: 'ipVersion', nullable: true, type: () => Int })
    ipVersion?: 4 | 6 | 46
  ) {
    return this.ipService.getFreeIpOfL3Network(l3NetworkUuid, ipVersion)
  }

  @Query(() => GetFreeIpOfL3NetworkResult)
  async getFreeIpOfIpRange(
    @Args('ipRangeUuid') ipRangeUuid: string,
    @Args({ name: 'ipVersion', nullable: true, type: () => Int })
    ipVersion: 4 | 6 | 46
  ) {
    return this.ipService.getFreeIpOfIpRange(ipRangeUuid, ipVersion)
  }

  @Query(() => GetFreeIpOfL3NetworkResult)
  async getFreeIp(@Args('input') input: GetFreeIpInput) {
    return this.ipService.getFreeIp(input)
  }

  @Mutation(() => CheckIpAvailabilityResult)
  async checkIpAvailability(@Args('input') input: CheckIpAvailabilityParam) {
    return this.ipService.checkIpAvailability(input)
  }
}

@Resolver(() => IpStatistics)
export class IpStatisticsResolver {
  @Inject() ipService: IpService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() vRouterCountDataloader: VRouterCountDataloader
  @Inject() vmCountDataloader: VmCountDataloader
  @Inject() hostKernelInterfaceDataloader: HostKernelInterfaceDataloader

  @Query(() => GetL3NetworkIpStatisticResult)
  async ipStatistics(@Args() param: IQueryAction) {
    return this.ipService.getL3NetworkIpStatistic(param)
  }

  @ResolveField()
  async vmInstance(@Parent() ipStatic: IpStatistics) {
    return await this.vmInstanceDataloader.query(genUuid(), ipStatic.vmInstanceUuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() current: IpStatistics) {
    if (!current.vmInstanceUuid) {
      return null
    }
    return await this.vmInstanceDataloader.queryTemplatedVmInstance(current.vmInstanceUuid)
  }

  @ResolveField()
  async hostKernelInterface(@Parent() { resourceOwnerUuid, resourceTypes }: IpStatistics) {
    return resourceOwnerUuid && resourceTypes?.indexOf('KernelInterface') !== -1
      ? await this.hostKernelInterfaceDataloader.query(resourceOwnerUuid)
      : undefined
  }
}
