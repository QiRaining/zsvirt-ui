import { Module } from '@nestjs/common'

import { AlarmDataModule } from '@/maintenance/alarm-data/alarm-data.module'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { ZWatchAlarmModule } from '@/maintenance/zwatch-alarm/zwatch.alarm.module'

import { CapacityCalculationModule } from './capacity-calculation/capacity-calculation.module'
import { CapacityManagementModule } from './capacity-management/capacity-management.module'
import { EventRuleTemplateModule } from './event-rule-template/event-rule-template.module'
import { InspectionModule } from './inspection/inspection.module'
import { MetricRuleTemplateModule } from './metric-rule-template/metric-rule-template.module'
import { MonitorGroupModule } from './monitor-group/monitor-group.module'
import { MonitorTemplateModule } from './monitor-template/monitor-template.module'
import { NetworkTopologyModule } from './network-topology/network.module'
import { OneClickAlarmModule } from './one-click-alarm/one-click-alarm.module'
import { PerformanceModule } from './performance/performance.module'
import { StackTemplateModule } from './resource-stack-template/stack-template.module'
import { ResourceStackModule } from './resource-stack/resource-stack.module'
import { AlarmHistoriesModule } from './zwatch-alarm-histories/zwatch-alarm-histories.module'
import { EndPointModule } from './zwatch-endpoint/zwatch-endpoint.module'
import { SNSDingTalkAtPersonModule } from './zwatch-sns-dingtalk-at-person/zwatch-sns-dingtalk-at-person.module'
import { SNSFeiShuAtPersonModule } from './zwatch-sns-feishu-at-person/zwatch-sns-feishu-at-person.module'
import { SNSTextTemplateModule } from './zwatch-sns-text-template/sns-text-template.module'
import { SNSWeComAtPersonModule } from './zwatch-sns-wecom-at-person/zwatch-sns-wecom-at-person.module'
import { ThirdPartyAlertsModule } from './zwatch-third-party-alerts/zwatch-third-party-alerts.module'
import { ThirdpartyPlatformModule } from './zwatch-thirdparty-platform/zwatch-thirdparty-platform.module'

@Module({
  imports: [
    AuditModule,
    ZWatchAlarmModule,
    AlarmDataModule,
    EndPointModule,
    AlarmHistoriesModule,
    ThirdPartyAlertsModule,
    ResourceStackModule,
    StackTemplateModule,
    SNSTextTemplateModule,
    ThirdpartyPlatformModule,
    MonitorTemplateModule,
    MonitorGroupModule,
    OneClickAlarmModule,
    CapacityManagementModule,
    MetricRuleTemplateModule,
    EventRuleTemplateModule,
    NetworkTopologyModule,
    PerformanceModule,
    InspectionModule,
    CapacityCalculationModule,

    SNSWeComAtPersonModule,
    SNSFeiShuAtPersonModule,
    SNSDingTalkAtPersonModule
  ],
  providers: []
})
export class MaintenanceModule {}
