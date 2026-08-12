import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { VmGroupActionModule } from './action/_module'
import { VmGroupDataloader } from './vm-group.dataloader'
import { VmGroupResolver } from './vm-group.resolver'
import { VmGroupService } from './vm-group.service'

@Module({
  imports: [VmGroupActionModule, ZoneModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [VmGroupResolver, VmGroupService, VmGroupDataloader],
  exports: [VmGroupService, VmGroupDataloader]
})
export class VmGroupModule {}
