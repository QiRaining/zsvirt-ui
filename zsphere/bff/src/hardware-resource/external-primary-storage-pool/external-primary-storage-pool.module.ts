import { Module } from '@nestjs/common'

import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { ExternalPrimaryStoragePoolActionModule } from './action/_module'
import { QueryExternalPrimaryStoragePoolService } from './external-primary-storage-pool-query/external-primary-storage-pool-query.service'
import { ExternalPrimaryStoragePoolResolver } from './external-primary-storage-pool.resolver'

@Module({
  imports: [ExternalPrimaryStoragePoolActionModule],
  providers: [
    ExternalPrimaryStoragePoolResolver,
    QueryExternalPrimaryStoragePoolService,
    CapacityCalculationQueryService
  ]
})
export class ExternalPrimaryStoragePoolModule {}
