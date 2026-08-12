import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'
import { VolumeModule } from '@/zsphere-resource/volume/volume.module'

import { SystemSchedulingTaskResolver } from './system-scheduling-task.resolver'
import { SystemSchedulingTaskService } from './system-scheduling-task.service'

@Module({
  imports: [
    ZStackApiModule,
    VolumeModule,
    VmInstanceModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [SystemSchedulingTaskService, SystemSchedulingTaskResolver],
  exports: [SystemSchedulingTaskResolver, SystemSchedulingTaskService]
})
export class SystemSchedulingTaskModule {}
