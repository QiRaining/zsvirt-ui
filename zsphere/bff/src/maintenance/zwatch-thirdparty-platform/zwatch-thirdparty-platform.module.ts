import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { ThirdpartyPlatformActionModule } from './action/_module'
import { QueryThirdpartyPlatformService } from './query/zwatch-thirdparty-platform-query.service'
import { ThirdpartyPlatformDataloader } from './zwatch-thirdparty-platform.dataloader'
import { ThirdpartyPlatformResolver } from './zwatch-thirdparty-platform.resolver'

@Module({
  imports: [
    OwnerModule,
    ZStackApiModule,
    ThirdpartyPlatformActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    ThirdpartyPlatformResolver,
    ThirdpartyPlatformActionModule,
    QueryThirdpartyPlatformService,
    ThirdpartyPlatformDataloader
  ],
  exports: [ThirdpartyPlatformDataloader]
})
export class ThirdpartyPlatformModule {}
