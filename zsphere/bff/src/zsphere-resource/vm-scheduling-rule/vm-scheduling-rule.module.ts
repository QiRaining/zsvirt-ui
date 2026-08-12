import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { VmGroupModule } from '../vm-group/vm-group.module'
import { VmSchedulingRuleActionModule } from './action/_module'
import { VmSchedulingRuleResolver } from './vm-scheduling-rule.resolver'
import { VmSchedulingRuleService } from './vm-scheduling-rule.service'

@Module({
  imports: [
    VmSchedulingRuleActionModule,
    VmGroupModule,
    ZoneModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [VmSchedulingRuleResolver, VmSchedulingRuleService],
  exports: [VmSchedulingRuleService]
})
export class VmSchedulingRuleModule {}
