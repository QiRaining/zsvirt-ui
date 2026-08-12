import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { BackupOverviewQueryService } from './backup-overview.service'

@Module({
  imports: [PubSubModule, FlowModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [BackupOverviewQueryService]
})
export class BackupOverviewModule {}
