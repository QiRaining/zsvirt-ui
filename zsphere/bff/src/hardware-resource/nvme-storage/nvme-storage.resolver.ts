import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { NvmeTargetQueryService } from './nvme-storage-query.service'
import { NvmeTarget, NvmeTargetList } from './nvme-storage.model'

@Resolver(() => NvmeTarget)
export class NvmeTargetResolver {
  @Inject() nvmeTargetQueryService: NvmeTargetQueryService

  @Query(() => NvmeTargetList)
  async nvmeTargetList(@Args() queryArgs: QueryAction) {
    return this.nvmeTargetQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async transport(@Parent() nvmeTarget: NvmeTarget) {
    if (!nvmeTarget.nvmeServerUuid) {
      return null
    }
    return this.nvmeTargetQueryService.getTransport(nvmeTarget.nvmeServerUuid)
  }

  @ResolveField()
  async lunDeviceUsageInfo(@Parent() nvmeTarget: NvmeTarget) {
    return await this.nvmeTargetQueryService.getLunDeviceUsageInfo(nvmeTarget.uuid, nvmeTarget)
  }

  @ResolveField()
  async zones(@Parent() nvmeTarget: NvmeTarget) {
    return await this.nvmeTargetQueryService.getZones(nvmeTarget.uuid, nvmeTarget)
  }
}
