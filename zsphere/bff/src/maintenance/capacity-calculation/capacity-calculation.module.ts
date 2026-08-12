import { Module } from '@nestjs/common'

import {
  HostCpuMemoryCapacityCalculationResolver,
  LocalStorageHostCapacityCapacityCalculationResolver,
  PrimaryStorageCapacityCapacityCalculationResolver
} from './capacity-calculation.resolver'
import { CapacityCalculationQueryService } from './query/capacity-calculation-query.service'

@Module({
  providers: [
    HostCpuMemoryCapacityCalculationResolver,
    PrimaryStorageCapacityCapacityCalculationResolver,
    LocalStorageHostCapacityCapacityCalculationResolver,
    CapacityCalculationQueryService
  ]
})
export class CapacityCalculationModule {}
