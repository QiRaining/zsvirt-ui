import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ResourceStackResolver } from '@/maintenance/resource-stack/resource-stack.resolver'
import { ResourceStackService } from '@/maintenance/resource-stack/resource-stack.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [ResourceStackService, ResourceStackResolver, QueryBase],
  exports: [ResourceStackService]
})
export class ResourceStackModule {}
