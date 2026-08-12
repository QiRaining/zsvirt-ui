import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { QuerySNSTextTemplateResp, SNSTextTemplate } from './sns-text-template.model'
import { SNSTextTemplateService } from './sns-text-template.service'

@Resolver(() => SNSTextTemplate)
export class SNSTextTemplateResolver {
  @Inject() SNSService: SNSTextTemplateService

  @Query(() => QuerySNSTextTemplateResp)
  async snsTextTemplateList(@Args() params: QueryAction): Promise<QuerySNSTextTemplateResp> {
    return this.SNSService.query(params)
  }

  @Query(() => QuerySNSTextTemplateResp)
  async aliyunSmsSNSTextTemplateList(
    @Args() params: QueryAction
  ): Promise<QuerySNSTextTemplateResp> {
    return this.SNSService.queryAliyun(params)
  }
}
