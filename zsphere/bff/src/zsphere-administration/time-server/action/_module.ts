import { Module } from '@nestjs/common'

import { SyncTimeServerService } from './sync-time-server'
import { UpdateTimeServerService } from './update-time-server'

@Module({
  providers: [UpdateTimeServerService, SyncTimeServerService]
})
export class TimeServerActionModule {}
