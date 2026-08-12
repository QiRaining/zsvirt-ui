import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { AccountOwner } from '@/zsphere-administration/owner/owner.model'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'

import {
  MonitorGroup as IMonitorGroup,
  MonitorGroupAddResourceList as IMonitorGroupAddResourceList,
  MonitorGroupInstanceList as IMonitorGroupInstanceList,
  MonitorGroupList as IMonitorGroupList,
  MonitorGroup,
  MonitorGroupResource
} from './monitor-group.model'
import { MonitorGroupService } from './monitor-group.service'

@Resolver(() => IMonitorGroup)
export class MonitorGroupResolver {
  @Inject() monitorGroupService: MonitorGroupService
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() tagsDataloader: TagsDataloader

  // query list
  @Query(() => IMonitorGroupList)
  monitorGroupList(@Args() queryArgs: QueryAction) {
    return this.monitorGroupService.monitorGroupList(queryArgs)
  }

  @ResolveField(() => AccountOwner)
  async owner(@Parent() monitorGroup: MonitorGroup) {
    return this.ownerDataLoader.query(monitorGroup.uuid)
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() monitorGroup: MonitorGroup) {
    return this.tagsDataloader.query(monitorGroup.uuid)
  }

  // @ResolveField()
  // async monitorTemplate(@Parent() monitorGroup: MonitorGroup) {
  //   return this.monitorGroupService.getMonitorGroupTemplate(monitorGroup?.uuid)
  // }

  @ResolveField()
  async instanceStatistics(@Parent() monitorGroup: MonitorGroup) {
    return this.monitorGroupService.getMonitorGroupInstanceStatistics(monitorGroup?.uuid)
  }

  @Query(() => IMonitorGroupInstanceList)
  monitorGroupInstanceList(@Args() queryArgs: QueryAction) {
    return this.monitorGroupService.monitorGroupInstanceList(queryArgs)
  }

  @Query(() => IMonitorGroupAddResourceList)
  queryResourceInstance(@Args() queryArgs: QueryAction) {
    return this.monitorGroupService.queryResourceInstance(queryArgs)
  }
}

@Resolver(() => MonitorGroupResource)
export class MonitorGroupResourceResolver {
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @ResolveField(() => L3Network)
  async l3Network(@Parent() resource: MonitorGroupResource) {
    if (resource.type !== 'L3NetworkVO') {
      return null
    }
    return await this.l3NetworkDataloader.query(resource.uuid, resource.uuid)
  }
}
