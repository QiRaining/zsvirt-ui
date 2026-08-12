import { Module } from '@nestjs/common'

import { AddVmToSnapshotStrategyService } from './add-vm'
import { CreateSnapshotStrategyService } from './create'
import { DeleteSnapshotStrategyService } from './delete'
import { UpdateSnapshotStrategyService } from './update'

@Module({
  imports: [],
  exports: [],
  providers: [
    CreateSnapshotStrategyService,
    AddVmToSnapshotStrategyService,
    UpdateSnapshotStrategyService,
    DeleteSnapshotStrategyService
  ]
})
export class SnapshotStrategyActionModule {}
