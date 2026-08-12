import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { SchedulerJobGroupActionModule } from './action/_module'
import { CreateDatabaseBackupJobModule } from './action/create-database-backup-job/_module'
import { CreateResourceBackupJobModule } from './action/create-resource-backup-job/_module'
import { SchedulerJobGroupQueryService } from './scheduler-job-group-query/scheduler-job-group-query.service'
import { SchedulerJobGroupResolver } from './scheduler-job-group.resolver'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    OwnerModule,
    ZoneModule,
    CreateDatabaseBackupJobModule,
    CreateResourceBackupJobModule,
    SchedulerJobGroupActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [SchedulerJobGroupResolver, SchedulerJobGroupQueryService]
})
export class SchedulerJobGroupModule {}
