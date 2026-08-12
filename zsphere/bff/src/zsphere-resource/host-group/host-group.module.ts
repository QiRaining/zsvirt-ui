import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { HostGroupActionModule } from './action/_module'
import { HostGroupResolver } from './host-group.resolver'
import { HostGroupService } from './host-group.service'

@Module({
  imports: [
    HostGroupActionModule,
    ClusterModule,
    ZoneModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [HostGroupResolver, HostGroupService],
  exports: [HostGroupService]
})
export class HostGroupModule {}
