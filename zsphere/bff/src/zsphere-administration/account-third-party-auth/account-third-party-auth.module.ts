import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { AccountThirdPartyAuthResolver } from './account-third-party-auth.resolver'
import { AccountThirdPartyAuthQueryService } from './account-third-party-auth.service'
import { AccountActionThirdPartyAuthModule } from './action/_module'
import { AccountThirdPartyAuthCreateModule } from './create/_module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    AccountActionThirdPartyAuthModule,
    AccountThirdPartyAuthCreateModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [AccountThirdPartyAuthResolver, AccountThirdPartyAuthQueryService],
  exports: []
})
export class AccountThirdPartyAuthModule {}
