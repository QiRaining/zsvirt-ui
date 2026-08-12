import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ZoneActionModule } from './action/_modules'
import { ZoneDataloader } from './zone.dataloader'
import { ZoneResolver } from './zone.resolver'
import { ZoneService } from './zone.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession]), ZoneActionModule],
  providers: [ZoneResolver, ZoneService, WebhookCallbackService, ZoneDataloader],
  exports: [ZoneDataloader]
})
export class ZoneModule {}
