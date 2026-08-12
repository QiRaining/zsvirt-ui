import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { EmailServerSettingActionModule } from './action/_modules'
import { EmailServerSettingResolver } from './email-server-setting.resolver'
import { EmailServerSettingService } from './query/email-server-setting-query'

@Module({
  imports: [
    EmailServerSettingActionModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [EmailServerSettingService, EmailServerSettingResolver, OwnerDataLoader]
})
export class EmailServerSettingModule {}
