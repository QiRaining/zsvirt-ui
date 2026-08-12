import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { SNSTextTemplateActionModule } from './action/_modules'
import { SNSTextTemplateResolver } from './sns-text-template.resolver'
import { SNSTextTemplateService } from './sns-text-template.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    SNSTextTemplateActionModule
  ],
  providers: [SNSTextTemplateService, SNSTextTemplateResolver]
})
export class SNSTextTemplateModule {}
