import { Module } from '@nestjs/common'

import { AddMetricRuleTemplateAction } from '@/api/zstack/AddMetricRuleTemplateAction'
@Module({
  providers: [
    AddMetricRuleTemplateAction,
  ],
  exports: []
})
export class MetricRuleTemplateActionModule {}
