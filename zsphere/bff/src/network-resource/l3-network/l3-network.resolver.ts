import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import * as _ from 'lodash'

import { SetL3NetworkMtuAction } from '@/api/zstack/SetL3NetworkMtuAction'
import { HostKernelInterfaceQueryService } from '@/hardware-resource/host-kernel-interface/query/host-kernel-interface-query.service'
import { L2NetworkDataloader } from '@/hardware-resource/l2-network/l2-network.dataloader'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'

import { OwnerService } from '../../zsphere-administration/owner/owner.service'
import { IpService } from './ip/ip.service'
import {
  DnsListResp,
  L3Network,
  L3NetworkCountResp,
  L3NetworkListResp,
  NetworkServices,
  QueryL3NetworkArgs,
  VPortGroup,
  ValidateVlanIdArgs,
  ValidateVlanIdResp
} from './l3-network.model'
import { L3NetworkService } from './l3-network.service'
import { HypervisorDataloader } from './query/hypervisor.dataloader'
import { ResourceConfigIpAllocateStrategyDataloader } from './query/ip-allocation.dataloader'
import { NetworkServiceDataloader } from './query/network-service.dataloader'
import { QueryL3NetworkService } from './query/query.service'

@Resolver(() => L3Network)
export class L3NetworkResolver extends ResourceAttributeFieldResolver {
  @Inject() l3NetworkService: L3NetworkService
  @Inject() ipService: IpService
  @Inject() ownerService: OwnerService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() queryL3NetworkService: QueryL3NetworkService
  @Inject() setL3NetworkMtuAction: SetL3NetworkMtuAction
  @Inject() l2NetworkDataloader: L2NetworkDataloader
  @Inject() hypervisorDataloader: HypervisorDataloader
  @Inject()
  ipAllocateStrategyDataloader: ResourceConfigIpAllocateStrategyDataloader
  @Inject() networkServiceDataloader: NetworkServiceDataloader
  @Inject() hostKernelInterfaceQueryService: HostKernelInterfaceQueryService

  // query 列表
  @Query(() => L3NetworkListResp)
  async l3NetworkList(@Args() queryArgs: QueryL3NetworkArgs) {
    return await this.queryL3NetworkService.query(queryArgs)
  }

  @Query(() => DnsListResp)
  async dnsList(@Args() queryArgs: QueryL3NetworkArgs) {
    const ipVersions =
      _.remove(queryArgs.conditions ?? [], item => item.key === 'ipVersion')?.[0]?.values ?? []
    const { start, limit, ...args } = queryArgs
    const result = await this.queryL3NetworkService.query(args)
    const l3Network = result?.list?.[0]
    let list =
      l3Network?.dns?.map(item => ({
        dns: item,
        l3NetworkUuid: l3Network?.uuid
      })) ?? []
    if (ipVersions.length === 1) {
      if (ipVersions[0] === 6) {
        list = list.filter(item => item.dns.includes(':'))
      } else {
        list = list.filter(item => !item.dns.includes(':'))
      }
    }
    return {
      list: _.chunk(list, limit)[Math.floor(start / limit) ?? 0] ?? [],
      total: list?.length ?? 0
    }
  }

