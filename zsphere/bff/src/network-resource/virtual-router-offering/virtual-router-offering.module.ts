import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { OwnerService } from '@/zsphere-administration/owner/owner.service'
import { ImageModule } from '@/zsphere-resource/image/image.module'
import { VirtualRouterOfferingDataloader } from './virtual-router-offering.dataloader'
import {
  VirtualRouterOfferingResolver,
  BackupDataFormImageStorageResolver
} from './virtual-router-offering.resolver'
import { VirtualRouterOfferingService } from './virtual-router-offering.service'

@Module({
  imports: [
    OwnerModule,
    ZStackApiModule,
    FlowModule,
    ImageModule,
    L3NetworkModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
  ],
  providers: [
    OwnerService,
    VirtualRouterOfferingService,
    VirtualRouterOfferingResolver,
    BackupDataFormImageStorageResolver,
    VirtualRouterOfferingDataloader
  ],
  exports: [VirtualRouterOfferingDataloader]
})
export class VirtualRouterOfferingModule {}
