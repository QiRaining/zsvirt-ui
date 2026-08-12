import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { DashboardHomepageLayoutsConfigService } from './homepage.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [DashboardHomepageLayoutsConfigService]
})
export class HomepageModule {}
