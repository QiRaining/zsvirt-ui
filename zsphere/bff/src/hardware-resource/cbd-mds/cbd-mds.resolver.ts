import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { CbdMds, MdsQueryResp, QueryMdsArgs } from './cbd-mds.model'
import { CbdMdsService } from './cbd-mds.service'

@Resolver(() => CbdMds)
export class CbdMdsResolver {
  @Inject() cbdMdsService: CbdMdsService

  /**
   * 监控节点列表
   * @param queryArgs
   * @param uuid 主存储或镜像服务器UUID
   */
  @Query(() => MdsQueryResp)
  async mdsList(@Args() args: QueryMdsArgs): Promise<MdsQueryResp> {
    return this.cbdMdsService.queryMdsList(args) as Promise<MdsQueryResp>
  }

  @ResolveField()
  name(@Parent() parent: CbdMds) {
    return parent.addr
  }

  @ResolveField()
  externalAddr(@Parent() parent: CbdMds) {
    return parent?.externalAddr?.split(':')[0] || parent.addr
  }
}
