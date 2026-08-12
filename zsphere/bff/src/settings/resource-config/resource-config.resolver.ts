import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import {
  ResourceConfig,
  ResourceConfigList
} from '@/settings/resource-config/resource-config.model'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'
@Resolver(() => ResourceConfig)
export class ResourceConfigResolver {
  constructor(private resourceConfigService: ResourceConfigService) {}

  @Query(() => ResourceConfigList)
  async resourceConfigList(@Args() queryArgs: QueryAction) {
    return this.resourceConfigService.queryResourceConfigInPage(queryArgs)
  }
}
