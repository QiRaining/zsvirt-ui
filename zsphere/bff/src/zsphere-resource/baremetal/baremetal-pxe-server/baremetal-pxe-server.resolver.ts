import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import {
  BaremetalPxeServer,
  BaremetalPxeServerQueryResp,
  QueryClusterArgs
} from './baremetal-pxe-server.model'
import { QueryBaremetalPxeServerService } from './query/baremetal-pxeservice-query.service'

@Resolver(() => BaremetalPxeServer)
export class BaremetalPxeServerResolver {
  @Inject()
  queryBaremetalPxeServerService: QueryBaremetalPxeServerService

  @Query(() => BaremetalPxeServerQueryResp)
  async baremetalPxeServerList(
    @Args() queryArgs: QueryClusterArgs
  ): Promise<BaremetalPxeServerQueryResp> {
    return this.queryBaremetalPxeServerService.query(queryArgs)
  }
}
