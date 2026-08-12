import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'

@Module({
  imports: [],
  providers: [LongJobService],
  exports: []
})
export class PlatformCryptoCmplActionModule {}
