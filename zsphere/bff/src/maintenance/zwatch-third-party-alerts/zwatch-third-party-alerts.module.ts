import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ThirdPartyAlertsResolver } from '@/maintenance/zwatch-third-party-alerts/zwatch-third-party-alerts.resolver'
import { ThirdPartyAlertsService } from '@/maintenance/zwatch-third-party-alerts/zwatch-third-party-alerts.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ThirdpartyPlatformModule } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.module'
import { ThirdPartyAlertsActionModule } from './action/_module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    ThirdPartyAlertsActionModule,
    ThirdpartyPlatformModule
  ],
  providers: [ThirdPartyAlertsService, ThirdPartyAlertsResolver, QueryBase]
})
export class ThirdPartyAlertsModule {}
