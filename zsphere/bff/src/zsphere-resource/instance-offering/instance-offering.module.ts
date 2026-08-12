import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { InstanceOfferingDataloader } from './instance-offering.dataloader'
import { InstanceOfferingResolver } from './instance-offering.resolver'
import { InstanceOfferingService } from './instance-offering.service'

@Module({
  imports: [
    OwnerModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [InstanceOfferingResolver, InstanceOfferingService, InstanceOfferingDataloader],
  exports: [InstanceOfferingDataloader]
})
export class InstanceOfferingModule {}
