import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { OwnerActionModule } from './action/_module'
import {
  OwnerByAccountUuidDataLoader,
  OwnerByAccountUuidsDataLoader,
  OwnerDataLoader
} from './owner.dataloader'
import { OwnerResolver } from './owner.resolver'
import { OwnerService } from './owner.service'
import { SharedResourceQueryService } from './shared-resource-query'
import { ZsvSharedResourceQueryService } from './zsv-shared-resource-query'

@Global()
@Module({
  imports: [OwnerActionModule, ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    OwnerService,
    OwnerResolver,
    OwnerDataLoader,
    SharedResourceQueryService,
    OwnerByAccountUuidDataLoader,
    OwnerByAccountUuidsDataLoader,
    ZsvSharedResourceQueryService
  ],
  exports: [
    OwnerDataLoader,
    SharedResourceQueryService,
    OwnerByAccountUuidDataLoader,
    OwnerByAccountUuidsDataLoader,
    ZsvSharedResourceQueryService
  ]
})
export class OwnerModule {}
