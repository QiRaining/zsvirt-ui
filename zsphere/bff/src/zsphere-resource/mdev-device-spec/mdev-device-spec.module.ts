import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { MdevDeviceSpecResolver } from './mdev-device-spec.resolver'
import { MdevDeviceSpecService } from './mdev-device-spec.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [MdevDeviceSpecResolver, MdevDeviceSpecService]
})
export class MdevDeviceSpecModule {}
