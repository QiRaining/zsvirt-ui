import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'
import { VolumeModule } from '@/zsphere-resource/volume/volume.module'

import { SchedulerJobHistoryGroupByFireInstanceIdQueryService } from './scheduler-job-history-group-by-fire-instance-id-query/scheduler-job-history-group-by-fire-instance-id-query.service'
import { SchedulerJobHistoryQueryService } from './scheduler-job-history-query/scheduler-job-history-query.service'
import {
  SchedulerJobHistoryGroupByFireInstanceIdResolver,
  SchedulerJobHistoryResolver
} from './scheduler-job-history.resolver'

@Module({
  imports: [VmInstanceModule, VolumeModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    SchedulerJobHistoryResolver,
    SchedulerJobHistoryGroupByFireInstanceIdResolver,
    SchedulerJobHistoryQueryService,
    SchedulerJobHistoryGroupByFireInstanceIdQueryService
  ]
})
export class SchedulerJobHistoryModule {}
