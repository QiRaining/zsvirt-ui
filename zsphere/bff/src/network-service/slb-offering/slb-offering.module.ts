import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { ImageModule } from '@/zsphere-resource/image/image.module'

import { SlbOfferingActionModule } from './action/_module'
import { SlbOfferingQueryService } from './slb-offering-query/slb-offering-query.service'
import { SlbOfferingDataloader } from './slb-offering.dataloader'
import { SlbOfferingResolver } from './slb-offering.resolver'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    ImageModule,
    OwnerModule,
    L3NetworkModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    SlbOfferingActionModule
  ],
  providers: [SlbOfferingResolver, SlbOfferingQueryService, SlbOfferingDataloader],
  exports: [SlbOfferingDataloader]
})
export class SlbOfferingModule {}
