import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { InstallPathRecycleQueryService } from '@/hardware-resource/trash/install-path-recycle-query/install-path-recycle-query.service'
import { TrashResolver } from '@/hardware-resource/trash/trash.resolver'
import { TrashService } from '@/hardware-resource/trash/trash.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { CleanUpTrashActionModule } from './action/_module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    CleanUpTrashActionModule
  ],
  providers: [TrashService, InstallPathRecycleQueryService, TrashResolver, QueryBase]
})
export class TrashModule {}
