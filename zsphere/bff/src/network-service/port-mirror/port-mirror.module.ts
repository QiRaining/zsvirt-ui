import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { PortMirrorResolver } from './port-mirror.resolver'
import { PortMirrorService } from './port-mirror.service'

@Module({
  imports: [
    L3NetworkModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [PortMirrorResolver, PortMirrorService]
})
export class PortMirrorModule {}
