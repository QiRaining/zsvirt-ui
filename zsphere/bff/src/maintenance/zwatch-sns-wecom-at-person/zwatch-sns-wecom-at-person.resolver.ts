import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { SNSWeComAtPersonQueryService } from './query/query.service'
import { QuerySNSWeComAtPersonListResp, SNSWeComAtPerson } from './zwatch-sns-wecom-at-person.model'

@Resolver(() => SNSWeComAtPerson)
export class SNSWeComAtPersonResolver {
  @Inject() snsWeComAtPersonQueryService: SNSWeComAtPersonQueryService

  @Query(() => QuerySNSWeComAtPersonListResp)
  async querySNSWeComAtPersonList(
    @Args() queryArgs: QueryAction
  ): Promise<QuerySNSWeComAtPersonListResp> {
    return this.snsWeComAtPersonQueryService.queryList(queryArgs)
  }
}
