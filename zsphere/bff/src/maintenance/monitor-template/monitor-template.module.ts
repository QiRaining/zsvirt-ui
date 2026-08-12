import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { QueryMonitorTemplateAction } from '@/api/zstack/QueryMonitorTemplateAction'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { MonitorTemplateResolver } from '@/maintenance/monitor-template/monitor-template.resolver'
import { MonitorTemplateService } from '@/maintenance/monitor-template/monitor-template.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'

import { MonitolTemplateActionModule } from './actions/_module'

@Module({
  imports: [
    MonitolTemplateActionModule,
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    TagModule,
    OwnerModule
  ],
  providers: [
    MonitorTemplateService,
    MonitorTemplateResolver,
    QueryBase,
    QueryMonitorTemplateAction
  ]
})
export class MonitorTemplateModule {}
