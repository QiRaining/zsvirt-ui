import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { HostModule } from '@/hardware-resource/host/host.module'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { OperationLogActionModule } from '@/zsphere-administration/operation-log/action/_modules'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagModule } from '@/zsphere-administration/tag/tag.module'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import { VmInstanceModule } from '../vm-instance/vm-instance.module'
import { VmTemplateActionModule } from './action/_module'
import { VmTemplateService } from './query/query.service'
import { VmTemplateResolver } from './vm-template.resolver'

@Module({
  imports: [
    AuditModule,
    ClusterModule,
    TagModule,
    HostModule,
    VmInstanceModule,
    ZStackApiModule,
    VmTemplateActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession, ZsLongJob]),
    OperationLogActionModule
  ],
  providers: [
    VmTemplateResolver,
    VmTemplateService,
    VmInstanceDataloader,
    // ClusterDataloader,
    OwnerDataLoader
  ],
  exports: []
})
export class VmTemplateModule {}
