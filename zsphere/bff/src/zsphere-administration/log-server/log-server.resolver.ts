//import { QueryAction } from '@/common/model/action-query.model'
import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { LogServer, LogServerQueryResp } from './log-server.model'
import { LogServerService } from './log-server.service'

@Resolver(() => LogServer)
export class LogServerResolver {
  @Inject() logServerService: LogServerService

  @Query(() => LogServerQueryResp)
  async logServerList(@Args() queryArgs: QueryAction): Promise<LogServerQueryResp> {
    return this.logServerService.query(queryArgs)
  }

  @Query(() => LogServerQueryResp)
  async test(): Promise<LogServerQueryResp> {
    return this.logServerService.query({})
  }
}
