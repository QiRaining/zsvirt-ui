import { Module } from '@nestjs/common'

import { AddEventRuleTemplateAction } from '@/api/zstack/AddEventRuleTemplateAction'
@Module({
  providers: [
    AddEventRuleTemplateAction,
  ],
  exports: []
})
export class EventRuleTemplateActionModule {}
