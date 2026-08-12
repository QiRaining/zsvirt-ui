import { Inject } from '@nestjs/common'
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import { VxlanPool } from '@/network-resource/vxlan-pool/vxlan-pool.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { CommonOwner, ShareType } from '@/zsphere-administration/owner/owner.model'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'

import { Cluster } from '../cluster/cluster.model'
import { HostKernelInterfaceQueryService } from '../host-kernel-interface/query/host-kernel-interface-query.service'
import { Zone } from '../zone/zone.model'
import {
  L2Network,
  L2NetworkQueryResp,
  L2NetworkSystemTags,
  PhysicalInterfaceQueryResp,
  QueryL2NetworkArgs,
  QueryPhysicalInterfaceArgs
} from './l2.network.model'
import { L2NetworkService } from './l2.network.service'

@Resolver(() => L2Network)
export class L2NetworkResolver extends ResourceAttributeFieldResolver {
  @Inject() l2NetworkService: L2NetworkService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() systemTagDataloader: SystemTagDataloader
  @Inject() hostKernelInterfaceQueryService: HostKernelInterfaceQueryService

  @Query(() => L2NetworkQueryResp)
  async l2NetworkList(@Args() queryArgs: QueryL2NetworkArgs) {
    return this.l2NetworkService.query(queryArgs)
  }

  @Query(() => PhysicalInterfaceQueryResp)
  async physicalInterfaceList(
    @Args('clusterUuid') clusterUuid: string,
    @Args('networkAccelerationMode') networkAccelerationMode: string
  ) {
    return this.l2NetworkService.queryPhysicalInterfaceList(clusterUuid, networkAccelerationMode)
  }

  @Query(() => [String])
  async physicalInterfaceListByClusterList(@Args() input: QueryPhysicalInterfaceArgs) {
    return this.l2NetworkService.queryPhysicalInterfaceListByClusterList(input.clusterUuids)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() l2Network: L2Network): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(l2Network.uuid)
  }

  @ResolveField(() => CommonOwner, { nullable: true })
  async owner(@Parent() l2Network: L2Network) {
    return this.ownerLoader.query(l2Network.uuid)
  }

  @ResolveField(() => Zone)
  async zone(@Parent() l2Network: L2Network) {
    return this.l2NetworkService.getZone(l2Network.zoneUuid)
  }

  @ResolveField(() => [Cluster])
  async clusters(@Parent() l2Network: L2Network) {
    return this.l2NetworkService.getClusters(l2Network.uuid, l2Network.attachedClusterUuids)
  }

  @ResolveField(() => Int)
  async l3networkNum(@Parent() l2Network: L2Network) {
    return this.l2NetworkService.getL3networkNum(l2Network.uuid)
  }

  @ResolveField(() => VxlanPool)
  async vxlanPool(@Parent() l2Network: L2Network) {
    return await this.l2NetworkService.getVxlanPool(l2Network.poolUuid)
  }

  @ResolveField()
  async enableSRIOV(@Parent() l2Network: L2Network) {
    return await this.l2NetworkService.getEnableSRIOV(l2Network.uuid)
  }
  @ResolveField(() => L2NetworkSystemTags)
  async systemTags(@Parent() l2Network: L2Network) {
    return await this.l2NetworkService.getSystemTag(l2Network.uuid)
  }

  @ResolveField()
  async isDefault(@Parent() { uuid }: L2Network) {
    return await this.l2NetworkService.getIsDefault(uuid)
  }

  @ResolveField()
  async isUplinkBondingExist(@Parent() { uuid }: L2Network) {
    return await this.l2NetworkService.isUplinkBondingExist(uuid)
  }

  @ResolveField()
  async isForStorageKernel(@Parent() l2Network: L2Network) {
    return await this.hostKernelInterfaceQueryService.isForStorageKernel({
      resourceType: 'l2Network',
      uuid: l2Network.uuid
    })
  }
}
