import { Module } from '@nestjs/common'

import { HardwareSummaryService } from '../host/query/summary.service'
import { RaidService } from './raid.service'

@Module({
  providers: [RaidService, HardwareSummaryService]
})
export class RaidModule {}
