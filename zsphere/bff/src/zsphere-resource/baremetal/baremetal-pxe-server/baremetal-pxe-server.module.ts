import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { BaremetalPxeServerActionModule } from './action/_module'
import { BaremetalPxeserviceDataloader } from './baremetal-pxe-server.dataloader'
import { BaremetalPxeServerResolver } from './baremetal-pxe-server.resolver'
import { QueryBaremetalPxeServerService } from './query/baremetal-pxeservice-query.service'

@Module({
  imports: [
    OwnerModule,
    ZStackApiModule,
    BaremetalPxeServerActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    BaremetalPxeServerResolver,
    QueryBaremetalPxeServerService,
    BaremetalPxeserviceDataloader
  ],
  exports: [BaremetalPxeserviceDataloader, BaremetalPxeServerActionModule]
})
export class BaremetalPxeServerModule {}
