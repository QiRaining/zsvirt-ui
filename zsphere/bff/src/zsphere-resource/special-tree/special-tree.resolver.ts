import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { QuerySpecialTreeService, type TreeSortParams } from './query/query-special-tree.service'
import { SpecialTree, SpecialTreeList } from './special-tree.model'

@Resolver(() => SpecialTree)
export class SpecialTreeResolver {
  @Inject() querySpecialTreeService: QuerySpecialTreeService

  private getTreeSortParams(orderBy?: string, orderDirection?: string): TreeSortParams {
    return { orderBy, orderDirection }
  }

  @Query(() => SpecialTreeList)
  async clusterHostTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async directoryTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryVMDirectoryTreeList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async networkTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryNetworkList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async dataStorageTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryDataStorageList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async templateVMTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryTemplateVMList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async vmSchedulingRuleTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryVmSchedulingRuleTreeList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async vmTemplateTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryVmTemplateTreeList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async clusterAndHostsTreeListForTemplateConvertToVM(@Args('uuid') uuid: string) {
    return await this.querySpecialTreeService.clusterAndHostsTreeListForTemplateConvertToVM(uuid)
  }

  @Query(() => SpecialTreeList)
  async l2NetworkTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryL2NetworkList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }

  @Query(() => SpecialTreeList)
  async bareMetalTreeList(
    @Args('orderBy', { type: () => String, nullable: true }) orderBy?: string,
    @Args('orderDirection', { type: () => String, nullable: true }) orderDirection?: string
  ) {
    return await this.querySpecialTreeService.queryBMTreeList(
      this.getTreeSortParams(orderBy, orderDirection)
    )
  }
}
