import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { LogCollect, QueryLogCollectResp } from './log-collect.model'
import { LogCollectService } from './log-collect.service'

@Resolver(() => LogCollect)
export class LogCollectResolver {
  @Inject() logCollectService: LogCollectService

  @Query(() => QueryLogCollectResp)
  async logCollectList(@Args() params: QueryAction): Promise<QueryLogCollectResp> {
    return this.logCollectService.query(params)
  }
}
