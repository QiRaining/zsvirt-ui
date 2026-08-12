import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ValidatePasswordResolver } from './validate.resolver'
import { ValidatePasswordService } from './validate.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [ValidatePasswordResolver, ValidatePasswordService, WebhookCallbackService]
})
export class ValidatePasswordModule {}
