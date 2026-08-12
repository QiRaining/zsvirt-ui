import { Module } from '@nestjs/common'

import { HostQueryService } from '../host/query/host-query.service'
import { HardwareSummaryService } from '../host/query/summary.service'
import { CPUResolver } from './cpu.resolver'
import { CPUService } from './cpu.service'

@Module({
  providers: [CPUResolver, CPUService, HardwareSummaryService, HostQueryService]
})
export class CPUModule {}