  // query 详情页
  @Query(() => L3Network)
  async l3Network(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          value: uuid
        }
      ]
    }
    const result = await this.queryL3NetworkService.query(queryArgs)
    return result.list[0]
  }
  // getCount
  @Query(() => L3NetworkCountResp)
  async getL3NetworkCount(@Args() queryArgs: QueryL3NetworkArgs) {
    return await this.queryL3NetworkService.query(queryArgs, true)
  }

  @ResolveField()
  async ipCapacity(@Parent() l3Network: L3Network) {
    // IPAM disabled 的网络不支持查询 IP 容量，返回 null 表示"不适用"
    if (l3Network.enableIPAM === false) {
      return null
    }
    return await this.ipService.getIpCapacity(l3Network.uuid)
  }

  @ResolveField()
  async usedIpCount(@Parent() l3Network: L3Network) {
    return await this.ipService.getUsedIpCount(l3Network.uuid)
  }

  @ResolveField()
  async enableSRIOV(@Parent() l3Network: L3Network) {
    return await this.l3NetworkService.getEnableSRIOV(l3Network.l2NetworkUuid)
  }

  @ResolveField()
  async networkServices(@Parent() l3Network: L3Network) {
    // const res = await this.l3NetworkService.getNetworkServices(l3Network.uuid)
    // console.log(res)
    return await this.networkServiceDataloader.query(l3Network.uuid)
  }

  @ResolveField()
  async owner(@Parent() l3Network: L3Network) {
    return this.ownerLoader.query(l3Network.uuid)
  }

  @ResolveField()
  async mtu(@Parent() l3Network: L3Network) {
    return await this.l3NetworkService.getL3NetworkMtu(l3Network.uuid)
  }

  @ResolveField()
  async dhcpIp(@Parent() l3Network: L3Network) {
    return await this.l3NetworkService.getDhcpip(l3Network.uuid)
  }

  @ResolveField()
  async routerInterfaceIp(@Parent() l3Network: L3Network) {
    return await this.l3NetworkService.getL3NetworkRouterInterfaceIp(l3Network.uuid)
  }

  @ResolveField()
  async networkTypeName(@Parent() l3Network: L3Network) {
    return await this.queryL3NetworkService.loadNetworkTypeName(l3Network)
  }

  @ResolveField()
  async networkType(@Parent() l3Network: L3Network) {
    if (l3Network.type === 'L3VpcNetwork') {
      return 'vpc'
    }
    if (l3Network.system) {
      return l3Network.mirrorNetwork ? 'flow' : 'manage'
    }
    if (l3Network.category === 'Private') {
      return 'flat'
    }
    if (l3Network.category === 'Public') {
      return 'public'
    }
  }

  // @ResolveField(()=>VirtualRouterOfferingNameAndUuid)
  // async virtualRouterOffering(@Parent() l3Network: L3Network) {
  //   return this.l3NetworkService.getVrouterOffering(
  //     l3Network.virtualRouterOfferingUuid
  //   )
  // }

  @ResolveField()
  async vpcVRouter(@Parent() l3Network: L3Network) {
    return this.l3NetworkService.getVpcVRouter(l3Network.uuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() l3Network: L3Network): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(l3Network.uuid)
  }

  @ResolveField()
  async l2Network(@Parent() l3Network: L3Network) {
    return this.l2NetworkDataloader.query(l3Network.uuid, l3Network.l2NetworkUuid)
  }

  @ResolveField()
  async vSwitch(@Parent() l3Network: L3Network) {
    return this.l3NetworkService.getVswitch(l3Network.uuid)
  }

  @ResolveField(() => VPortGroup)
  async portGroup(@Parent() l3Network: L3Network) {
    return this.l3NetworkService.getPortGroup(l3Network.uuid)
  }

  @ResolveField()
  async hypervisorType(@Parent() l3Network: L3Network) {
    return this.hypervisorDataloader.query(l3Network.l2NetworkUuid)
  }

  @ResolveField()
  async ipAllocateStrategy(@Parent() l3Network: L3Network) {
    return this.ipAllocateStrategyDataloader.query(l3Network.uuid)
  }

  @ResolveField()
  async isDefault(@Parent() l3Network: L3Network) {
    return await this.queryL3NetworkService.getIsDefault(l3Network.uuid)
  }

  @ResolveField()
  async hasDefaultKernel(@Parent() l3Network: L3Network) {
    return await this.queryL3NetworkService.hasDefaultKernel(l3Network.uuid)
  }

  @ResolveField()
  async isForStorageKernel(@Parent() l3Network: L3Network) {
    return await this.hostKernelInterfaceQueryService.isForStorageKernel({
      resourceType: 'l3Network',
      uuid: l3Network.uuid
    })
  }
}

@Resolver(() => NetworkServices)
export class NetworkServicesResolver {
  @Inject() queryL3NetworkService: QueryL3NetworkService

  @ResolveField()
  async networkServiceProvider(@Parent() networkServices: NetworkServices) {
    return await this.queryL3NetworkService.getNetworkServiceProvider(
      networkServices?.networkServiceProviderUuid
    )
  }
}

@Resolver(() => ValidateVlanIdResp)
export class VlanIdValidateResolver {
  @Inject() queryL3NetworkService: QueryL3NetworkService
  // query 列表
  @Query(() => ValidateVlanIdResp)
  async validateVlanIdUsed(@Args() queryArgs: ValidateVlanIdArgs) {
    return await this.queryL3NetworkService.validateVlanIdForPortGroup(
      queryArgs?.vlanId,
      queryArgs?.vSwitchUuid
    )
  }
}
