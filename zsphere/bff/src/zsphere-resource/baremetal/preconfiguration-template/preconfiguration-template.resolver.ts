import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import {
  PreconfigurationTemplate,
  PreconfigurationTemplateQueryResp,
  QueryPreconfigurationTemplateArgs
} from './preconfiguration-template.model'
import { PreconfigurationTemplateQueryService } from './query/query-preconfiguration-template'

@Resolver(() => PreconfigurationTemplate)
export class PreconfigurationTemplateResolver {
  @Inject()
  preconfigurationTemplateQueryService: PreconfigurationTemplateQueryService
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => PreconfigurationTemplateQueryResp)
  async preconfigurationTemplateList(
    @Args() queryArgs: QueryPreconfigurationTemplateArgs
  ): Promise<PreconfigurationTemplateQueryResp> {
    return this.preconfigurationTemplateQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async owner(@Parent() preconfigurationTemplate: PreconfigurationTemplate) {
    return await this.ownerLoader.query(preconfigurationTemplate.uuid)
  }
}
