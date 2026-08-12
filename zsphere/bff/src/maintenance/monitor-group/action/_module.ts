import { Module } from '@nestjs/common'

import { MonitorGroupService } from '../monitor-group.service'
import { CreateMonitorGroupService } from './create'
import { RevokeMonitorTemplateFromMonitorGroupService } from './revoke-rule-template'
import { UpdateMonitorGroupService } from './update'

@Module({
  providers: [
    CreateMonitorGroupService,
    UpdateMonitorGroupService,
    RevokeMonitorTemplateFromMonitorGroupService,
    MonitorGroupService,
  ],
  exports: [MonitorGroupService]
})
export class MonitorGroupActionModule {}
