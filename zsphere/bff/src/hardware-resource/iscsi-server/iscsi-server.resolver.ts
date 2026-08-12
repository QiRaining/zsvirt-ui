import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { IscsiServerQueryService } from './iscsi-server-query/iscsi-server-query.service'
import {
  IscsiServer,
  IscsiServerList,
  IscsiServerRelateSummary,
  IscsiTargetInventory,
  IscsiTargetListResponse,
  QueryIscsiServerArgs,
  IscsiServerRelateSummaryArgs
} from './iscsi-server.model'

@Resolver(() => IscsiServer)
export class IscsiServerResolver {
  @Inject() iscsiServerQueryService: IscsiServerQueryService

  @Query(() => IscsiServerList)
  async iscsiServerList(@Args() queryArgs: QueryIscsiServerArgs) {
    return this.iscsiServerQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async zones(@Parent() iscsiServer: IscsiServer) {
    return await this.iscsiServerQueryService.getZones(iscsiServer.uuid, iscsiServer)
  }

  @ResolveField()
  async lunDeviceUsageInfo(@Parent() iscsiServer: IscsiServer) {
    return await this.iscsiServerQueryService.getLunDeviceUsageInfo(iscsiServer.uuid, iscsiServer)
  }

  @Query(() => IscsiServerRelateSummary)
  async getIscsiServerSummary(
    @Args() queryArgs: IscsiServerRelateSummaryArgs
  ): Promise<IscsiServerRelateSummary> {
    return this.iscsiServerQueryService.getIscsiServerRelateResourceCount(queryArgs)
  }
}

@Resolver(() => IscsiTargetInventory)
export class IscsiTargetResolver {
  @Inject() iscsiServerQueryService: IscsiServerQueryService

  @Query(() => IscsiTargetListResponse)
  async iscsiTargetList(@Args() param: QueryAction) {
    return this.iscsiServerQueryService.queryIscsiTargetList(param)
  }

  @ResolveField()
  async iscsiServerAddress(@Parent() iscsiTarget: IscsiTargetInventory) {
    return this.iscsiServerQueryService.getIscsiServerAddress(iscsiTarget.uuid)
  }
}
