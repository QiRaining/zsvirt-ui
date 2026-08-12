import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { IpBlackWhiteListResolver } from './ip-blackwhite-list.resolver'
import { IpBlackWhiteListService } from './ip-blackwhite-list.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [IpBlackWhiteListResolver, IpBlackWhiteListService]
})
export class IpBlackWhiteListModule {}
