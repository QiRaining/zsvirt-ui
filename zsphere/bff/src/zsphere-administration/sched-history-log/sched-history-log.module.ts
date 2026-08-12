import { Module } from '@nestjs/common'

import { HostModule } from '@/hardware-resource/host/host.module'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'

import { OwnerModule } from '../owner/owner.module'
import { SchedHistoryLogResolver } from './sched-history-log.resolver'
import { SchedHistoryLogService } from './sched-history-log.service'

@Module({
  imports: [OwnerModule, HostModule, VmInstanceModule],
  providers: [SchedHistoryLogService, SchedHistoryLogResolver]
})
export class SchedHistoryLogModule {}
