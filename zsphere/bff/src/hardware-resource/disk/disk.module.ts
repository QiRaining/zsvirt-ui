import { Module } from '@nestjs/common'

import { HardwareSummaryService } from '../host/query/summary.service'
import { DiskActionModule } from './action/_module'
import { DiskResolver } from './disk.resolver'
import { DiskService } from './disk.service'

@Module({
  imports: [DiskActionModule],
  providers: [DiskResolver, DiskService, HardwareSummaryService]
})
export class DiskModule {}
