import { Inject } from '@nestjs/common'
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import {
  DataInNetworkTopology,
  NetworkTopology,
  NetworkTopologyRelationQuery,
  QueryNetworkTopologyRelationResp,
  QueryNetworkTopologyResp,
  QueryResourceAndRelationResp
} from './network.model'
import { VmCountInL3NetworkDataloader } from './query/query-vm-count'
import { NetworkTopologyQueryService } from './query/query.service'

@Resolver(() => NetworkTopology)
export class NetworkTopologyResolver {
  @Inject() networkTopologyQueryService: NetworkTopologyQueryService
  @Inject() vmCountInL3NetworkDataloader: VmCountInL3NetworkDataloader

  @Query(() => QueryNetworkTopologyResp)
  async networkTopologyList(@Args() queryArgs: QueryAction) {
    return this.networkTopologyQueryService.queryList(queryArgs)
  }

  @Query(() => QueryNetworkTopologyRelationResp)
  async networkTopologyRelation(@Args() queryArgs: NetworkTopologyRelationQuery) {
    return this.networkTopologyQueryService.queryRelation(queryArgs)
  }

  @Query(() => QueryNetworkTopologyRelationResp)
  async networkTopologyVRouterRelation(@Args('zoneUuid', { nullable: true }) zoneUuid?: string) {
    return this.networkTopologyQueryService.queryVRouterRelation(zoneUuid)
  }

  @Query(() => QueryNetworkTopologyResp)
  async getVmByL3NetworkUuid(@Args('uuid') uuid: string) {
    return this.networkTopologyQueryService.getVmByL3NetworkUuid(uuid)
  }

  @Query(() => QueryResourceAndRelationResp)
  async resourceAndRelationByType(
    @Args({ name: 'uuids', type: () => [String] }) uuids: string[],
    @Args('type') type: string,
    @Args('needInfo', { nullable: true }) needInfo?: boolean
  ) {
    return this.networkTopologyQueryService.queryResourceAndRelationByType({
      uuids,
      type,
      needInfo
    })
  }

  @ResolveField()
  async resourceType(@Parent() resource: NetworkTopology) {
    switch (resource.type) {
      case 'UserVm':
        return 'Vm'
      case 'baremetal2':
        return 'Baremetal2Vm'
      case 'ApplianceVm':
        return 'VpcRouter'
      case 'L3VpcNetwork':
        return 'Vpc'
      case 'L3BasicNetwork':
        if (resource.category === 'Private') {
          return 'Flat'
        }
        return resource.category // Private,Public
    }
  }

  @ResolveField(() => Int)
  async vmCount(@Parent() resource: NetworkTopology) {
    return this.vmCountInL3NetworkDataloader.query(resource.uuid)
  }

  @ResolveField()
  async data(@Parent() resource: NetworkTopology) {
    return {
      uuid: resource.uuid
    }
  }
}

@Resolver(() => DataInNetworkTopology)
export class DataInNetworkTopologyResolver {
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @ResolveField()
  async vm(@Parent() resource: DataInNetworkTopology) {
    return this.vmInstanceDataloader.query(resource.uuid, resource.uuid)
  }

  @ResolveField()
  async l3Netowrk(@Parent() resource: DataInNetworkTopology) {
    return this.l3NetworkDataloader.query(resource.uuid, resource.uuid)
  }
}
