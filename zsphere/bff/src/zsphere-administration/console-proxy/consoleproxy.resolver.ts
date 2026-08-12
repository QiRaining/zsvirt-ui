import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { ConsoleProxyAgent, ConsoleProxyAgentQueryResp } from './consoleproxy.model'
import { ConsoleProxyAgentService } from './consoleproxy.service'

@Resolver(() => ConsoleProxyAgent)
export class ConsoleProxyAgentResolver {
  @Inject() consoleProxyAgentService: ConsoleProxyAgentService

  @Query(() => ConsoleProxyAgentQueryResp)
  async consoleProxyAgentList(@Args() queryArgs: QueryAction): Promise<ConsoleProxyAgentQueryResp> {
    return this.consoleProxyAgentService.query(queryArgs)
  }
}
