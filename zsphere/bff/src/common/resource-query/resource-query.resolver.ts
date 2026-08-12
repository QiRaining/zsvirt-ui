import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { ResourceQueryService } from './resource-query.service'
import { QueryResourceArgs, Resource, ResourceList } from './resource.model'

@Resolver(() => Resource)
export class ResourceQueryResolver {
  @Inject() resourceQueryService: ResourceQueryService

  @Query(() => ResourceList)
  async resourceList(@Args() queryArgs: QueryResourceArgs) {
    return this.resourceQueryService.queryList(queryArgs)
  }

  @Query(() => ResourceList)
  async resourceCount(@Args() queryArgs: QueryResourceArgs) {
    return this.resourceQueryService.countList(queryArgs)
  }
}
