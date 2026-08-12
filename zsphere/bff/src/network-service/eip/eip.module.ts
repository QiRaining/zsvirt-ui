import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { EipDataloader } from './eip.dataloader'
import { EipResolver } from './eip.resolver'
import { EipService } from './eip.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [EipResolver, EipService, EipDataloader],
  exports: [EipDataloader]
})
export class EipModule {}
