import { Module } from '@nestjs/common'

import { AddExternalPrimaryStoragePoolService } from './add'
import { DeleteExternalPrimaryStoragePoolService } from './delete'
import { UpdateExternalPrimaryStoragePoolService } from './update'

@Module({
  providers: [
    AddExternalPrimaryStoragePoolService,
    UpdateExternalPrimaryStoragePoolService,
    DeleteExternalPrimaryStoragePoolService
  ],
  exports: []
})
export class ExternalPrimaryStoragePoolActionModule {}
