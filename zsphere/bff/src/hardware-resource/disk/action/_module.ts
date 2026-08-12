import { Module } from '@nestjs/common'

import { LocateLocalRaidPhysicalDriveService } from './locate-local-raid-phisical-drive'
import { RefreshDiskAction } from './RefreshDiskAction'

@Module({
  providers: [LocateLocalRaidPhysicalDriveService, RefreshDiskAction]
})
export class DiskActionModule {}
