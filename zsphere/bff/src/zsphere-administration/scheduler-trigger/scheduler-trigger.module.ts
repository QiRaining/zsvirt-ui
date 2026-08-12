import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { SchedulerTriggerActionModule } from './action/_module'
import { SchedulerTriggerResolver } from './scheduler-trigger.resolver'
import { SchedulerTriggerService } from './scheduler-trigger.service'

@Module({
  imports: [SchedulerTriggerActionModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [SchedulerTriggerResolver, SchedulerTriggerService]
})
export class SchedulerTriggerModule {}
