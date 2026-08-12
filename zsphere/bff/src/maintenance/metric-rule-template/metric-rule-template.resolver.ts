import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import {
  MetricRuleTemplate,
  QueryMetricRuleTemplateResp
} from '@/maintenance/metric-rule-template/metric-rule-template.model'
import { MetricRuleTemplateService } from '@/maintenance/metric-rule-template/metric-rule-template.service'

@Resolver(() => MetricRuleTemplate)
export class MetricRuleTemplateResolver {
  @Inject() metricRuleTemplateService: MetricRuleTemplateService

  @Query(() => QueryMetricRuleTemplateResp)
  async metricRuleTemplateList(@Args() queryArgs: QueryAction) {
    return this.metricRuleTemplateService.queryList(queryArgs)
  }
}
