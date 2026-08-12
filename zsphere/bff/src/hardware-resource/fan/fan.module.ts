import { Module } from '@nestjs/common'

import { HardwareSummaryService } from '../host/query/summary.service'
import { FanResolver } from './fan.resolver'

@Module({
  providers: [FanResolver, HardwareSummaryService]
})
export class FanModule {}
