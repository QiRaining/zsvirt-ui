import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import {
  EventRuleTemplate,
  QueryEventRuleTemplateResp
} from '@/maintenance/event-rule-template/event-rule-template.model'
import { EventRuleTemplateService } from '@/maintenance/event-rule-template/event-rule-template.service'

@Resolver(() => EventRuleTemplate)
export class EventRuleTemplateResolver {
  @Inject() eventRuleTemplateService: EventRuleTemplateService

  @Query(() => QueryEventRuleTemplateResp)
  async eventRuleTemplateList(@Args() queryArgs: QueryAction) {
    return this.eventRuleTemplateService.queryList(queryArgs)
  }
}
