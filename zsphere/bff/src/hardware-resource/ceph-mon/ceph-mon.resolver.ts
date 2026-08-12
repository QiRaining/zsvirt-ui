import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { CephMon, QueryMonsArgs, MonsQueryResp } from './ceph-mon.model'
import { CephMonService } from './ceph-mon.service'

@Resolver(() => CephMon)
export class CephMonResolver {
  @Inject() cephMonService: CephMonService

  /**
   * 监控节点列表
   * @param queryArgs
   * @param uuid 主存储或镜像服务器UUID
   */
  @Query(() => MonsQueryResp)
  async monsList(@Args() args: QueryMonsArgs): Promise<MonsQueryResp> {
    return this.cephMonService.queryMonsList(args) as Promise<MonsQueryResp>
  }

  @ResolveField()
  name(@Parent() parent: CephMon) {
    return parent.hostname
  }
}
