import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import {
  NoTagResourceResp,
  QueryTagArgs,
  Tag,
  TagOwner,
  TagQueryResp,
  TagRelatedSummary
} from './tag.model'
import { TagService } from './tag.service'

@Resolver(() => Tag)
export class TagResolver {
  @Inject() tagService: TagService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => TagQueryResp)
  async tagList(@Args() queryArgs: QueryTagArgs): Promise<TagQueryResp> {
    return this.tagService.query(queryArgs)
  }

  @Query(() => TagQueryResp)
  async tagListByResource(@Args() queryArgs: QueryTagArgs): Promise<TagQueryResp> {
    return this.tagService.queryByResource(queryArgs)
  }

  @Query(() => NoTagResourceResp)
  async noTagResource(@Args() queryArgs: QueryTagArgs): Promise<NoTagResourceResp> {
    return this.tagService.getNoTagResource(queryArgs)
  }

  @Query(() => TagQueryResp)
  async handleTagList(@Args() queryArgs: QueryAction): Promise<TagQueryResp> {
    return this.tagService.queryList(queryArgs)
  }

  @Query(() => TagRelatedSummary)
  async getTagRelatedSummary(@Args('uuid') uuid: string): Promise<TagRelatedSummary> {
    return this.tagService.tagRelatedResource(uuid)
  }

  @ResolveField(() => TagOwner)
  async owner(@Parent() tag: Tag) {
    return await this.ownerDataLoader.query(tag.uuid)
  }
}
