import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { AccountDataloader } from './account.dataloader'
import { AccountQuotaUsageResolver, AccountResolver } from './account.resolver'
import { AccountActionModule } from './action/_module'
import { CreateAccountService } from './create'
import { AccountQueryService } from './query'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    AccountActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    AccountResolver,
    AccountDataloader,
    AccountQueryService,
    CreateAccountService,
    AccountQuotaUsageResolver
  ],
  exports: [AccountDataloader]
})
export class AccountModule {}
