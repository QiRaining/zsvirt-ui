import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { BaremetalChassisActionModule } from './action'
import { BaremetalChassisDataloader } from './baremetal-chassis.dataloader'
import { BaremetalChassisResolver } from './baremetal-chassis.resolver'
import { BaremetalChassisService } from './baremetal-chassis.service'

@Module({
  imports: [
    ClusterModule,
    ZoneModule,
    BaremetalChassisActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [BaremetalChassisService, BaremetalChassisResolver, BaremetalChassisDataloader],
  exports: [BaremetalChassisDataloader]
})
export class BaremetalChassisModule {}
