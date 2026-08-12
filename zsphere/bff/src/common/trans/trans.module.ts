import { HttpModule } from '@nestjs/axios'
import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { LongJobService } from '@/common/long-job/long-job.service'
import { MkHttpService } from '@/common/trans/zs-http-service/mk-http-service.service'

import { UtilsModule } from '../utils/utils.module'
import { ZopsHttpServiceBase } from './zs-http-service/zops-http-service-base.service'
import { ZopsHttpService } from './zs-http-service/zops-http-service.service'
import { ZsHttpServiceBase } from './zs-http-service/zs-http-service-base.service'
import { ZsHttpService } from './zs-http-service/zs-http-service.service'
import { ZStoneHttpService } from './zs-http-service/zstone-http-service.service'

@Global()
@Module({
  imports: [HttpModule, ConfigModule, UtilsModule],
  providers: [
    ZsHttpServiceBase,
    ZsHttpService,
    ZQLService,
    ZopsHttpService,
    ZopsHttpServiceBase,
    LongJobService,
    ZStoneHttpService,
    MkHttpService
  ],
  exports: [
    ZsHttpServiceBase,
    ZsHttpService,
    ZQLService,
    ZopsHttpService,
    ZopsHttpServiceBase,
    MkHttpService,
    LongJobService,
    ZStoneHttpService,
    MkHttpService
  ]
})
export class TransModule {}
