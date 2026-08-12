import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ResourceQueryResolver } from './resource-query.resolver'
import { ResourceQueryService } from './resource-query.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [ResourceQueryResolver, ResourceQueryService]
})
export class ResourceQueryModule {}
