import { Module } from '@nestjs/common'

import { AddCephPrimaryStoragePoolService } from './add-ceph-primary-storage-pool'
import { DeleteCephPrimaryStoragePoolService } from './delete-ceph-primary-storage-pool'
import { UpdateCephPrimaryStoragePoolService } from './update-ceph-primary-storage-pool'

@Module({
  providers: [
    AddCephPrimaryStoragePoolService,
    UpdateCephPrimaryStoragePoolService,
    DeleteCephPrimaryStoragePoolService,
  ],
  exports: []
})
export class CephPrimaryStoragePoolActionModule {}
