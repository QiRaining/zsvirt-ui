import { Module } from '@nestjs/common'

import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { SnapshotStrategyActionModule } from './action/_module'
import { SnapshotStrategyQueryService } from './query/snapshot-strategy-query.service'
import { SnapshotStrategyResolver } from './snapshot-strategy.resolver'

@Module({
  imports: [OwnerModule, SnapshotStrategyActionModule],
  providers: [SnapshotStrategyQueryService, SnapshotStrategyResolver]
})
export class SnapshotStrategyModule {}
