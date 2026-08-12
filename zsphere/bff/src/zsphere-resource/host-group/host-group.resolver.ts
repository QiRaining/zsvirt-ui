import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent } from '@nestjs/graphql'

import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import {
  HostGroup as IHostGroup,
  HostGroupList as IHostGroupList,
  QueryHostGroupArgs
} from './host-group.model'
import { HostGroupService } from './host-group.service'

@Resolver(() => IHostGroup)
export class HostGroupResolver {
  @Inject() hostGroupService: HostGroupService
  @Inject() clusterDataloader: ClusterDataloader
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() zoneDataloader: ZoneDataloader

  // query list
  @Query(() => IHostGroupList)
  hostGroupList(@Args() queryArgs: QueryHostGroupArgs) {
    return this.hostGroupService.queryList(queryArgs)
  }

  @ResolveField()
  async hostCount(@Parent() hostGroup: IHostGroup) {
    return this.hostGroupService.getHostCount(hostGroup)
  }

  @ResolveField()
  async vmSchedulingRuleCount(@Parent() hostGroup: IHostGroup) {
    return this.hostGroupService.getVmSchedulingRuleCount(hostGroup)
  }

  @ResolveField()
  async cluster(@Parent() hostGroup: IHostGroup) {
    const { uuid, clusterUuid } = hostGroup
    return this.clusterDataloader.query(uuid, clusterUuid)
  }

  @ResolveField()
  async owner(@Parent() hostGroup: IHostGroup) {
    return this.ownerDataLoader.query(hostGroup.uuid)
  }

  @ResolveField()
  async zone(@Parent() hostGroup: IHostGroup) {
    return this.zoneDataloader.query(hostGroup?.uuid, hostGroup?.zoneUuid)
  }
}
