import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'
import { GuestToolsState } from '@/zsphere-resource/vm-instance/vm-instance.model'

import {
  VmInstancePerformanceQueryResp,
  VmInstancePerformance,
  QueryL3NetworkPerformanceArgs,
  L3NetworkPerformanceQueryResp,
  L3NetworkPerformance,
  HostPerformance,
  HostPerformanceQueryResp,
  QueryHostPerformanceArgs,
  BackupStoragePerformance,
  BackupStoragePerformanceQueryResp,
  QueryBackupStoragePerformanceArgs,
  QueryVmInstancePerformanceArgs
} from './performance.model'
import { PerformanceService } from './performance.service'

@Resolver({ isAbstract: true })
class PerformanceResolver {
  @Inject() performanceService: PerformanceService
  @Inject() ownerDataLoader: OwnerDataLoader
}
@Resolver(() => VmInstancePerformance)
export class VmInstancePerformanceResolver extends PerformanceResolver {
  @Query(() => VmInstancePerformanceQueryResp)
  async vmInstancePerformances(@Args() queryArgs: QueryVmInstancePerformanceArgs) {
    return this.performanceService.queryZStackMetric(queryArgs)
  }

  @ResolveField(() => CommonOwner, { nullable: true })
  async owner(@Parent() p: VmInstancePerformance) {
    return this.ownerDataLoader.query(p.uuid)
  }

  @ResolveField(() => GuestToolsState)
  async toolsState(@Parent() vm: VmInstancePerformance) {
    const resp = await this.performanceService.getGuestToolsState(
      vm.uuid,
      vm.platform,
      vm.state,
      vm.hostUuid || vm.lastHostUuid
    )
    return resp
  }
}

@Resolver(() => HostPerformance)
export class HostPerformanceResolver extends PerformanceResolver {
  @Query(() => HostPerformanceQueryResp)
  async hostPerformances(@Args() queryArgs: QueryHostPerformanceArgs) {
    return this.performanceService.queryZStackMetric(queryArgs)
  }
}

@Resolver(() => BackupStoragePerformance)
export class BackupStoragePerformanceResolver extends PerformanceResolver {
  @Query(() => BackupStoragePerformanceQueryResp)
  async backupStoragePerformances(@Args() queryArgs: QueryBackupStoragePerformanceArgs) {
    return this.performanceService.queryZStackMetric(queryArgs)
  }
}

@Resolver(() => L3NetworkPerformance)
export class L3NetworkPerformanceResolver extends PerformanceResolver {
  @Query(() => L3NetworkPerformanceQueryResp)
  async l3NetworkPerformances(@Args() queryArgs: QueryL3NetworkPerformanceArgs) {
    return this.performanceService.queryZStackMetric(queryArgs)
  }
}
