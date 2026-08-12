import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { EndPointActionModule } from './action/_modules'
import { HybridKeySecretDataLoader } from './hybrid-key-secret.dataloader'
import { EndpointQueryService } from './query/query.service'
import {
  EndPointResolver,
  WeComEndPointResolver,
  FeiShuEndPointResolver,
  DingTalkEndPointResolver,
  AlayunSmsEndPointResolver
} from './zwatch-endpoint.resolver'
import { EndPointService } from './zwatch-endpoint.service'

@Module({
  imports: [
    OwnerModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    EndPointActionModule
  ],
  providers: [
    EndPointResolver,
    WeComEndPointResolver,
    FeiShuEndPointResolver,
    DingTalkEndPointResolver,
    AlayunSmsEndPointResolver,
    EndPointService,
    EndpointQueryService,
    HybridKeySecretDataLoader
  ],
  exports: [EndpointQueryService]
})
export class EndPointModule {}
