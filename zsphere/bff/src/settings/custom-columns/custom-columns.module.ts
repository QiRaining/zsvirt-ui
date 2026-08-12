import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { CustomColumnsActionModule } from './action/_modules'
import { CustomColumnsResolver } from './custom-columns.resolver'
import { CustomColumnsService } from './custom-columns.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    CustomColumnsActionModule
  ],
  providers: [CustomColumnsService, CustomColumnsResolver]
})
export class CustomColumnsModule {}
