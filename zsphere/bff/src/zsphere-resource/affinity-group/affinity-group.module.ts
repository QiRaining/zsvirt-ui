import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { AffinityGroupDataloader } from './affinity-group.dataloader'
import { AffinityGroupResolver } from './affinity-group.resolver'
import { AffinityGroupService } from './affinity-group.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [AffinityGroupResolver, AffinityGroupService, AffinityGroupDataloader],
  exports: [AffinityGroupService, AffinityGroupDataloader]
})
export class AffinityGroupModule {}
