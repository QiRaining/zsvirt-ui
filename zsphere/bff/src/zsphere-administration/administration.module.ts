import { Module } from '@nestjs/common'

import { AccessControlRuleModule } from './access-control-rule/access-control-rule.module'
import { AccessKeyModule } from './accesskey-management/accesskey-management.module'
import { AccountThirdPartyAuthModule } from './account-third-party-auth/account-third-party-auth.module'
import { AccountModule } from './account/account.module'
import { CertManageModule } from './cert-manage/cert-manage.module'
import { ConsoleProxyAgentModule } from './console-proxy/consoleproxy.module'
import { EmailServerSettingModule } from './email-server-setting/email-server-setting.module'
import { IpBlackWhiteListModule } from './ip-blackwhite-list/ip-blackwhite-list.module'
import { LicenseModule } from './license/license.module'
import { LogServerModule } from './log-server/log-server.module'
import { ManagementNodeModule } from './management-node/management-node.module'
import { OperationLogModule } from './operation-log/operation-log.module'
import { OwnerModule } from './owner/owner.module'
import { SchedHistoryLogModule } from './sched-history-log/sched-history-log.module'
import { SchedulerJobHistoryModule } from './scheduler-job-history/scheduler-job-history.module'
import { SchedulerJobModule } from './scheduler-job/scheduler-job.module'
import { SchedulerTriggerModule } from './scheduler-trigger/scheduler-trigger.module'
import { SnapshotStrategyModule } from './snapshot-strategy/snapshot-strategy.module'
import { SnmpManagementModule } from './snmp-management/snmp-management.module'
import { SystemSchedulingTaskModule } from './system-scheduling-task/system-scheduling-task.module'
import { TagModule } from './tag/tag.module'
import { TelemetryModule } from './telemetry/telemetry.module'
import { ThirdPartyAuthModule } from './third-party-auth/third-party-auth.module'
import { TimeServerModule } from './time-server/time-server.module'
import { UserGroupModule } from './user-group/user-group.module'
import { ZsvRoleModule } from './zsv-role/zsv-role.module'

@Module({
  imports: [
    OwnerModule,
    TagModule,
    SchedulerJobModule,
    SchedulerTriggerModule,
    SchedulerJobHistoryModule,
    SnapshotStrategyModule,
    OperationLogModule,
    ManagementNodeModule,
    SchedHistoryLogModule,
    SystemSchedulingTaskModule,
    AccessControlRuleModule,
    //sort by zsphere menu、
    TimeServerModule,
    AccountModule,
    UserGroupModule,
    AccountThirdPartyAuthModule,
    ZsvRoleModule,
    ThirdPartyAuthModule,
    IpBlackWhiteListModule,
    CertManageModule,
    AccessKeyModule,
    ConsoleProxyAgentModule,
    SnmpManagementModule,
    LogServerModule,
    EmailServerSettingModule,
    TelemetryModule,
    LicenseModule
  ]
})
export class AdministrationModule {}
