import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ServerLogController } from './server-log.controller'
import { ServerLogService } from './server-log.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [ServerLogService],
  controllers: [ServerLogController]
})
export class ServerLogModule {}
