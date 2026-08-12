import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { QueryMetricRuleTemplateAction } from '@/api/zstack/QueryMetricRuleTemplateAction'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { MetricRuleTemplateResolver } from '@/maintenance/metric-rule-template/metric-rule-template.resolver'
import { MetricRuleTemplateService } from '@/maintenance/metric-rule-template/metric-rule-template.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { MetricRuleTemplateActionModule } from './action/_module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    MetricRuleTemplateActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    MetricRuleTemplateService,
    MetricRuleTemplateResolver,
    QueryBase,
    QueryMetricRuleTemplateAction
  ]
})
export class MetricRuleTemplateModule {}
