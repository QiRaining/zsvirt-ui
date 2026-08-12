import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { InstallPathRecycleQueryService } from './install-path-recycle-query/install-path-recycle-query.service'
import { Trash, TrashResp, QueryTrashArgs, InstallPathRecycleResp } from './trash.model'
import { TrashService } from './trash.service'

@Resolver(() => Trash)
export class TrashResolver {
  @Inject() trashService: TrashService
  @Inject() installPathRecycleQueryService: InstallPathRecycleQueryService

  /**
   * 数据清理列表
   * @param queryArgs
   * @param uuid 主存储或镜像服务器UUID
   */
  @Query(() => TrashResp)
  async trashList(@Args() args: QueryTrashArgs): Promise<TrashResp> {
    return this.trashService.queryTrashList(args) as Promise<TrashResp>
  }

  @Query(() => InstallPathRecycleResp)
  async installPathRecycleList(@Args() args: QueryAction) {
    return this.installPathRecycleQueryService.queryList(args)
  }
}
