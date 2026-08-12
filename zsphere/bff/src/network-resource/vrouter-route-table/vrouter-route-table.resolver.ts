import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, Parent, ResolveField } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  VRouterRouteEntryListResp,
  VRouterRouteTable,
  VRouterRouteTableListResp
} from './vrouter-route-table.model'
import { VRouterRouteTableService } from './vrouter-route-table.service'

@Resolver(() => VRouterRouteTable)
export class VRouterRouteTableResolver {
  @Inject() vRouterRouteTableService: VRouterRouteTableService

  @Query(() => VRouterRouteTableListResp)
  async vRouterRouteTableList(@Args() queryArgs: QueryAction) {
    return await this.vRouterRouteTableService.queryList(queryArgs)
  }

  @ResolveField(() => [String], { nullable: true })
  async attachedRouterUuids(@Parent() vRouterRouteTable: VRouterRouteTable) {
    return this.vRouterRouteTableService.getAttachedRouter(vRouterRouteTable.uuid)
  }

  @Query(() => VRouterRouteEntryListResp)
  async vRouterRouteEntryList(@Args() queryArgs: QueryAction) {
    return await this.vRouterRouteTableService.queryVRouterRouteEntryList(queryArgs)
  }
}
