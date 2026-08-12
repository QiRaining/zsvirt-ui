import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { SystemTagModule } from '@/common/system-tag/system-tag.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'

import { HostKernelInterfaceModule } from '../host-kernel-interface/host-kernel-interface.module'
import { L2NetworkActionModule } from './action/_module'
import { L2NetworkResolver } from './l2.network.resolver'
import { L2NetworkService } from './l2.network.service'

@Module({
  imports: [
    OwnerModule,
    L2NetworkActionModule,
    PubSubModule,
    FlowModule,
    SystemTagModule,
    ResourceAttributeModule,
    HostKernelInterfaceModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [L2NetworkResolver, L2NetworkService],
  exports: [L2NetworkService]
})
export class L2NetworkModule {}
