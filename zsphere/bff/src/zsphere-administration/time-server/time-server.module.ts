import { Module } from '@nestjs/common'

import { TimeServerActionModule } from './action/_module'
import { TimeServerResolver } from './time-server.resolver'
import { TimeServerService } from './time-server.service'

@Module({
  imports: [TimeServerActionModule],
  providers: [TimeServerResolver, TimeServerService]
})
export class TimeServerModule {}
