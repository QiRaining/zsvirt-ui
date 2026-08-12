import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { PreconfigurationTemplateActionModule } from './action/_modules'
//import { PreconfigurationTemplateDataloader } from './preconfiguration-template.dataloader'
import { PreconfigurationTemplateResolver } from './preconfiguration-template.resolver'
import { PreconfigurationTemplateQueryService } from './query/query-preconfiguration-template'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    PreconfigurationTemplateActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [PreconfigurationTemplateQueryService, PreconfigurationTemplateResolver]
  //exports: [PreconfigurationTemplateDataloader]
})
export class PreconfigurationTemplateModule {}
