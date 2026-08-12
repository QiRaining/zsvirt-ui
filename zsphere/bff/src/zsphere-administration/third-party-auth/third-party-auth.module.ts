import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { ThirdPartyAuthActionModule } from './action/_module'
import { ThirdPartyAuthCreateModule } from './create/_module'
import { ThirdPartyAuthQueryService } from './query/third-party-auth-query.service'
import { ThirdPartyAuthResolver } from './third-party-auth.resolver'
import { ThirdPartyAuthService } from './third-party-auth.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    ThirdPartyAuthActionModule,
    ThirdPartyAuthCreateModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [ThirdPartyAuthQueryService, ThirdPartyAuthService, ThirdPartyAuthResolver]
})
export class ThirdPartyAuthModule {}
