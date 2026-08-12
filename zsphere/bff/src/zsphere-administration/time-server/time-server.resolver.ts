import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import {
  InternalTimeServerCandidateResult,
  QueryTimeServerReachableArgs,
  TimeServerReachableResult,
  TimeServerResult
} from './time-server.model'
import { TimeServerService } from './time-server.service'

@Resolver(() => TimeServerResult)
export class TimeServerResolver {
  @Inject() timeServerService: TimeServerService

  @Query(() => TimeServerResult)
  async timeServers() {
    return this.timeServerService.getTimeServers()
  }

  @Query(() => InternalTimeServerCandidateResult)
  async internalTimeServerCandidates() {
    return this.timeServerService.getInternalTimeServerCandidates()
  }

  @Query(() => TimeServerReachableResult)
  async timeServerReachable(@Args() queryArgs: QueryTimeServerReachableArgs) {
    return this.timeServerService.queryTimeServerReachable(queryArgs)
  }
}
