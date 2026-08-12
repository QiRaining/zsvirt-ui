import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { ResourceConfigResolver } from '@/settings/resource-config/resource-config.resolver'

import { ResourceConfigActionModule } from './action/_module'
import { ResourceConfigService } from './resource-config.service'

@Module({
  imports: [
    ResourceConfigActionModule,
    ZStackApiModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [ResourceConfigService, ResourceConfigResolver]
})
export class ResourceConfigModule {}
