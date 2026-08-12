import { Global, Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { UploadJobRetryService } from './upload-job-retry.service'
import { UploadOffsetResolverService } from './upload-offset-resolver.service'
import { UploadProxyService } from './upload-proxy.service'
import { UploadSessionCronService } from './upload-session-cron.service'
import { UploadSessionController } from './upload-session.controller'
import { UploadSessionService } from './upload-session.service'

@Global()
@Module({
  imports: [ZStackApiModule],
  controllers: [UploadSessionController],
  providers: [
    UploadOffsetResolverService,
    UploadProxyService,
    UploadJobRetryService,
    UploadSessionService,
    UploadSessionCronService
  ],
  exports: [UploadSessionService, UploadProxyService]
})
export class UploadSessionModule {}
