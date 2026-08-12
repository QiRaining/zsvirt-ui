import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { MdevDeviceActionModule } from '@/hardware-resource/mdev-device/action/_module'

import { FlowModule } from '../../common/flow/flow.module'
import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { MdevDeviceQueryService } from './mdev-device-query/mdev-device-query.service'
import { MdevDeviceResolver } from './mdev-device.resolver'

@Module({
  imports: [
    MdevDeviceActionModule,
    ZStackApiModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [MdevDeviceResolver, MdevDeviceQueryService]
})
export class MdevDevicModule {}
