import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { OwnerDataLoader } from './owner.dataloader'
import {
  OwnerQueryResp,
  QueryOwnerArg,
  AccountOwnerQueryResp,
  ProjectOwnerQueryResp,
  ProjectOwner,
  AccountOwner,
  ShareType,
  QueryOwnerSummaryArg,
  OwnerSummaryQueryResp,
  ResourceShare,
  AccountGroupOwner,
  AccountGroupOwnerQueryResp
} from './owner.model'
import { OwnerService } from './owner.service'

@Resolver(() => ProjectOwner || AccountOwner || AccountGroupOwner)
export class OwnerResolver {
  @Inject() ownerService: OwnerService
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => OwnerQueryResp)
  async ownerList(
    @Args() queryParam: QueryOwnerArg
  ): Promise<AccountOwnerQueryResp | ProjectOwnerQueryResp | AccountGroupOwnerQueryResp> {
    return this.ownerService.queryOwner(queryParam)
  }

  @ResolveField('admin', () => String, { nullable: true })
  async getAdmin(@Parent() owner: ProjectOwner): Promise<string> {
    return await this.ownerService.queryProjectAdmin(owner.uuid)
  }

  @Query(() => OwnerSummaryQueryResp)
  async ownerSummary(@Args() queryParam: QueryOwnerSummaryArg): Promise<OwnerSummaryQueryResp> {
    return this.ownerService.querySummary(queryParam)
  }

  @Query(() => [ShareType])
  async shareTypeList(@Args({ name: 'uuids', type: () => [String] }) uuids: string[]) {
    const tasks = uuids.map(uuid => this.ownerLoader.queryResourceShareType(uuid))
    return await Promise.all(tasks)
  }

  @Query(() => [ResourceShare])
  async resourceShareList(@Args({ name: 'uuids', type: () => [String] }) uuids: string[]) {
    const tasks = uuids.map(uuid => this.ownerLoader.queryResourceShare(uuid))
    return await Promise.all(tasks)
  }
}
