import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { QueryEventRuleTemplateAction } from '@/api/zstack/QueryEventRuleTemplateAction'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { EventRuleTemplateResolver } from '@/maintenance/event-rule-template/event-rule-template.resolver'
import { EventRuleTemplateService } from '@/maintenance/event-rule-template/event-rule-template.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { EventRuleTemplateActionModule } from './action/_module'

@Module({
  imports: [
    EventRuleTemplateActionModule,
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    EventRuleTemplateService,
    EventRuleTemplateResolver,
    QueryBase,
    QueryEventRuleTemplateAction
  ]
})
export class EventRuleTemplateModule {}
