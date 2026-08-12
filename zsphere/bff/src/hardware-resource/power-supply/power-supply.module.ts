import { Module } from '@nestjs/common'

import { HardwareSummaryService } from '../host/query/summary.service'
import { PowerSupplyResolver } from './power-supply.resolver'
import { PowerSupplyService } from './power-supply.service'

@Module({
  providers: [PowerSupplyResolver, PowerSupplyService, HardwareSummaryService]
})
export class PowerSupplyModule {}
