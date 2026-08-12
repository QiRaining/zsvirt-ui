import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ManagementNodeResolver } from './management-node.resolver'
import { ManagementNodeService } from './management-node.service'

@Global()
@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [ManagementNodeResolver, ManagementNodeService],
  exports: [ManagementNodeService]
})
export class ManagementNodeModule {}
