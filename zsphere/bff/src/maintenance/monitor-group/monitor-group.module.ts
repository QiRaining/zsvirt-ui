import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'

import { MonitorGroupActionModule } from './action/_module'
import { MonitorGroupResolver, MonitorGroupResourceResolver } from './monitor-group.resolver'
import { MonitorGroupService } from './monitor-group.service'

@Module({
  imports: [
    TagModule,
    OwnerModule,
    ZStackApiModule,
    MonitorGroupActionModule,
    L3NetworkModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [MonitorGroupResolver, MonitorGroupService, MonitorGroupResourceResolver],
  exports: [MonitorGroupService]
})
export class MonitorGroupModule {}
