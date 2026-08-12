import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { SharedBlockActionModule } from './action/_module'
import { CandidateSharedBlockResolver, SharedBlockResolver } from './shared-block.resolver'
import { SharedBlockService } from './shared-block.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    SharedBlockActionModule
  ],
  providers: [
    SharedBlockService,
    CandidateSharedBlockResolver,
    SharedBlockResolver,
    CapacityCalculationQueryService
  ]
})
export class SharedBlockModule {}
