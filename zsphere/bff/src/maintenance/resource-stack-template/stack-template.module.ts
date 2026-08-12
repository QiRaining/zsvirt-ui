import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { StackTemplateResolver } from './stack-template.resolver'
import { StackTemplateService } from './stack-template.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
  ],
  providers: [StackTemplateService, StackTemplateResolver, OwnerDataLoader]
})
export class StackTemplateModule {}
