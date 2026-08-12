import { Module } from '@nestjs/common'

import { StorageAdapterActionModule } from './action/_module'
import { StorageAdapterResolver } from './storage-adapter.resolver'
import { StorageAdapterService } from './storage-adapter.service'

@Module({
  imports: [StorageAdapterActionModule],
  providers: [StorageAdapterService, StorageAdapterResolver],
  exports: [StorageAdapterService]
})
export class StorageAdapterModule {}
