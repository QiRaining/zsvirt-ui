import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { OwnerDataLoader } from '../owner/owner.dataloader'
import { AccessKeyResolver, ThirdPartAccessKeyResolver } from './accesskey-management.resolver'
import { AccessKeyService } from './accesskey-management.service'
import { AccessKeyActionModule } from './action/_module'

@Module({
  imports: [
    AccessKeyActionModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [AccessKeyResolver, ThirdPartAccessKeyResolver, AccessKeyService, OwnerDataLoader]
})
export class AccessKeyModule {}
