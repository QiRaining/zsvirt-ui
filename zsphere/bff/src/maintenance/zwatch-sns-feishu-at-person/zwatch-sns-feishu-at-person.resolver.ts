import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { SNSFeiShuAtPersonQueryService } from './query/query.service'
import {
  QuerySNSFeiShuAtPersonListResp,
  SNSFeiShuAtPerson
} from './zwatch-sns-feishu-at-person.model'

@Resolver(() => SNSFeiShuAtPerson)
export class SNSFeiShuAtPersonResolver {
  @Inject() snsFeiShuAtPersonQueryService: SNSFeiShuAtPersonQueryService

  @Query(() => QuerySNSFeiShuAtPersonListResp)
  async querySNSFeiShuAtPersonList(
    @Args() queryArgs: QueryAction
  ): Promise<QuerySNSFeiShuAtPersonListResp> {
    return this.snsFeiShuAtPersonQueryService.queryList(queryArgs)
  }
}
