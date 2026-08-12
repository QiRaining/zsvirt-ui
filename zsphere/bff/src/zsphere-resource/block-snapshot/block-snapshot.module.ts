import { Module } from '@nestjs/common'
// import { BlockSnapshotDataloader } from './affinity-group.dataloader'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { BlockSnapshotResolver } from './block-snapshot.resolver'
import { BlockSnapshotService } from './block-snapshot.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    BlockSnapshotResolver,
    BlockSnapshotService
    // BlockSnapshotDataloader
  ],
  exports: [
    // BlockSnapshotService,
    // BlockSnapshotDataloader
  ]
})
export class BlockSnapshotModule {}
