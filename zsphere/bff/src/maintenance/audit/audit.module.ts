import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import { AuditResolver } from '@/maintenance/audit/audit.resolver'
import { AuditService } from '@/maintenance/audit/audit.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

@Module({
  imports: [PubSubModule, FlowModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [AuditService, AuditResolver, QueryBase, GetResourceNamesAction, SystemTagDataloader],
  exports: [AuditService, AuditResolver]
})
export class AuditModule {}
