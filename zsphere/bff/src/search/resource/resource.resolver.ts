import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { SearchResource, SearchResourceInput, SearchResourceResp } from './resource.model'
import { SearchResourceService } from './resource.service'

@Resolver(() => SearchResource)
export class SearchResourceResolver {
  @Inject() searchResourceService: SearchResourceService

  @Query(() => SearchResourceResp)
  async searchResource(@Args() args: SearchResourceInput): Promise<SearchResourceResp> {
    return await this.searchResourceService.search(args.keyword, args.zoneUuid)
  }
}
