import { Module } from '@nestjs/common'

import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'

import { AddCbdMdsService } from './add-cbd-mds'
import { DeleteCbdMdsService } from './delete-cbd-mds'
import { UpdateCbdMdsService } from './update-cbd-mds'

@Module({
  providers: [
    AddCbdMdsService,
    UpdateCbdMdsService,
    DeleteCbdMdsService,
    PrimaryStorageQueryService
  ],
  exports: []
})
export class CbdMdsActionModule {}
