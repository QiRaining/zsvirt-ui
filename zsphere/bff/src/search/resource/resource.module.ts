import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { SearchResourceResolver } from './resource.resolver'
import { SearchResourceService } from './resource.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [SearchResourceService, SearchResourceResolver, GetZMigrateGatewayVmInstancesAction]
})
export class SearchResourceModule {}
