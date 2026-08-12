import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ConsoleProxyActionModule } from './action/_module'
import { ConsoleProxyAgentResolver } from './consoleproxy.resolver'
import { ConsoleProxyAgentService } from './consoleproxy.service'

@Module({
  imports: [
    ConsoleProxyActionModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [ConsoleProxyAgentResolver, ConsoleProxyAgentService]
})
export class ConsoleProxyAgentModule {}
