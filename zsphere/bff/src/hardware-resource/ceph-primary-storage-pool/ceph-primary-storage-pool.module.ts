import { Module } from '@nestjs/common'

import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { PrimaryStorageModule } from '../primary-storage/primary-storage.module'
import { CephPrimaryStoragePoolActionModule } from './action/_module'
import { CephPrimaryStoragePoolQueryService } from './ceph-primary-storage-pool-query/ceph-primary-storage-pool-query.service'
import { CephPrimaryStoragePoolResolver } from './ceph-primary-storage-pool.resolver'

@Module({
  imports: [CephPrimaryStoragePoolActionModule, PrimaryStorageModule],
  providers: [
    CephPrimaryStoragePoolResolver,
    CephPrimaryStoragePoolQueryService,
    CapacityCalculationQueryService
  ]
})
export class CephPrimaryStoragePoolModule {}
