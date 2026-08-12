import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'
import { VolumeModule } from '@/zsphere-resource/volume/volume.module'

import { SchedulerJobActionModule } from './action/_module'
import { SchedulerJobQueryService } from './scheduler-job-query/scheduler-job-query.service'
import { SchedulerJobResolver } from './scheduler-job.resolver'
import { SchedulerJobService } from './scheduler-job.service'

@Module({
  imports: [
    SchedulerJobActionModule,
    VmInstanceModule,
    OwnerModule,
    VolumeModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [SchedulerJobResolver, SchedulerJobService, SchedulerJobQueryService]
})
export class SchedulerJobModule {}
