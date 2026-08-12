import { Module } from '@nestjs/common'

import { HardwareSummaryService } from '../host/query/summary.service'
import { MemoryResolver } from './memory.resolver'
import { MemoryService } from './memory.service'

@Module({
  providers: [MemoryResolver, MemoryService, HardwareSummaryService]
})
export class MemoryModule {}
