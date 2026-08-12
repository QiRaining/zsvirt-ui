import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { SNSDingTalkAtPersonQueryService } from './query/query.service'
import {
  QuerySNSDingTalkAtPersonListResp,
  SNSDingTalkAtPerson
} from './zwatch-sns-dingtalk-at-person.model'

@Resolver(() => SNSDingTalkAtPerson)
export class SNSDingTalkAtPersonResolver {
  @Inject() snsDingTalkAtPersonQueryService: SNSDingTalkAtPersonQueryService

  @Query(() => QuerySNSDingTalkAtPersonListResp)
  async querySNSDingTalkAtPersonList(
    @Args() queryArgs: QueryAction
  ): Promise<QuerySNSDingTalkAtPersonListResp> {
    return this.snsDingTalkAtPersonQueryService.queryList(queryArgs)
  }
}
