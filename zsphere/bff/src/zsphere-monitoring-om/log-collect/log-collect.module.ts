import { Module } from '@nestjs/common'

import { LogCollectActionModule } from './action/_module'
import { LogCollectResolver } from './log-collect.resolver'
import { LogCollectService } from './log-collect.service'

@Module({
  imports: [LogCollectActionModule],
  providers: [LogCollectService, LogCollectResolver]
})
export class LogCollectModule {}
