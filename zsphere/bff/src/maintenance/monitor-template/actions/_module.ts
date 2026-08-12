import { Module } from '@nestjs/common'

import { AddEventRuleTemplateAction } from '@/api/zstack/AddEventRuleTemplateAction'
import { AddMetricRuleTemplateAction } from '@/api/zstack/AddMetricRuleTemplateAction'
import { CreateMonitorTemplateAction } from '@/api/zstack/CreateMonitorTemplateAction'

import { ApplyMonitorTemplateToMonitorGroupService } from './apply-to-monitor-group'
@Module({
  providers: [
    CreateMonitorTemplateAction,
    AddMetricRuleTemplateAction,
    AddEventRuleTemplateAction,
    ApplyMonitorTemplateToMonitorGroupService,
  ],
  exports: []
})
export class MonitolTemplateActionModule {}
