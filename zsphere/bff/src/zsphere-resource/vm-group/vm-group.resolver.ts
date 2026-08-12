import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent, Int } from '@nestjs/graphql'

import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'

import {
  VmGroup as IVmGroup,
  VmGroupList as IVmGroupList,
  QueryVmGroupArgs
} from './vm-group.model'
import { VmGroupService } from './vm-group.service'

@Resolver(() => IVmGroup)
export class VmGroupResolver {
  @Inject() vmGroupService: VmGroupService
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() zoneDataloader: ZoneDataloader

  // query list
  @Query(() => IVmGroupList)
  vmGroupList(@Args() queryArgs: QueryVmGroupArgs) {
    return this.vmGroupService.queryList(queryArgs)
  }

  @ResolveField(() => Int)
  async vmCount(@Parent() vmGroup: IVmGroup) {
    return this.vmGroupService.getVmCount(vmGroup)
  }

  @ResolveField(() => Int)
  async vmSchedulingRuleCount(@Parent() vmGroup: IVmGroup) {
    return this.vmGroupService.getVmSchedulingRuleCount(vmGroup)
  }

  @ResolveField(() => CommonOwner)
  async owner(@Parent() vmGroup: IVmGroup) {
    return this.ownerDataLoader.query(vmGroup.uuid)
  }

  @ResolveField(() => Zone)
  async zone(@Parent() vmGroup: IVmGroup) {
    return this.zoneDataloader.query(vmGroup?.uuid, vmGroup?.zoneUuid)
  }
}
