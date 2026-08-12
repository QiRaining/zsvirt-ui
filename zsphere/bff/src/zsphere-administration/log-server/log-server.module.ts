import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { LogServerActionModule } from './action/_modules'
import { LogServerResolver } from './log-server.resolver'
import { LogServerService } from './log-server.service'

@Module({
  imports: [
    LogServerActionModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [LogServerResolver, LogServerService, OwnerDataLoader]
})
export class LogServerModule {}
