import { Module } from '@nestjs/common'

import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { QueryCBDPrimaryStoragePoolService } from './cbd-primary-storage-pool-query/query.service'
import { CBDPrimaryStoragePoolResolver } from './cbd-primary-storage-pool.resolver'

@Module({
  imports: [],
  providers: [
    CBDPrimaryStoragePoolResolver,
    QueryCBDPrimaryStoragePoolService,
    CapacityCalculationQueryService
  ]
})
export class CBDPrimaryStoragePoolModule {}
