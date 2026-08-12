import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { TransModule } from '../../common/trans/trans.module'
import { ZsSession } from '../../model/zs-session.model'
import { LogoutResolver } from './logout.resolver'
import { LogoutService } from './logout.service'

@Module({
  imports: [TransModule, ZStackApiModule, SequelizeModule.forFeature([ZsSession])],
  providers: [LogoutService, LogoutResolver]
})
export class LogoutModule {}
