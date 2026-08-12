import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql'

import { NvmeServerQueryService } from './nvme-server-query.service'
import {
  NvmeServer,
  NvmeServerList,
  NvmeServerLUNDeviceUsageInfo,
  QueryNvmeServerArgs
} from './nvme-server.model'

@Resolver(() => NvmeServer)
export class NvmeServerResolver {
  @Inject() nvmeServerQueryService: NvmeServerQueryService

  @Query(() => NvmeServerList)
  async nvmeServerList(@Args() queryArgs: QueryNvmeServerArgs) {
    return this.nvmeServerQueryService.queryList(queryArgs)
  }

  @ResolveField(() => NvmeServerLUNDeviceUsageInfo)
  async lunDeviceUsageInfo(@Parent() nvmeServer: NvmeServer) {
    return this.nvmeServerQueryService.getLunDeviceUsageInfo(nvmeServer.uuid, nvmeServer)
  }

  @ResolveField()
  async zones(@Parent() nvmeServer: NvmeServer) {
    return await this.nvmeServerQueryService.getZones(nvmeServer)
  }
}
