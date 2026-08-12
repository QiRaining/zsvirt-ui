import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { SdnControllerResolver } from './sdn-controller.resolver'
import { SdnControllerService } from './sdn-controller.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [SdnControllerResolver, SdnControllerService]
})
export class SdnControllerModule {}
