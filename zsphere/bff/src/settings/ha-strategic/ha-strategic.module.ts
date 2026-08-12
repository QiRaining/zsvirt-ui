import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { HAStrategicResolver } from '@/settings/ha-strategic/ha-strategic.resolver'

import { HAStrategicService } from './ha-strategic.service'

@Module({
  imports: [ZStackApiModule, FlowModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [HAStrategicService, HAStrategicResolver]
})
export class HAStrategicModule {}
